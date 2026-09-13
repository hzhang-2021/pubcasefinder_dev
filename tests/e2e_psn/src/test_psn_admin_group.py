"""Browser tests for /panelsearch_nanbyo_admin_group."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_group'


def test_admin_group_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_group_filter_no_match(root_page, psn_config):
    root_page.locator('#group_filter').fill(psn_config.cases[PAGE]['no_match_text'])
    expect(root_page.locator('#group_list_table_tbody tr:visible')).to_have_count(0)
    take_screenshot(root_page, psn_config, 'group_no_match')
