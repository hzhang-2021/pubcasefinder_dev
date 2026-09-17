"""Browser tests for /panelsearch_nanbyo_panel_entity_detail."""
import os
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

import pytest

from playwright.sync_api import expect
from psn_common import assert_page, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_entity_detail'
DEFINITION_API = '/panelsearch_nanbyo_get_panel_entity_definition'


def current_definitions(page, config):
    query = parse_qs(urlparse(page.url).query)
    response = page.context.request.get(
        config.settings['origin'].rstrip('/') + DEFINITION_API,
        params={key: query[key][0] for key in ('panel_id', 'entity_type_id', 'entity_name')})
    definitions = assert_json_response(response)
    assert isinstance(definitions, list)
    return [row for row in definitions
            if row['is_latest'] == 'YES' and row.get('is_deleted') != 'YES']


def test_panel_entity_detail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_entity_detail_tabs(root_page, psn_config):
    for tab, panel in psn_config.pages[PAGE]['tabs']:
        root_page.locator(tab).click()
        expect(root_page.locator(tab)).to_have_attribute('aria-selected', 'true')
        # 履歴が空の場合、タブが有効でも領域の高さが 0 になる。
        expect(root_page.locator(panel + '.active.show')).to_have_count(1)
        take_screenshot(root_page, psn_config, PAGE + '_' + tab.lstrip('#'))


def test_panel_entity_definition_delete_hidden_for_anonymous(root_page):
    expect(root_page.locator('#vgp-panel-entity-summary-wrapper')).to_be_visible()
    expect(root_page.locator('#btn-definition-delete')).to_have_count(0)


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


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_definition_delete_cancel(root_page, psn_config):
    if not current_definitions(root_page, psn_config):
        pytest.skip('This entity has no current definition to delete')

    delete = root_page.locator('#btn-definition-delete')
    expect(root_page.locator('#btn-definition-edit')).to_be_visible(timeout=60000)
    expect(delete).to_be_visible(timeout=60000)
    definition_id = root_page.locator('#input_definition_review_id').input_value()
    assert definition_id
    delete.click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog.locator('#confirmationModalLabel')).to_have_text(
        'Confirm Deletion of Entity Definition')
    expect(dialog).to_contain_text(root_page.locator('#input_definition_entity_name').input_value())
    expect(dialog.locator('#btnConfirmAction')).to_have_text('Delete Definition')
    take_screenshot(root_page, psn_config, 'entity_definition_delete_confirmation')
    dialog.get_by_role('button', name='Cancel', exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(delete).to_be_visible()


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_definition_add_cancel(root_page, psn_config):
    if current_definitions(root_page, psn_config):
        pytest.skip('This entity already has a current definition')
    summary = root_page.locator('#vgp-panel-entity-summary-wrapper')
    edit = summary.locator('#btn-definition-edit')
    expect(edit).to_be_visible(timeout=60000)
    edit.click()
    marker = 'PSN-E2E-CANCEL-' + uuid4().hex
    summary.locator('#input_definition_comment').fill(marker)
    summary.locator('#btn-definition-save').click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog.locator('#confirmationModalLabel')).to_have_text(
        'Confirm Addition of Entity Definition')
    expect(dialog).to_contain_text(marker)
    expect(dialog.locator('#btnConfirmAction')).to_have_text('Add Definition')
    take_screenshot(root_page, psn_config, 'entity_definition_add_confirmation')
    dialog.get_by_role('button', name='Cancel', exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(summary.locator('#input_definition_comment')).to_have_value(marker)
    assert not current_definitions(root_page, psn_config)
    summary.locator('#btn-definition-cancel').click()
    expect(summary.locator('#vgp-summary-table')).to_be_visible()


@pytest.mark.parametrize('root_page', ['admin'], indirect=True)
def test_panel_entity_definition_add_delete_submit(root_page, psn_config):
    if os.getenv('PSN_DEFINITION_MUTATION') != '1':
        pytest.skip('Set PSN_DEFINITION_MUTATION=1 for a disposable entity with no current definition')
    assert not current_definitions(root_page, psn_config), (
        'The mutation target must have no current definition')
    summary = root_page.locator('#vgp-panel-entity-summary-wrapper')
    edit = summary.locator('#btn-definition-edit')
    expect(edit).to_be_visible(timeout=60000)
    expect(summary.locator('#btn-definition-delete')).to_have_count(0)
    marker = 'PSN-E2E-DEFINITION-' + uuid4().hex
    origin = psn_config.settings['origin'].rstrip('/')
    created_id = None

    try:
        edit.click()
        summary.locator('#input_definition_comment').fill(marker)
        summary.locator('#btn-definition-save').click()
        dialog = root_page.locator('#confirmationModal')
        expect(dialog).to_be_visible()
        expect(dialog).to_contain_text(marker)
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_regist_entity_definition')) as result:
                dialog.locator('#btnConfirmAction').click()
            assert result.value.ok, f'Add Definition: HTTP {result.value.status}'

        saved = [row for row in current_definitions(root_page, psn_config)
                 if row.get('comment') == marker]
        assert len(saved) == 1, 'Expected exactly one new definition'
        created_id = saved[0]['review_id']
        expect(summary.locator('#input_definition_review_id')).to_have_value(str(created_id), timeout=60000)
        delete = summary.locator('#btn-definition-delete')
        expect(delete).to_be_visible()
        take_screenshot(root_page, psn_config, 'entity_definition_add_saved')

        delete.click()
        expect(dialog).to_be_visible()
        expect(dialog.locator('#confirmationModalLabel')).to_have_text(
            'Confirm Deletion of Entity Definition')
        expect(dialog).to_contain_text(marker)
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_delete_entity_definition')) as result:
                dialog.locator('#btnConfirmAction').click()
            assert result.value.ok, f'Delete Definition: HTTP {result.value.status}'

        assert not current_definitions(root_page, psn_config)
        expect(summary.locator('#btn-definition-delete')).to_have_count(0, timeout=60000)
        take_screenshot(root_page, psn_config, 'entity_definition_delete_saved')
    finally:
        leftovers = [row for row in current_definitions(root_page, psn_config)
                     if row.get('comment') == marker]
        for row in leftovers:
            response = root_page.context.request.post(
                origin + '/panelsearch_nanbyo_delete_entity_definition',
                data={'entity_id': row['review_id']})
            body = assert_json_response(response)
            assert body.get('success') is True, f'Cleanup failed for definition {row["review_id"]}'
