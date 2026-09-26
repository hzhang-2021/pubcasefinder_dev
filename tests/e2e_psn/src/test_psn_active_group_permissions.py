"""Execute real permission queries against an in-memory membership database."""
import sqlite3
import unittest

from test_psn_review_delete_permissions import load_functions


class ActiveGroupPermissionsTest(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(':memory:')
        self.addCleanup(self.db.close)
        self.db.row_factory = sqlite3.Row
        self.db.executescript("""
            CREATE TABLE user_info_psn (id INTEGER, user_type TEXT);
            CREATE TABLE panelsearch_nando_group (group_id INTEGER, isValid TEXT);
            CREATE TABLE panelsearch_nando_group_user
                (group_id INTEGER, user_id INTEGER, user_role TEXT);
            CREATE TABLE panelsearch_nando_group_panel (group_id INTEGER, panel_id TEXT);
            INSERT INTO user_info_psn VALUES (1, 'user'), (2, 'admin');
            INSERT INTO panelsearch_nando_group VALUES (10, 'YES');
            INSERT INTO panelsearch_nando_group_user VALUES (10, 1, 'curator');
            INSERT INTO panelsearch_nando_group_panel VALUES (10, 'panel');
        """)
        self.ns = {'ENUM_VAL_YES': 'YES', 'GROUP_USER_ROLE_CURATOR': 'curator',
                   'api_is_user_admin': lambda role: role == 'admin',
                   'fetch_one': self.fetch_one}
        load_functions('utils/api_psn.py',
                       {'_can_manage_panel_definition', '_is_admin_or_panel_curator',
                        'api_psn_group_get_user_role_of_panel', '_can_manage_panel_review',
                        '_can_manage_review_comment'}, self.ns)

    def execute(self, sql, params):
        self.result = self.db.execute(sql.replace('%s', '?'), params)

    def fetchone(self):
        return self.result.fetchone()

    def fetch_one(self, sql, params, dict_cursor=False):
        self.execute(sql, params)
        return self.fetchone()

    def assert_permissions(self, allowed, role, actor=1, panel='panel'):
        for name in ('_can_manage_panel_definition', '_is_admin_or_panel_curator'):
            with self.subTest(helper=name):
                self.assertEqual(self.ns[name](self, actor, panel), allowed)
        result = self.ns['api_psn_group_get_user_role_of_panel'](actor, panel)
        self.assertEqual(result['user_role'] if result else None, role)

    def test_active_curator_has_permissions(self):
        self.assert_permissions(True, 'curator')

    def test_soft_deleted_group_retains_links_but_loses_permissions(self):
        self.db.execute("UPDATE panelsearch_nando_group SET isValid = 'NO'")
        self.assert_permissions(False, None)

    def test_missing_group_does_not_grant_permissions(self):
        self.db.execute('DELETE FROM panelsearch_nando_group')
        self.assert_permissions(False, None)

    def test_other_active_group_preserves_permissions(self):
        self.db.executescript("""
            UPDATE panelsearch_nando_group SET isValid = 'NO';
            INSERT INTO panelsearch_nando_group VALUES (11, 'YES');
            INSERT INTO panelsearch_nando_group_user VALUES (11, 1, 'curator');
            INSERT INTO panelsearch_nando_group_panel VALUES (11, 'panel');
        """)
        self.assert_permissions(True, 'curator')

    def test_active_reviewer_cannot_manage_panel(self):
        self.db.execute("UPDATE panelsearch_nando_group_user SET user_role = 'reviewer'")
        self.assert_permissions(False, 'reviewer')

    def test_other_panel_is_not_authorized(self):
        self.assert_permissions(False, None, panel='other')

    def test_admin_does_not_require_active_group(self):
        self.db.execute("UPDATE panelsearch_nando_group SET isValid = 'NO'")
        self.assert_permissions(True, None, actor=2)

    def test_author_rights_are_preserved(self):
        self.db.execute("UPDATE panelsearch_nando_group SET isValid = 'NO'")
        review = {'user_id': 1, 'panel_id': 'panel'}
        self.assertTrue(self.ns['_can_manage_panel_review'](self, 1, review))
        self.assertTrue(self.ns['_can_manage_review_comment'](
            self, 1, {'user_id': 1}, review))
        review['user_id'] = 3
        self.assertFalse(self.ns['_can_manage_panel_review'](self, 1, review))
        self.assertFalse(self.ns['_can_manage_review_comment'](
            self, 1, {'user_id': 3}, review))
