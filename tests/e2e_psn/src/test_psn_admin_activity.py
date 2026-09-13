"""Browser tests for /panelsearch_nanbyo_admin_activity."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_activity'


def test_admin_activity_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_activity_date_filter(root_page, psn_config):
    value = psn_config.cases[PAGE]['from_date']
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_admin_load_activity')) as result:
        root_page.locator('#dateFrom').fill(value)
        root_page.locator('#dateFrom').blur()
    assert_json_response(result.value)
    expect(root_page.locator('#dateFrom')).to_have_value(value)
    expect(root_page.locator('#activity_table')).to_be_visible()
