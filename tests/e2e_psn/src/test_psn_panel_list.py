"""Browser tests for /panelsearch_nanbyo."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_list'


def test_panel_list_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_search_no_match(root_page, psn_config):
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_get_panel_id_match_panel_name_synonym')) as result:
        root_page.locator('#vgp-filter').fill(psn_config.cases[PAGE]['no_match_text'])
    assert_json_response(result.value)
    expect(root_page.locator('#vgp-searched-panels-num')).to_have_text('0')
    take_screenshot(root_page, psn_config, 'panel_search_no_match')


def test_panel_search_existing_name(root_page, psn_config):
    label = root_page.locator('#vgp-list-root-panel .vgp-name-wrapper h2').first
    expect(label).to_be_visible(timeout=60000)
    # Prefer the configured golden input; otherwise reuse an actual displayed name.
    term = psn_config.cases[PAGE].get('search_text') or label.evaluate(
        "node => {const c=node.cloneNode(true); c.querySelectorAll('rt').forEach(n=>n.remove()); return c.textContent.trim();}"
    )
    assert term
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_get_panel_id_match_panel_name_synonym')) as result:
        root_page.locator('#vgp-filter').fill(term)
    assert_json_response(result.value)
    expect(root_page.locator('#vgp-list-root-panel .vgp-name-wrapper').first).to_contain_text(term)
    take_screenshot(root_page, psn_config, 'panel_search_existing')
