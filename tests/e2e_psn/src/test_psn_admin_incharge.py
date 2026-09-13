"""Browser tests for /panelsearch_nanbyo_admin_incharge."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_incharge'


def test_admin_incharge_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)
