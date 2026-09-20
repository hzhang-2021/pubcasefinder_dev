"""Offline regression checks for definition edit authorization."""
import ast
import unittest
from unittest.mock import MagicMock

import test_psn_definition_delete as definition_delete
from test_psn_definition_delete import load_functions


class DefinitionEditTest(unittest.TestCase):
    def setUp(self):
        definition_delete.DefinitionDeleteTest.setUp(self)
        self.ns['MySQLdb'].IntegrityError = type('IntegrityError', (Exception,), {})
        self.ns.update({
            'ENTITY_TYPE_ID_GENE': '1',
            'set_entity_outdated': MagicMock(),
            'record_entity_panel_version': MagicMock(),
        })
        self.cursor.lastrowid = 18
        self.cursor.fetchone.return_value = {'user_type': 'admin'}
        self.data = {
            'input_definition_review_id': 17,
            'input_definition_panel_id': 'actual-panel',
            'input_definition_entity_type_id': '1',
            'input_definition_gene_symbol': 'ACTA1',
            'input_definition_rating_id': 1,
        }
        load_functions({'api_psn_regist_panel_entity_definition'}, self.ns)

    def save(self):
        return self.ns['api_psn_regist_panel_entity_definition'](5, self.data)

    def assert_no_writes(self):
        for call in self.cursor.execute.call_args_list:
            self.assertTrue(call.args[0].lstrip().upper().startswith('SELECT'))
        self.ns['set_entity_outdated'].assert_not_called()
        self.ns['add_user_activity_log'].assert_not_called()
        self.ns['_psn_panel_version_minor_up'].assert_not_called()
        self.conn.commit.assert_not_called()

    def test_cross_panel_edit_rejected_even_for_admin(self):
        self.data['input_definition_panel_id'] = 'other-panel'
        self.assertEqual(self.save()['status_code'], 400)
        self.assert_no_writes()

    def test_cross_panel_curator_cannot_invalidate_foreign_entity(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        self.data['input_definition_panel_id'] = 'curator-panel'
        self.assertEqual(self.save()['status_code'], 400)
        self.assert_no_writes()

    def test_missing_entity_is_rejected(self):
        self.ns['get_entity_by_id'] = lambda *args: None
        self.assertEqual(self.save()['status_code'], 404)
        self.assert_no_writes()

    def test_unassigned_user_cannot_edit(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.assertEqual(self.save()['status_code'], 403)
        self.assert_no_writes()

    def test_admin_can_edit_and_original_owner_is_preserved(self):
        self.assertEqual(self.save(), {'success': True})
        writes = [call for call in self.cursor.execute.call_args_list
                  if not call.args[0].lstrip().upper().startswith('SELECT')]
        self.assertEqual(len(writes), 2)
        self.assertIn('UPDATE panelsearch_nando_entity', writes[0].args[0])
        self.assertIn('AND is_latest = %s AND is_deleted = %s', writes[0].args[0])
        self.assertEqual(writes[0].args[1], ('NO', 17, 'YES', 'NO'))
        self.assertIn('INSERT INTO panelsearch_nando_entity', writes[1].args[0])
        self.assertEqual(self.ns['add_user_activity_log'].call_args.args[1:3], (3, 5))
        self.conn.commit.assert_called_once()

    def test_assigned_curator_can_edit(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        self.assertEqual(self.save(), {'success': True})
        self.assertEqual(self.cursor.execute.call_args_list[1].args[1],
                         (5, 'curator', 'actual-panel'))
        self.conn.commit.assert_called_once()

    def test_authorized_creation_still_works(self):
        self.data.pop('input_definition_review_id')
        self.assertEqual(self.save(), {'success': True})
        self.ns['set_entity_outdated'].assert_not_called()
        self.conn.commit.assert_called_once()

    def test_unassigned_user_cannot_create(self):
        self.data.pop('input_definition_review_id')
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.assertEqual(self.save()['status_code'], 403)
        self.assert_no_writes()

    def test_stale_definition_is_rejected_without_writes(self):
        self.definition['is_latest'] = 'NO'
        self.assertEqual(self.save()['status_code'], 409)
        self.assert_no_writes()

    def test_deleted_definition_is_rejected_without_writes(self):
        self.definition['is_deleted'] = 'YES'
        self.assertEqual(self.save()['status_code'], 409)
        self.assert_no_writes()

    def test_concurrent_edit_or_delete_prevents_insert(self):
        # The read saw a current entity, but another transaction claimed it first.
        self.cursor.rowcount = 0
        self.assertEqual(self.save()['status_code'], 409)
        self.assertFalse(any('INSERT' in call.args[0]
                             for call in self.cursor.execute.call_args_list))
        self.ns['add_user_activity_log'].assert_not_called()
        self.ns['_psn_panel_version_minor_up'].assert_not_called()
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()

    def test_second_save_with_stale_snapshot_cannot_insert_another_version(self):
        current = True
        inserts = []

        def execute(sql, params):
            nonlocal current
            if 'UPDATE panelsearch_nando_entity' in sql:
                self.cursor.rowcount = int(current)
                current = False
            elif 'INSERT INTO panelsearch_nando_entity' in sql:
                inserts.append(params)
                self.cursor.rowcount = 1

        self.cursor.execute.side_effect = execute
        self.assertEqual(self.save(), {'success': True})
        # Even when both reads see the original snapshot, the conditional write wins once.
        self.assertEqual(self.save()['status_code'], 409)
        self.assertEqual(len(inserts), 1)
        self.conn.commit.assert_called_once()
        self.conn.rollback.assert_called_once()

    def test_insert_failure_rolls_back_claim(self):
        def execute(sql, params):
            if 'INSERT INTO panelsearch_nando_entity' in sql:
                raise RuntimeError('insert failed')

        self.cursor.execute.side_effect = execute
        self.assertIn('insert failed', self.save()['error'])
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()
        self.ns['add_user_activity_log'].assert_not_called()

    def test_version_failure_rolls_back_claim_and_insert(self):
        self.ns['_psn_panel_version_minor_up'].side_effect = RuntimeError('version failed')
        self.assertIn('version failed', self.save()['error'])
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()

    def test_route_returns_api_error_status(self):
        path = definition_delete.ROOT / 'app.py'
        tree = ast.parse(path.read_text(encoding='utf-8'))
        node = next(n for n in tree.body if isinstance(n, ast.FunctionDef)
                    and n.name == 'panelsearch_nanbyo_regist_entity_definition')
        node.decorator_list = []
        self.ns.update({
            'get_user_info_from_session': lambda service: (5, None, {'id': 5, 'user_type': 'admin'}),
            'SERVICE_PANELSEARCH_NANBYO': 'panelsearch_nanbyo',
            'request': MagicMock(), 'jsonify': lambda response: response,
            'check_api_response_error': MagicMock(),
        })
        self.ns['request'].get_json.return_value = self.data
        exec(compile(ast.Module(body=[node], type_ignores=[]), str(path), 'exec'), self.ns)
        for status in [400, 403, 404, 409]:
            response = {'error': 'rejected', 'status_code': status}
            self.ns['api_psn_regist_panel_entity_definition'] = MagicMock(return_value=response)
            self.assertEqual(self.ns['panelsearch_nanbyo_regist_entity_definition'](),
                             (response, status))


if __name__ == '__main__':
    unittest.main()
