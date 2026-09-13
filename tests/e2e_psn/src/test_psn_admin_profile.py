"""Browser tests for /panelsearch_nanbyo_admin_profile."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_profile'


def test_admin_profile_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_profile_edit_cancel(root_page, psn_config):
    root_page.locator('#vgp-user-btn-edit').click()
    expect(root_page.locator('#vgp-user-input-input-wrapper')).to_be_visible()
    expect(root_page.locator('#vgp-user-btn-save')).to_be_visible()
    root_page.locator('#vgp-user-btn-cancel').click()
    expect(root_page.locator('#vgp-user-input-input-wrapper')).not_to_be_visible()
    expect(root_page.locator('#vgp-user-input-table-wrapper')).to_be_visible()
    take_screenshot(root_page, psn_config, 'profile_edit_cancel')
