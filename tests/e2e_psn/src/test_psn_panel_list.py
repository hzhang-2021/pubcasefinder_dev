"""Browser tests for /panelsearch_nanbyo."""
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_list'

SEARCH_APIS = {
    'Panel': '/panelsearch_nanbyo_get_panel_id_match_panel_name_synonym',
    'Gene': '/panelsearch_nanbyo_get_panel_id_match_gene_symbol_ncbiid',
}


def select_search_target(page, target):
    trigger = page.locator('#btn-vgp-target')
    menu = page.locator('.vgp-target-wrapper .dropdown-menu')
    trigger.click()
    expect(trigger).to_have_attribute('aria-expanded', 'true')
    expect(menu).to_be_visible()
    menu.get_by_role('button', name=target, exact=True).click()
    expect(trigger).to_have_text(target)
    expect(trigger).to_have_attribute('aria-expanded', 'false')
    expect(menu).not_to_be_visible()


def assert_search_response(response, term):
    assert_json_response(response)
    assert parse_qs(urlparse(response.url).query)['input_text'] == [term]


def test_panel_search_target_defaults_to_panel(root_page, psn_config):
    trigger = root_page.locator('#btn-vgp-target')
    menu = root_page.locator('.vgp-target-wrapper .dropdown-menu')
    expect(trigger).to_have_text('Panel')
    expect(trigger).to_have_attribute('aria-expanded', 'false')
    expect(menu).not_to_be_visible()
    trigger.click()
    expect(trigger).to_have_attribute('aria-expanded', 'true')
    expect(menu).to_be_visible()
    expect(menu.get_by_role('button', name='Panel', exact=True)).to_be_visible()
    expect(menu.get_by_role('button', name='Gene', exact=True)).to_be_visible()
    trigger.click()
    expect(trigger).to_have_attribute('aria-expanded', 'false')
    expect(menu).not_to_be_visible()
    take_screenshot(root_page, psn_config, 'panel_search_target_default')


def test_panel_search_gene_no_match(root_page, psn_config):
    select_search_target(root_page, 'Gene')
    term = psn_config.cases[PAGE]['no_match_text']
    with root_page.expect_response(lambda r: response_matches(r, SEARCH_APIS['Gene'])) as result:
        root_page.locator('#vgp-filter').fill(term)
    assert_search_response(result.value, term)
    expect(root_page.locator('#vgp-searched-panels-num')).to_have_text('0')
    take_screenshot(root_page, psn_config, 'panel_search_gene_no_match')


def test_panel_search_gene_acta1(root_page, psn_config):
    select_search_target(root_page, 'Gene')
    with root_page.expect_response(lambda r: response_matches(r, SEARCH_APIS['Gene'])) as result:
        root_page.locator('#vgp-filter').fill('ACTA1')
    assert_search_response(result.value, 'ACTA1')
    # Check all displayed panel names: the expected panel need not be first.
    panel = root_page.locator('#vgp-list-root-panel .vgp-name-wrapper').filter(
        has_text=psn_config.cases[PAGE]['gene_acta1_expected_panel']
    ).first
    expect(panel).to_be_visible(timeout=60000)
    take_screenshot(root_page, psn_config, 'panel_search_gene_acta1')


@pytest.mark.parametrize('source,target', [('Panel', 'Gene'), ('Gene', 'Panel')])
def test_panel_search_target_switch_preserves_filter(root_page, psn_config, source, target):
    # Each direction starts fresh so the target query is not served from UI cache.
    if source != 'Panel':
        select_search_target(root_page, source)
    term = psn_config.cases[PAGE]['no_match_text']
    search = root_page.locator('#vgp-filter')
    with root_page.expect_response(lambda r: response_matches(r, SEARCH_APIS[source])) as result:
        search.fill(term)
    assert_search_response(result.value, term)
    expect(root_page.locator('#vgp-searched-panels-num')).to_have_text('0')
    with root_page.expect_response(lambda r: response_matches(r, SEARCH_APIS[target])) as result:
        select_search_target(root_page, target)
    assert_search_response(result.value, term)
    expect(search).to_have_value(term)
    expect(root_page.locator('#vgp-searched-panels-num')).to_have_text('0')
    take_screenshot(root_page, psn_config, 'panel_search_target_' + source + '_to_' + target)


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
