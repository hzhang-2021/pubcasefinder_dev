"""Browser tests for /panelsearch_nanbyo_admin_user."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_user'


def test_admin_user_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_admin_user_filter_no_match(root_page, psn_config):
    term = psn_config.cases[PAGE]['no_match_text']
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_admin_load_user')) as result:
        root_page.locator('#filter_letter').fill(term)
    assert_json_response(result.value)
    expect(root_page.locator('#total_num')).to_have_text('0')
    take_screenshot(root_page, psn_config, PAGE + '_no_match')
