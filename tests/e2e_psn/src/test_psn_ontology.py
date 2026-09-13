"""Browser tests for /panelsearch_nanbyo_ontology."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'ontology'


def test_ontology_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_ontology_load_selected_version(root_page, psn_config):
    row = root_page.locator('#ontology-list-table-tableBody tr').last
    expect(row).to_be_visible()
    row.click()
    expect(row).to_have_class(__import__('re').compile(r'.*\bselected\b.*'))
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_get_ontology_data')) as result:
        root_page.locator('#btn_load_selected_ttl_db').click()
    body = assert_json_response(result.value)
    assert body.get('ontology_json'), 'Selected ontology has no data'
    take_screenshot(root_page, psn_config, 'ontology_selected_version')
