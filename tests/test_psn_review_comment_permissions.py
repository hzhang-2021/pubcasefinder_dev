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


if __name__ == '__main__':
    unittest.main()
