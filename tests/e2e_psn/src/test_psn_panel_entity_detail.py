"""Browser tests for /panelsearch_nanbyo_panel_entity_detail."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_entity_detail'


def test_panel_entity_detail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_entity_detail_tabs(root_page, psn_config):
    assert_tabs(root_page, psn_config, PAGE)
