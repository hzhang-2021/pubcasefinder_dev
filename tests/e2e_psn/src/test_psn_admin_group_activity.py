"""Browser tests for /panelsearch_nanbyo_admin_group_activity."""
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.sync_api import expect
from psn_common import assert_page, assert_json_response, response_matches, take_screenshot

# Reuse the isolated group lifecycle and role-specific contexts.
from test_psn_admin_group import group_lab, _add_member, _select, _submit, _data, PREFIX

PAGE = 'admin_group_activity'


def test_admin_group_activity_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_admin_group_activity_filter_no_match(root_page, psn_config):
    term = psn_config.cases[PAGE]['no_match_text']
    logs = _filter(root_page, term)
    assert logs == []
    expect(root_page.locator('#activity_table_tbody tr')).to_have_count(0)
    take_screenshot(root_page, psn_config, PAGE + '_no_match')


ACTIVITY_API = '/panelsearch_nanbyo_admin_load_group_activity'
SEARCH_FIELDS = ('target_user_name', 'target_user_email')


def _initial_logs(page):
    with page.expect_response(lambda r: response_matches(r, ACTIVITY_API)) as pending:
        page.reload(wait_until='domcontentloaded')
    logs = assert_json_response(pending.value)
    assert isinstance(logs, list)
    expect(page.locator('#total_num')).to_have_text(str(len(logs)))
    if not logs:
        pytest.skip('Filter tests require existing group activity logs')
    return logs


def _filter(page, value):
    expected = ''.join(value.split())
    with page.expect_response(
        lambda r: response_matches(r, ACTIVITY_API)
        and parse_qs(urlparse(r.url).query, keep_blank_values=True).get('filter_text') == [expected]
    ) as pending:
        page.locator('#filter_letter').fill(value)
    logs = assert_json_response(pending.value)
    assert isinstance(logs, list)
    expect(page.locator('#filter_letter')).to_have_value(value)
    expect(page.locator('#total_num')).to_have_text(str(len(logs)))
    page_size = int(page.locator('#btn-vgp-size').get_attribute('data-num_per_page'))
    expect(page.locator('#activity_table_tbody tr')).to_have_count(min(len(logs), page_size))
    return logs


def _sample(logs, field, partial=False):
    for row in logs:
        value = str(row.get(field) or '').strip()
        # Use a literal term so SQL LIKE wildcards do not broaden the match.
        if value and not any(char.isspace() or char in '%_' for char in value):
            if partial and len(value) < 2:
                continue
            return row, value[:max(1, len(value) // 2)] if partial else value
    pytest.skip(f'Group activity logs need a usable {field}')


def _assert_matches(page, logs, term, source):
    assert logs, 'An existing user must have matching activity logs'
    assert source['group_activity_id'] in {row['group_activity_id'] for row in logs}
    for row in logs:
        assert any(term.casefold() in str(row.get(field) or '').casefold()
                   for field in SEARCH_FIELDS), 'An unrelated activity passed the filter'
    marks = page.locator('#activity_table_tbody .target_user_name mark, '
                         '#activity_table_tbody .target_user_email mark')
    expect(marks.first).to_be_visible()
    for text in marks.all_inner_texts():
        assert text.casefold() == term.casefold()


@pytest.mark.parametrize('field', SEARCH_FIELDS, ids=['user-name', 'mail'])
@pytest.mark.parametrize('mode', ['full', 'partial'])
def test_group_activity_filter_matches(root_page, psn_config, field, mode):
    source, term = _sample(_initial_logs(root_page), field, partial=mode == 'partial')
    logs = _filter(root_page, term)
    _assert_matches(root_page, logs, term, source)
    take_screenshot(root_page, psn_config, f'{PAGE}_{field}_{mode}')


def test_group_activity_filter_trims_spaces(root_page, psn_config):
    source, term = _sample(_initial_logs(root_page), 'target_user_email')
    logs = _filter(root_page, '  ' + term + '  ')
    _assert_matches(root_page, logs, term, source)
    take_screenshot(root_page, psn_config, PAGE + '_filter_spaces')


def test_group_activity_filter_clear_restores_logs(root_page, psn_config):
    initial = _initial_logs(root_page)
    logs = _filter(root_page, psn_config.cases[PAGE]['no_match_text'])
    assert logs == []
    expect(root_page.locator('#activity_table_tbody tr')).to_have_count(0)
    restored = _filter(root_page, '')
    # New activity may arrive while the test runs; existing records must remain.
    assert {row['group_activity_id'] for row in initial} <= {
        row['group_activity_id'] for row in restored}
    expect(root_page.locator('#activity_table_tbody mark')).to_have_count(0)
    take_screenshot(root_page, psn_config, PAGE + '_filter_clear')



def _activity_records(page, config):
    return assert_json_response(page.context.request.get(
        config.settings['origin'].rstrip('/') + ACTIVITY_API))


def _assert_activity_row(page, title, name, email, actor_name, role, description):
    # A fresh test group has few records, but the account may have many pages.
    while True:
        rows = page.locator('#activity_table_tbody tr').filter(
            has=page.locator('.group_title', has_text=title)).filter(
            has=page.locator('.target_user_email', has_text=email)).filter(has_text=description)
        if rows.count():
            expect(rows).to_have_count(1)
            row = rows.first
            expect(row.locator('.group_title')).to_have_text(title)
            expect(row.locator('.target_user_name')).to_have_text(name)
            expect(row.locator('.target_user_email')).to_have_text(email)
            expect(row.locator('.admin_user_name')).to_have_text(actor_name)
            expect(row.locator('.user_role_to')).to_have_text(role.capitalize() if role else '-')
            expect(row.locator('.activity:not(.created_at)')).to_have_text(description)
            expect(row.locator('.created_at')).not_to_have_text('')
            return
        next_page = page.locator('#table-pagination .paginationjs-next:not(.disabled) a')
        assert next_page.count() == 1, 'The persisted activity is missing from the activity table'
        active = page.locator('#table-pagination .paginationjs-page.active').inner_text()
        next_page.click()
        expect(page.locator('#table-pagination .paginationjs-page.active')).not_to_have_text(active)


@pytest.mark.parametrize('actor', ['admin', 'curator'])
@pytest.mark.parametrize('operation', ['add', 'remove', 'promote', 'demote'])
def test_group_member_activity_consistency(group_lab, psn_config, actor, operation):
    pages, ids, create, groups = group_lab
    admin = pages['admin']
    group_id, title = create()
    if actor == 'curator':
        _add_member(admin, psn_config, group_id, ids['curator'], 'curator')
    user_id = ids['reviewer']
    if operation != 'add':
        _add_member(admin, psn_config, group_id, user_id,
                    'curator' if operation == 'demote' else 'reviewer')
    users = {str(user['id']): user for user in _data(admin, psn_config)['user_list_arr']}
    target = users[user_id]
    operator = users[ids[actor]]
    name = str(target.get('last_name_nl') or '') + str(target.get('first_name_nl') or '')
    actor_name = str(operator.get('last_name_nl') or '') + str(operator.get('first_name_nl') or '')
    email = target['email']
    before = {str(row['group_activity_id']) for row in _activity_records(admin, psn_config)}
    page = pages[actor]
    _select(page, psn_config, group_id)
    if operation in ('promote', 'demote'):
        role_from, role_to = ('reviewer', 'curator') if operation == 'promote' else ('curator', 'reviewer')
        action = 'change'
        _submit(page, PREFIX + 'change_group_user_role', lambda: page.locator(
            f'#in_group_user_list_table select[data-user_id="{user_id}"]').select_option(role_to))
        description = f'{role_from.capitalize()} -> {role_to.capitalize()}の役割が変更されました。'
    else:
        side = 'not_in_group' if operation == 'add' else 'in_group'
        checkbox = page.locator(f'#{side}_user_list_table input.row-check[value="{user_id}"]')
        checkbox.locator('xpath=..').click()
        expect(checkbox).to_be_checked()
        role_from = None
        action = operation
        if operation == 'add':
            role_to = 'reviewer'
            _submit(page, PREFIX + 'add_group_user', lambda: page.locator('#btn_add_to_right').click())
            description = 'Reviewerの役割が付与されました。'
        else:
            role_to = None
            page.locator('#btn_add_to_left').click()
            _submit(page, PREFIX + 'delete_group_user', lambda: page.locator('.swal2-confirm').click())
            description = 'グループから除外されました。'
    # Verify the source page after reload, not just its optimistic local cache.
    _select(page, psn_config, group_id)
    member = page.locator(f'#in_group_user_list_table select[data-user_id="{user_id}"]')
    if role_to:
        expect(member).to_have_value(role_to)
    else:
        expect(member).to_have_count(0)
    assert _data(admin, psn_config)['group_user_hash'].get(group_id, {}).get(user_id) == role_to
    records = _activity_records(admin, psn_config)
    new = [row for row in records if str(row['group_id']) == group_id
           and str(row['group_activity_id']) not in before]
    assert len(new) == 1, 'Each member operation must create exactly one activity record'
    event = new[0]
    for key, value in {'group_title': title, 'target_user_name': name,
                       'target_user_email': email, 'admin_user_name': actor_name,
                       'action': action, 'user_role_from': role_from,
                       'user_role_to': role_to}.items():
        assert event[key] == value, f'Activity field {key} does not match the Group operation'
    # The activity page is admin-only even when the operation was by a curator.
    with admin.expect_response(lambda r: response_matches(r, ACTIVITY_API)) as pending:
        response = admin.goto(psn_config.page_url(PAGE))
    assert response.ok
    loaded = assert_json_response(pending.value)
    expect(admin.locator('#total_num')).to_have_text(str(len(loaded)))
    filtered = _filter(admin, email)
    assert str(event['group_activity_id']) in {str(row['group_activity_id']) for row in filtered}
    _assert_activity_row(admin, title, name, email, actor_name, role_to, description)
    take_screenshot(admin, psn_config, f'group_activity_consistency_{actor}_{operation}')
