"""Browser tests for /panelsearch_nanbyo_admin_mail."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_mail'


def test_admin_mail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_admin_mail_tabs(root_page, psn_config):
    assert_tabs(root_page, psn_config, PAGE)


def test_mail_log_load(root_page, psn_config):
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_admin_load_email')) as result:
        root_page.locator('#btn_load_email').click()
    assert_json_response(result.value)
    expect(root_page.locator('#email_table')).to_be_visible()
    take_screenshot(root_page, psn_config, 'mail_log_load')
