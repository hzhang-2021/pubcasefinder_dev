"""Offline permission tests for Review Comment modification and deletion."""
import ast
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock


ROOT = Path(__file__).resolve().parents[1]


def load_functions(path, names, namespace):
    tree = ast.parse((ROOT / path).read_text(encoding='utf-8'))
    nodes = [node for node in tree.body
             if isinstance(node, ast.FunctionDef) and node.name in names]
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), 'exec'), namespace)


class ReviewCommentPermissionsTest(unittest.TestCase):
    def setUp(self):
        self.cursor = MagicMock()
        self.review = {'user_id': 10, 'panel_id': 'NANDO:1200477'}
        self.comment = {'user_id': 20}
        self.ns = {
            'api_is_user_admin': lambda role: role == 'admin',
            'GROUP_USER_ROLE_CURATOR': 'curator',
        }
        load_functions(
            'utils/api_psn.py',
            {'_is_admin_or_panel_curator', '_can_manage_review_comment'},
            self.ns,
        )

    def can_manage(self, actor):
        return self.ns['_can_manage_review_comment'](
            self.cursor, actor, self.comment, self.review)

    def test_comment_author_can_manage_own_comment(self):
        self.assertTrue(self.can_manage(20))
        self.cursor.execute.assert_not_called()

    def test_review_author_cannot_manage_another_users_comment(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.assertFalse(self.can_manage(10))

    def test_admin_can_manage_any_comment(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'admin'}]
        self.assertTrue(self.can_manage(30))

    def test_assigned_curator_can_manage_any_comment(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        self.assertTrue(self.can_manage(30))
        sql, params = self.cursor.execute.call_args.args
        self.assertEqual(params, (30, 'curator', 'NANDO:1200477'))
        self.assertIn('gp.panel_id = %s', sql)

    def test_unrelated_logged_in_user_cannot_manage_comment(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.assertFalse(self.can_manage(30))

    def test_unknown_user_cannot_manage_comment(self):
        self.cursor.fetchone.return_value = None
        self.assertFalse(self.can_manage(30))


class ReviewCommentApiAuthorizationTest(unittest.TestCase):
    def setUp(self):
        self.cursor = MagicMock()
        self.connection = MagicMock()
        self.connection.__enter__.return_value = self.connection
        self.connection.cursor.return_value.__enter__.return_value = self.cursor
        self.copy_review = MagicMock()
        self.can_manage = MagicMock(return_value=False)
        self.ns = {
            'get_mysql_connection': lambda: self.connection,
            'MySQLdb': SimpleNamespace(
                cursors=SimpleNamespace(DictCursor=object()),
                IntegrityError=RuntimeError,
            ),
            '_check_panel_validation_by_review': lambda review_id, cursor: {},
            '_get_panel_entity_review_comment_info': lambda comment_id, cursor: {
                'user_id': 20,
                'original_review_id': 100,
            },
            'get_former_review': lambda cursor, review_id: {
                'panel_id': 'NANDO:1200477',
                'original_review_id': 100,
            },
            '_can_manage_review_comment': self.can_manage,
            '_copy_panel_entity_review': self.copy_review,
        }
        load_functions(
            'utils/api_psn.py',
            {
                'api_psn_modify_panel_entity_review_comment',
                'api_psn_delete_panel_entity_review_comment',
            },
            self.ns,
        )

    def call_api(self, action, original_review_id=100):
        if action == 'edit':
            return self.ns['api_psn_modify_panel_entity_review_comment'](
                30, 200, original_review_id, 300, '更新後コメント')
        return self.ns['api_psn_delete_panel_entity_review_comment'](
            30, 200, original_review_id, 300)

    def test_unauthorized_request_returns_403_before_copying_review(self):
        for action in ('edit', 'delete'):
            with self.subTest(action=action):
                response = self.call_api(action)
                self.assertEqual(response['status_code'], 403)
                self.copy_review.assert_not_called()
                self.connection.commit.assert_not_called()

    def test_mismatched_review_relation_returns_400_before_authorization(self):
        for action in ('edit', 'delete'):
            with self.subTest(action=action):
                response = self.call_api(action, original_review_id=999)
                self.assertEqual(response['status_code'], 400)
                self.can_manage.assert_not_called()
                self.copy_review.assert_not_called()


class ReviewCommentLookupTest(unittest.TestCase):
    def test_lookup_returns_original_review_id_for_relation_check(self):
        cursor = MagicMock()
        cursor.fetchone.return_value = {'review_comment_id': 300}
        namespace = {'ENUM_VAL_YES': 'YES'}
        load_functions(
            'utils/api_psn.py',
            {'_get_panel_entity_review_comment_info'},
            namespace,
        )

        result = namespace['_get_panel_entity_review_comment_info'](300, cursor)

        sql, params = cursor.execute.call_args.args
        self.assertIn('original_review_id', sql)
        self.assertEqual(params, (300, 'YES'))
        self.assertEqual(result, {'review_comment_id': 300})


class ReviewCommentAddRelationTest(unittest.TestCase):
    def setUp(self):
        self.cursor = MagicMock()
        self.connection = MagicMock()
        self.connection.__enter__.return_value = self.connection
        self.connection.cursor.return_value.__enter__.return_value = self.cursor
        self.ns = {
            'get_mysql_connection': lambda: self.connection,
            'MySQLdb': SimpleNamespace(cursors=SimpleNamespace(DictCursor=object),
                                      IntegrityError=RuntimeError),
            'get_former_review': MagicMock(return_value={'original_review_id': 100}),
            '_check_panel_validation_by_review': MagicMock(return_value={}),
            '_copy_panel_entity_review': MagicMock(return_value=(
                {'user_id': 10}, {'review_id': 201, 'panel_id': 'panel-A'})),
            '_get_newest_panel_version': MagicMock(return_value=[]),
            'record_review_panel_version': MagicMock(),
            'insert_review_comment': MagicMock(return_value=300),
            'add_user_activity_log': MagicMock(return_value=400),
            'record_user_activity_panel_version': MagicMock(),
            'USER_ACTIVITY_TARGET_REVIEW': 'review',
            'USER_ACTIVITY_ACTION_CHANGE': 'change',
        }
        load_functions('utils/api_psn.py', {'api_psn_add_panel_entity_review_comment'}, self.ns)

    def add(self, original_id=100):
        return self.ns['api_psn_add_panel_entity_review_comment'](30, 200, original_id, 'comment')

    def assert_no_mutation(self):
        for name in ('_copy_panel_entity_review', 'insert_review_comment',
                     'record_review_panel_version', 'add_user_activity_log',
                     'record_user_activity_panel_version'):
            self.ns[name].assert_not_called()
        self.connection.commit.assert_not_called()

    def test_unrelated_original_review_is_rejected_before_any_mutation(self):
        self.assertEqual(self.add(999)['status_code'], 400)
        self.assert_no_mutation()

    def test_missing_review_is_rejected(self):
        self.ns['get_former_review'].return_value = None
        self.assertEqual(self.add()['status_code'], 404)
        self.assert_no_mutation()

    def test_matching_pair_still_checks_panel_validity(self):
        self.ns['_check_panel_validation_by_review'].return_value = {'error': 'invalid panel'}
        self.assertEqual(self.add(), {'error': 'invalid panel'})
        self.assert_no_mutation()

    def test_matching_ids_create_comment(self):
        self.assertEqual(self.add(), {'suceed': 'done', 'review_comment_id': 300})
        self.ns['get_former_review'].assert_called_once_with(self.cursor, 200)
        self.ns['_check_panel_validation_by_review'].assert_called_once_with(200, self.cursor)
        self.ns['_copy_panel_entity_review'].assert_called_once_with(30, 100, self.cursor)
        self.ns['insert_review_comment'].assert_called_once_with(
            self.cursor, 201, 100, 'comment', None, 30, 30)
        self.connection.commit.assert_called_once()

    def test_string_id_uses_database_original_id(self):
        self.assertNotIn('error', self.add('100'))
        self.ns['_copy_panel_entity_review'].assert_called_once_with(30, 100, self.cursor)

    def test_comment_insert_failure_rolls_back(self):
        self.ns['insert_review_comment'].side_effect = RuntimeError('insert failed')
        self.assertEqual(self.add(), {'error': 'insert failed'})
        self.connection.rollback.assert_called_once()
        self.connection.commit.assert_not_called()

    def test_route_propagates_relation_errors_and_success(self):
        tree = ast.parse((ROOT / 'app.py').read_text(encoding='utf-8'))
        node = next(n for n in tree.body if isinstance(n, ast.FunctionDef)
                    and n.name == 'panelsearch_nanbyo_add_panel_entity_review_comment')
        node.decorator_list = []
        self.ns.update({
            'get_user_info_from_session': lambda service: (30, None, {'id': 30}),
            'SERVICE_PANELSEARCH_NANBYO': 'panelsearch_nanbyo',
            'request': MagicMock(), 'jsonify': lambda body: body,
            'check_api_response_error': MagicMock(),
        })
        self.ns['request'].get_json.return_value = {
            'review_id': 200, 'original_review_id': 100, 'comment': 'comment'}
        exec(compile(ast.Module(body=[node], type_ignores=[]), 'app.py', 'exec'), self.ns)
        for response, status in [({'error': 'mismatch', 'status_code': 400}, 400),
                                 ({'error': 'missing', 'status_code': 404}, 404),
                                 ({'suceed': 'done'}, 200)]:
            self.ns['api_psn_add_panel_entity_review_comment'] = MagicMock(return_value=response)
            self.assertEqual(self.ns['panelsearch_nanbyo_add_panel_entity_review_comment'](),
                             (response, status))


if __name__ == '__main__':
    unittest.main()
