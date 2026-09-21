"""Offline regression tests for review editing authorization."""
import unittest
from unittest.mock import MagicMock

import test_psn_review_delete_permissions as delete_tests


class ReviewEditPermissionsTest(unittest.TestCase):
    def setUp(self):
        delete_tests.ReviewDeletePermissionsTest.setUp(self)
        self.review['created_at'] = '2026-09-16'
        self.ns.update({
            'build_review_fields': lambda *args: {'entity_name': 'ACTA1', 'extra': {}},
            '_check_panel_validation': lambda *args: {},
            'insert_entity_review': MagicMock(return_value=21),
            'set_review_outdated': MagicMock(),
            'set_original_review_id': MagicMock(),
            'record_review_panel_version': MagicMock(),
            'USER_ACTIVITY_ACTION_ADD': 'add',
            'USER_ACTIVITY_ACTION_CHANGE': 'change',
        })
        delete_tests.load_functions('utils/api_psn.py', {'api_psn_regist_review'}, self.ns)

    def edit(self, actor, expected_status=200, panel='actual-panel', review_id=20):
        result = self.ns['api_psn_regist_review'](actor, {
            'input_review_panel_id': panel,
            'input_review_review_id': review_id,
            'input_review_entity_type_id': '1',
        })
        self.assertEqual(result.get('status_code', 200), expected_status)
        if expected_status == 200:
            self.assertEqual(result, {'success': True})
            self.conn.commit.assert_called_once()
            fields = self.ns['insert_entity_review'].call_args.args[1]
            self.assertEqual(fields['user_id'], 1 if review_id else actor)
            self.assertEqual(fields['user_id_change'], actor)
            if review_id:
                self.assertEqual(fields['original_review_id'], 10)
                self.ns['set_review_outdated'].assert_called_once_with(self.cursor, 20)
        else:
            self.ns['insert_entity_review'].assert_not_called()
            self.ns['set_review_outdated'].assert_not_called()
            self.conn.commit.assert_not_called()

    def test_original_author_can_edit_after_another_editor(self):
        self.edit(1)

    def test_admin_can_edit_any_review(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'admin'}]
        self.edit(3)

    def test_assigned_group_curator_can_edit(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        self.edit(3)
        self.assertEqual(self.cursor.execute.call_args.args[1], (3, 'curator', 'actual-panel', 'YES'))

    def test_unrelated_curator_or_reviewer_is_denied(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.edit(3, 403)

    def test_last_editor_does_not_become_author(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.edit(2, 403)

    def test_forged_panel_does_not_grant_permission(self):
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, None]
        self.edit(3, 403, panel='curators-other-panel')
        self.assertEqual(self.cursor.execute.call_args.args[1], (3, 'curator', 'actual-panel', 'YES'))

    def test_author_cannot_move_review_to_another_panel(self):
        self.edit(1, 400, panel='other-panel')

    def test_new_review_creation_is_preserved(self):
        self.edit(3, review_id=None)

    def test_stale_author_edit_is_rejected_without_writes(self):
        self.review['review_id'] = 21
        self.edit(1, 409, review_id=20)
        self.ns['add_user_activity_log'].assert_not_called()
        self.ns['record_review_panel_version'].assert_not_called()
        self.ns['record_user_activity_panel_version'].assert_not_called()

    def test_stale_admin_edit_is_rejected(self):
        self.review['review_id'] = 21
        self.cursor.fetchone.side_effect = [{'user_type': 'admin'}]
        self.edit(3, 409, review_id=20)

    def test_stale_assigned_curator_edit_is_rejected(self):
        self.review['review_id'] = 21
        self.cursor.fetchone.side_effect = [{'user_type': 'member'}, {'1': 1}]
        self.edit(3, 409, review_id=20)

    def test_current_review_id_as_string_is_accepted(self):
        self.edit(1, review_id='20')


if __name__ == '__main__':
    unittest.main()
