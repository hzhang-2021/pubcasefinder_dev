"""Offline regression checks for Entity Definition deletion."""
import ast
import json
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock


ROOT = Path(__file__).resolve().parents[1]


def load_functions(names, namespace):
    path = ROOT / 'utils/api_psn.py'
    tree = ast.parse(path.read_text(encoding='utf-8'))
    nodes = [node for node in tree.body
             if isinstance(node, ast.FunctionDef) and node.name in names]
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), 'exec'), namespace)


class DefinitionDeleteTest(unittest.TestCase):
    def setUp(self):
        self.cursor = MagicMock()
        self.cursor.rowcount = 1
        self.conn = MagicMock()
        self.conn.__enter__.return_value = self.conn
        self.conn.cursor.return_value.__enter__.return_value = self.cursor
        self.definition = {
            'entity_id': 17, 'panel_id': 'actual-panel', 'entity_name': 'ACTA1',
            'user_id': 3, 'is_latest': 'YES', 'is_deleted': 'NO', 'rating_id': 1,
        }
        self.ns = {
            'get_mysql_connection': lambda: self.conn,
            'MySQLdb': SimpleNamespace(cursors=SimpleNamespace(DictCursor=object)),
            'get_entity_by_id': lambda cursor, entity_id: dict(self.definition),
            'api_is_user_admin': lambda role: role == 'admin',
            'GROUP_USER_ROLE_CURATOR': 'curator',
            'ENUM_VAL_YES': 'YES', 'ENUM_VAL_NO': 'NO',
            '_check_panel_validation': lambda panel_id, cursor: {'status': 'success'},
            'add_user_activity_log': MagicMock(return_value=81),
            '_psn_panel_version_minor_up': MagicMock(),
            '_get_newest_panel_version': MagicMock(return_value=[]),
            'record_user_activity_panel_version': MagicMock(),
            'USER_ACTIVITY_TARGET_DEFINITION': 'definition',
            'USER_ACTIVITY_ACTION_DELETE': 'delete',
            'PANEL_CHANGE_CATEGORY_ENTITY': 'entity',
            'PANEL_VERSION_UPDATE_TYPE_MINOR': 'minor',
            'USER_ACTIVITY_ACTION_ADD': 'add',
            'USER_ACTIVITY_ACTION_CHANGE': 'change',
            'USER_ACTIVITY_ACTION_CLASSIFY': 'classify',
            'USER_ACTIVITY_DETAIL_ACTION_REMOVE': 'remove',
            'json': json,
        }
        load_functions({'_can_manage_panel_definition',
                        'api_psn_delete_panel_entity_definition'}, self.ns)

    def test_admin_deletes_current_definition_and_records_version(self):
        self.cursor.fetchone.return_value = {'user_type': 'admin'}
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertEqual(result, {'success': True})
        update = [call for call in self.cursor.execute.call_args_list
                  if 'UPDATE panelsearch_nando_entity' in call.args[0]]
        self.assertEqual(len(update), 1)
        self.assertEqual(update[0].args[1], ('NO', 'YES', 17, 'YES', 'NO'))
        self.ns['add_user_activity_log'].assert_called_once_with(
            self.cursor, 3, 5, self.definition, None, 'definition', 'delete')
        self.ns['_psn_panel_version_minor_up'].assert_called_once()
        self.ns['record_user_activity_panel_version'].assert_called_once()
        self.conn.commit.assert_called_once()

    def test_assigned_curator_can_delete(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertEqual(result, {'success': True})
        sql, params = self.cursor.execute.call_args_list[1].args
        self.assertIn('gp.group_id = gu.group_id', sql)
        self.assertEqual(params, (5, 'curator', 'actual-panel'))

    def test_imported_definition_uses_actor_for_activity_owner(self):
        self.definition['user_id'] = None
        self.cursor.fetchone.return_value = {'user_type': 'admin'}
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertEqual(result, {'success': True})
        args = self.ns['add_user_activity_log'].call_args.args
        self.assertEqual(args[1:3], (5, 5))

    def test_unassigned_user_cannot_delete(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertEqual(result['status_code'], 403)
        self.ns['add_user_activity_log'].assert_not_called()
        self.conn.commit.assert_not_called()

    def test_already_deleted_definition_cannot_be_deleted_again(self):
        self.definition['is_deleted'] = 'YES'
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertEqual(result['status_code'], 404)
        self.conn.commit.assert_not_called()

    def test_concurrent_change_rolls_back(self):
        self.cursor.fetchone.return_value = {'user_type': 'admin'}
        self.cursor.rowcount = 0
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertEqual(result['status_code'], 409)
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()

    def test_version_failure_rolls_back_deletion(self):
        self.cursor.fetchone.return_value = {'user_type': 'admin'}
        self.ns['_psn_panel_version_minor_up'].side_effect = RuntimeError('version failed')
        result = self.ns['api_psn_delete_panel_entity_definition'](5, 17)
        self.assertIn('version failed', result['error'])
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()

    def test_definition_deletion_remains_delete_in_activity_log(self):
        load_functions({'add_user_activity_log'}, self.ns)
        self.ns['add_user_activity_log'](
            self.cursor, 3, 5, self.definition, None, 'definition', 'delete')
        payload = self.cursor.execute.call_args.args[1]
        self.assertEqual(payload['action'], 'delete')
        self.assertEqual(payload['former_entity_id'], 17)


if __name__ == '__main__':
    unittest.main()
