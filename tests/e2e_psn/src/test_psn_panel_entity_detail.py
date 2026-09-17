"""Browser tests for /panelsearch_nanbyo_panel_entity_detail."""
from urllib.parse import parse_qs, urlparse

import pytest

from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_entity_detail'


def test_panel_entity_detail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_entity_detail_tabs(root_page, psn_config):
    assert_tabs(root_page, psn_config, PAGE)


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_definition_edit_visible(root_page, psn_config):
    query = parse_qs(urlparse(root_page.url).query)
    summary = root_page.locator('#vgp-panel-entity-summary-wrapper')
    edit = summary.locator('#btn-definition-edit')
    expect(edit).to_be_visible(timeout=60000)
    expect(summary.locator('#vgp-summary-table')).to_be_visible()
    edit.click()
    expect(summary.locator('#vgp-definition-table')).to_be_visible()
    expect(summary.locator('#input_definition_panel_id')).to_have_value(
        query['panel_id'][0])
    expect(summary.locator('#input_definition_entity_name')).to_have_value(
        query['entity_name'][0])
    expect(summary.locator('#btn-definition-save')).to_be_visible()
    take_screenshot(root_page, psn_config, 'entity_definition_edit_visible')
    summary.locator('#btn-definition-cancel').click()
    expect(summary.locator('#vgp-summary-table')).to_be_visible()
    expect(summary.locator('#vgp-definition-table')).not_to_be_visible()
