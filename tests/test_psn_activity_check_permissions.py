"""Offline authorization checks for activity confirmation and cancellation."""
import ast
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock

ROOT = Path(__file__).resolve().parents[1]


class ActivityCheckPermissionsTest(unittest.TestCase):
    def setUp(self):
        self.cursor = MagicMock()
        self.conn = MagicMock()
        self.conn.__enter__.return_value = self.conn
        self.conn.cursor.return_value.__enter__.return_value = self.cursor
        self.ns = {
            'get_mysql_connection': MagicMock(return_value=self.conn),
            'MySQLdb': SimpleNamespace(cursors=SimpleNamespace(DictCursor=object)),
            'api_is_user_admin': lambda role: role == 'admin',
            'GROUP_USER_ROLE_CURATOR': 'curator', 'ENUM_VAL_YES': 'YES',
        }
        names = {'_psn_set_user_activity_checked', 'api_psn_check_user_activity',
                 'api_psn_uncheck_user_activity'}
        tree = ast.parse((ROOT / 'utils/api_psn.py').read_text(encoding='utf-8'))
        nodes = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
        exec(compile(ast.Module(body=nodes, type_ignores=[]), 'api_psn.py', 'exec'), self.ns)

    def call(self, checked, activity_id='71'):
        name = 'api_psn_check_user_activity' if checked else 'api_psn_uncheck_user_activity'
        return self.ns[name](5, activity_id)

    def assert_no_writes(self):
        for call in self.cursor.execute.call_args_list:
            self.assertTrue(call.args[0].lstrip().startswith('SELECT'))
        self.conn.commit.assert_not_called()

    def test_unassigned_curator_and_inactive_membership_are_denied(self):
        for checked in (True, False):
            with self.subTest(checked=checked):
                self.setUp()
                self.cursor.fetchone.side_effect = [{'panel_id': 'target'}, {'user_type': 'member'}, None]
                self.assertEqual(self.call(checked)['status_code'], 403)
                sql, params = self.cursor.execute.call_args.args
                self.assertIn('g.isValid = %s AND gp.panel_id = %s', sql)
                self.assertIn('gu.user_role = %s', sql)
                self.assertEqual(params, (5, 'curator', 'YES', 'target'))
                self.assert_no_writes()

    def test_assigned_curator_can_check_and_uncheck_only_own_record(self):
        for checked in (True, False):
            with self.subTest(checked=checked):
                self.setUp()
                self.cursor.fetchone.side_effect = [{'panel_id': 'target'}, {'user_type': 'member'}, {'1': 1}]
                self.assertEqual(self.call(checked), {'suceed': 'done'})
                sql, params = self.cursor.execute.call_args.args
                self.assertIn('INSERT IGNORE' if checked else 'WHERE user_id = %s AND activity_id = %s', sql)
                self.assertEqual(params, (5, 71))
                self.conn.commit.assert_called_once()

    def test_admin_can_check_and_uncheck_without_group_membership(self):
        for checked in (True, False):
            self.setUp()
            self.cursor.fetchone.side_effect = [{'panel_id': 'target'}, {'user_type': 'admin'}]
            self.assertEqual(self.call(checked), {'suceed': 'done'})
            self.assertEqual(self.cursor.execute.call_count, 3)
            self.conn.commit.assert_called_once()

    def test_missing_activity_is_rejected(self):
        for checked in (True, False):
            self.setUp()
            self.cursor.fetchone.return_value = None
            self.assertEqual(self.call(checked)['status_code'], 404)
            self.assert_no_writes()

    def test_missing_user_is_rejected(self):
        for checked in (True, False):
            self.setUp()
            self.cursor.fetchone.side_effect = [{'panel_id': 'target'}, None]
            self.assertEqual(self.call(checked)['status_code'], 403)
            self.assert_no_writes()

    def test_invalid_id_never_opens_database(self):
        for checked in (True, False):
            for value in (None, '', 'abc', '0', '-1'):
                self.assertEqual(self.call(checked, value)['status_code'], 400)
        self.ns['get_mysql_connection'].assert_not_called()

    def test_database_error_rolls_back(self):
        for checked in (True, False):
            self.setUp()
            self.cursor.fetchone.side_effect = [{'panel_id': 'target'}, {'user_type': 'admin'}]
            self.cursor.execute.side_effect = [None, None, RuntimeError('write failed')]
            self.assertEqual(self.call(checked), {'error': 'write failed'})
            self.conn.rollback.assert_called_once()
            self.conn.commit.assert_not_called()

    def test_routes_propagate_error_status(self):
        names = {'panelsearch_nanbyo_admin_check_user_activity', 'panelsearch_nanbyo_admin_uncheck_user_activity'}
        tree = ast.parse((ROOT / 'app.py').read_text(encoding='utf-8'))
        nodes = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
        for node in nodes:
            node.decorator_list = []
        self.ns.update({
            'get_user_info_from_session': lambda service: (5, None, {'id': 5, 'user_type': 'admin'}),
            'SERVICE_PANELSEARCH_NANBYO_ADMIN': 'admin', 'request': MagicMock(),
            'jsonify': lambda value: value, 'check_api_response_error': MagicMock(),
        })
        exec(compile(ast.Module(body=nodes, type_ignores=[]), 'app.py', 'exec'), self.ns)
        for status in (400, 403, 404, 200):
            response = {'status_code': status}
            for api in ('api_psn_check_user_activity', 'api_psn_uncheck_user_activity'):
                self.ns[api] = MagicMock(return_value=response)
            for name in names:
                self.assertEqual(self.ns[name](), (response, status))


if __name__ == '__main__':
    unittest.main()
