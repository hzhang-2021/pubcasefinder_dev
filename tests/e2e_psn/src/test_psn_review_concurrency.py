"""Offline checks for conditional Review version replacement."""
import copy
import unittest
from unittest.mock import MagicMock

import test_psn_review_edit_permissions as edit_tests
import test_psn_review_delete_permissions as helpers
import test_psn_review_comment_permissions as comment_tests


class ReviewConcurrencyTest(unittest.TestCase):
    def setUp(self):
        edit_tests.ReviewEditPermissionsTest.setUp(self)
        self.ns.update({'ENUM_VAL_YES': 'YES', 'ENUM_VAL_NO': 'NO'})
        self.cursor.rowcount = 1
        helpers.load_functions('utils/api_psn.py', {'set_review_outdated'}, self.ns)

    def save(self):
        return self.ns['api_psn_regist_review'](1, {
            'input_review_panel_id': 'actual-panel', 'input_review_review_id': 20,
            'input_review_entity_type_id': '1',
        })

    def test_current_version_is_claimed_before_insert(self):
        def insert(cursor, fields):
            sql, params = cursor.execute.call_args.args
            self.assertIn('AND is_latest=%s AND is_deleted=%s', sql)
            self.assertEqual(params, ('NO', 20, 'YES', 'NO'))
            return 21
        self.ns['insert_entity_review'].side_effect = insert
        self.assertEqual(self.save(), {'success': True})
        self.conn.commit.assert_called_once()

    def test_conflict_rolls_back_without_insert_or_log(self):
        self.cursor.rowcount = 0
        self.assertEqual(self.save()['status_code'], 409)
        self.ns['insert_entity_review'].assert_not_called()
        self.ns['add_user_activity_log'].assert_not_called()
        self.conn.commit.assert_not_called()
        self.conn.rollback.assert_called_once()

    def test_two_stale_snapshots_can_only_insert_once(self):
        counts = iter((1, 0))
        def execute(sql, params):
            self.cursor.rowcount = next(counts)
        self.cursor.execute.side_effect = execute
        self.assertEqual(self.save(), {'success': True})
        self.assertEqual(self.save()['status_code'], 409)
        self.ns['insert_entity_review'].assert_called_once()
        self.conn.commit.assert_called_once()

    def test_insert_failure_rolls_back_claim(self):
        self.ns['insert_entity_review'].side_effect = RuntimeError('insert failed')
        self.assertEqual(self.save(), {'error': 'insert failed'})
        self.conn.rollback.assert_called_once()
        self.conn.commit.assert_not_called()


class CommentConcurrencyTest(unittest.TestCase):
    def setUp(self):
        comment_tests.ReviewCommentAddRelationTest.setUp(self)
        self.review = {'review_id': 200, 'original_review_id': 100,
                       'panel_id': 'panel-A', 'user_id': 10, 'modified_at': 'old'}
        self.ns.update({
            'copy': copy, 'ENUM_VAL_YES': 'YES', 'ENUM_VAL_NO': 'NO',
            '_get_newest_panel_review_info': MagicMock(side_effect=lambda *args: dict(self.review)),
            'insert_entity_review': MagicMock(return_value=201),
            '_get_panel_entity_review_comment_info': MagicMock(return_value={
                'original_review_id': 100, 'user_id': 30, 'created_at': 'old'}),
            '_can_manage_review_comment': MagicMock(return_value=True),
            'set_review_comment_outdated': MagicMock(),
        })
        helpers.load_functions('utils/api_psn.py', {
            'set_review_outdated', '_copy_panel_entity_review',
            'api_psn_modify_panel_entity_review_comment',
            'api_psn_delete_panel_entity_review_comment'}, self.ns)

    def invoke(self, action):
        if action == 'add':
            return self.ns['api_psn_add_panel_entity_review_comment'](30, 200, 100, 'comment')
        if action == 'edit':
            return self.ns['api_psn_modify_panel_entity_review_comment'](30, 200, 100, 300, 'comment')
        return self.ns['api_psn_delete_panel_entity_review_comment'](30, 200, 100, 300)

    def test_all_comment_mutations_reject_lost_version_claim(self):
        for action in ('add', 'edit', 'delete'):
            with self.subTest(action=action):
                self.setUp()
                self.cursor.rowcount = 0
                self.assertEqual(self.invoke(action)['status_code'], 409)
                for name in ('insert_entity_review', 'insert_review_comment',
                             'set_review_comment_outdated', 'add_user_activity_log'):
                    self.ns[name].assert_not_called()
                self.connection.rollback.assert_called_once()
                self.connection.commit.assert_not_called()

    def test_comment_copy_claims_version_before_insert(self):
        self.cursor.rowcount = 1
        def insert(cur, fields):
            self.assertEqual(cur.execute.call_args.args[1], ('NO', 200, 'YES', 'NO'))
            return 201
        self.ns['insert_entity_review'].side_effect = insert
        self.assertNotIn('error', self.invoke('add'))
        self.connection.commit.assert_called_once()

    def test_second_comment_snapshot_cannot_create_second_latest_review(self):
        counts = iter((1, 0))
        def execute(sql, params):
            self.cursor.rowcount = next(counts)
        self.cursor.execute.side_effect = execute
        self.assertNotIn('error', self.invoke('add'))
        self.assertEqual(self.invoke('add')['status_code'], 409)
        self.ns['insert_entity_review'].assert_called_once()
        self.connection.commit.assert_called_once()

    def test_comment_write_failure_rolls_back_review_claim(self):
        self.cursor.rowcount = 1
        self.ns['insert_review_comment'].side_effect = RuntimeError('comment failed')
        self.assertEqual(self.invoke('add'), {'error': 'comment failed'})
        self.connection.rollback.assert_called_once()
        self.connection.commit.assert_not_called()


if __name__ == '__main__':
    unittest.main()
