"""Browser tests for /panelsearch_nanbyo_admin_incharge."""
import pytest
from playwright.sync_api import expect
import test_psn_panel_detail as panel_tests
from test_psn_admin_group import group_lab, _data, _post, _add_member
from psn_common import assert_page, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_incharge'


def test_admin_incharge_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


INCHARGE_API = '/panelsearch_nanbyo_admin_load_incharge_activity'
ACTIVITY_API = '/panelsearch_nanbyo_admin_load_activity'
HISTORY_API = '/panelsearch_nanbyo_admin_load_activity_history'


def _latest_activities(admin, config):
    rows = _post(admin, config, ACTIVITY_API, dict(
        filter_panel='', filter_version='', filter_entity='', filter_from='', filter_to=''))
    latest = {}
    keys = ('panel_id', 'gene_id', 'entity_type_id', 'entity_name',
            'user_id', 'target', 'original_review_id')
    for row in rows:
        key = tuple(row.get(field) for field in keys)
        if key not in latest or int(row['activity_id']) > int(latest[key]['activity_id']):
            latest[key] = row
    return list(latest.values())


def _load_incharge(page, config):
    with page.expect_response(lambda r: response_matches(r, INCHARGE_API)) as pending:
        response = page.goto(config.page_url(PAGE))
    assert response.ok
    rows = assert_json_response(pending.value)
    assert isinstance(rows, list)
    expect(page.locator('#total_num')).to_have_text(str(len(rows)))
    for selector in ('#vgp-loader-whole', '#vgp-loader', '#fh5co-loader'):
        for loader in page.locator(selector).all():
            expect(loader).not_to_be_visible(timeout=60000)
    return rows


def _row_ids(page):
    # IDs are stored by jQuery .data(), not in HTML data attributes.
    return page.locator('#activity_table_tbody > tr').evaluate_all(
        '(rows) => rows.map(row => String(window.jQuery(row).data("activity_id")))')


def _next_page(page):
    button = page.locator('#table-pagination .paginationjs-next:not(.disabled) a')
    if not button.count():
        return False
    active = page.locator('#table-pagination .paginationjs-page.active').inner_text()
    button.click()
    expect(page.locator('#table-pagination .paginationjs-page.active')).not_to_have_text(active)
    return True


def _assert_rows(page, expected):
    expected_by_id = {str(row['activity_id']): row for row in expected}
    displayed = []
    while True:
        ids = _row_ids(page)
        rows = page.locator('#activity_table_tbody > tr')
        for i, activity_id in enumerate(ids):
            assert activity_id in expected_by_id, 'An out-of-scope activity is displayed'
            event = expected_by_id[activity_id]
            row = rows.nth(i)
            expect(row.locator('.user_name')).to_have_text(event['user_name'] or '-')
            expect(row.locator('.panel_name')).to_contain_text(event['panel_name'])
            expect(row.locator('.entity_name')).to_contain_text(event['entity_name'])
            label = ('Deleted' if event['action'] == 'delete' else
                     'Modified' if event['action'] == 'change' and event['target'] == 'review' else
                     'Reviewed' if event['target'] == 'review' else
                     'Classified' if event['action'] == 'classify' else 'Assessed')
            expect(row.locator('.action')).to_have_text(label)
        displayed.extend(ids)
        if not _next_page(page):
            break
    assert len(displayed) == len(set(displayed)), 'Duplicate activities across pages'
    assert set(displayed) == set(expected_by_id), 'Some expected activities are missing'


def test_incharge_admin_all_panels(group_lab, psn_config):
    admin = group_lab[0]['admin']
    expected = _latest_activities(admin, psn_config)
    assert expected, 'Scope test requires existing panel activities'
    actual = _load_incharge(admin, psn_config)
    assert {str(row['activity_id']) for row in actual} == {str(row['activity_id']) for row in expected}
    assert {row['panel_id'] for row in actual} == {row['panel_id'] for row in expected}
    _assert_rows(admin, expected)


def test_incharge_curator_group_panel_scope(group_lab, psn_config):
    pages, ids, create, groups = group_lab
    admin, curator = pages['admin'], pages['curator']
    data = _data(admin, psn_config)
    allowed = set()
    for group in data['group_list_arr']:
        group_id = str(group['group_id'])
        if data['group_user_hash'].get(group_id, {}).get(ids['curator']) != 'curator':
            continue
        panels = assert_json_response(admin.context.request.get(
            psn_config.settings['origin'].rstrip('/') + '/panelsearch_nanbyo_get_group_panel',
            params={'group_id': group_id}))['items']
        allowed.update(row['panel_id'] for row in panels)
    all_latest = _latest_activities(admin, psn_config)
    expected = [row for row in all_latest if row['panel_id'] in allowed]
    if not expected or not any(row['panel_id'] not in allowed for row in all_latest):
        pytest.skip('Curator scope test needs activities both inside and outside assigned panels')
    actual = _load_incharge(curator, psn_config)
    assert {row['panel_id'] for row in actual} <= allowed
    assert {str(row['activity_id']) for row in actual} == {str(row['activity_id']) for row in expected}
    _assert_rows(curator, expected)


@pytest.mark.parametrize('viewer', ['admin', 'curator'])
def test_incharge_new_member_review_consistency(group_lab, psn_config, viewer):
    pages, ids, create, groups = group_lab
    admin, reviewer = pages['admin'], pages['reviewer']
    if viewer == 'curator':
        # The association is isolated; existing group assignments are untouched.
        group_id, title = create()
        _add_member(admin, psn_config, group_id, ids['curator'], 'curator')
        _post(admin, psn_config, '/panelsearch_nanbyo_add_group_panel', {
            'group_id': group_id, 'panel_id': psn_config.pages['panel_detail']['query']['panel_id']})
    checked = []

    def check(target, action, marker, entity):
        origin = psn_config.settings['origin'].rstrip('/')
        comments = assert_json_response(reviewer.context.request.get(
            origin + '/panelsearch_nanbyo_get_panel_entity_review_comment', params=entity))
        saved = [row for row in comments if row.get('comment') == marker]
        assert len(saved) == 1
        page = pages[viewer]
        activities = _load_incharge(page, psn_config)
        matches = [row for row in activities if str(row['review_id']) == str(saved[0]['review_id'])
                   and row['target'] == target and row['action'] == action]
        assert len(matches) == 1
        event = matches[0]
        assert event['panel_id'] == entity['panel_id']
        assert event['entity_name'] == entity['entity_name']
        assert str(event['user_id']) == ids['reviewer']
        while str(event['activity_id']) not in _row_ids(page):
            assert _next_page(page), 'New Review is missing from the Incharge table'
        index = _row_ids(page).index(str(event['activity_id']))
        row = page.locator('#activity_table_tbody > tr').nth(index)
        expect(row.locator('.entity_name')).to_contain_text(entity['entity_name'])
        expect(row.locator('.user_name')).to_have_text(event['user_name'])
        expect(row.locator('.action')).to_have_text('Reviewed')
        with page.expect_response(lambda r: response_matches(r, HISTORY_API)) as pending:
            row.locator('td.created_at').click()
        history = assert_json_response(pending.value)
        assert str(event['activity_id']) in {str(key) for key in history['activity_history']}
        expect(page.locator('#sidebar')).to_have_class('shown')
        expect(page.locator('#sidebar_entity_name')).to_contain_text(entity['entity_name'])
        expect(page.locator('#sidebar_user')).to_contain_text(event['user_name'])
        expect(page.locator('#sidebar_body')).to_contain_text(marker)
        take_screenshot(page, psn_config, 'incharge_consistency_' + viewer)
        checked.append(event['activity_id'])

    response = reviewer.goto(psn_config.page_url('panel_detail'))
    assert response.ok
    panel_tests.test_panel_detail_add_review_submit(reviewer, psn_config, activity_check=check)
    assert len(checked) == 1
