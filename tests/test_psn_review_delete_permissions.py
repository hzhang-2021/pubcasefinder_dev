"""Offline permission regression tests; no application startup or database writes."""
import ast
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock


ROOT = Path(__file__).resolve().parents[1]


def load_functions(path, names, namespace):
    # Load the real functions without Flask config / MySQL import side effects.
    tree = ast.parse((ROOT / path).read_text(encoding='utf-8'))
    nodes = [node for node in tree.body
             if isinstance(node, ast.FunctionDef) and node.name in names]
    for node in nodes:
        node.decorator_list = []
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), 'exec'), namespace)


class ReviewDeletePermissionsTest(unittest.TestCase):
    def setUp(self):
        self.cursor = MagicMock()
        self.conn = MagicMock()
        self.conn.__enter__.return_value = self.conn
        self.conn.cursor.return_value.__enter__.return_value = self.cursor
        self.review = {'review_id': 20, 'original_review_id': 10,
                       'user_id': 1, 'user_id_change': 2, 'panel_id': 'actual-panel'}
        self.ns = {
            'api_is_user_admin': lambda role: role == 'admin',
            'GROUP_USER_ROLE_CURATOR': 'curator',
            'get_mysql_connection': lambda: self.conn,
            'MySQLdb': SimpleNamespace(cursors=SimpleNamespace(DictCursor=object),
                                       IntegrityError=RuntimeError),
            '_check_panel_validation_by_review': lambda *args: {},
            'get_former_review': lambda *args: dict(self.review),
            'get_review_comment_id_list': lambda *args: [],
            '_get_newest_panel_version': lambda *args: [],
            'delete_review': MagicMock(),
            'delete_all_review_comment': MagicMock(),
            'add_user_activity_log': MagicMock(),
            'record_user_activity_panel_version': MagicMock(),
            'USER_ACTIVITY_TARGET_REVIEW': 'review',
            'USER_ACTIVITY_ACTION_DELETE': 'delete',
        }
        load_functions('utils/api_psn.py',
                       {'_is_admin_or_panel_curator', '_can_manage_panel_review',
                        'api_psn_delete_panel_entity_review'}, self.ns)

    def delete(self, actor, allowed):
        # Forged request ownership / panel must not determine authorization.
        result = self.ns['api_psn_delete_panel_entity_review'](
            actor, {'review_id': 20, 'user_id': actor, 'panel_id': 'forged-panel'})
        if allowed:
            self.assertEqual(result, {'suceed': 'done'})
            self.ns['delete_review'].assert_called_once_with(self.cursor, 10)
            self.ns['delete_all_review_comment'].assert_called_once_with(self.cursor, 10)
            self.conn.commit.assert_called_once()
            args = self.ns['add_user_activity_log'].call_args.args
            self.assertEqual(args[1:3], (1, actor))
        else:
            self.assertEqual(result['status_code'], 403)
            self.ns['delete_review'].assert_not_called()
            self.ns['delete_all_review_comment'].assert_not_called()
            self.conn.commit.assert_not_called()

    def test_original_author_after_someone_else_edited(self):
        self.delete(1, True)

    def test_admin_can_delete_other_authors_review(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'admin'}]
        self.delete(3, True)

    def test_curator_of_assigned_panel(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        self.delete(3, True)
        sql, params = self.cursor.execute.call_args.args
        self.assertEqual(params, (3, 'curator', 'actual-panel'))
        self.assertIn('gp.group_id = gu.group_id', sql)
        self.assertIn('gu.user_role = %s', sql)
        self.assertIn('gp.panel_id = %s', sql)

    def test_unrelated_curator_or_reviewer_cannot_delete(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.delete(3, False)

    def test_last_editor_is_not_original_author(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.delete(2, False)

    def test_unknown_user_cannot_delete(self):
        self.cursor.fetchone.return_value = None
        self.delete(3, False)


if __name__ == '__main__':
    unittest.main()
