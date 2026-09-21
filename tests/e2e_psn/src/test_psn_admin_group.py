"""Browser tests for /panelsearch_nanbyo_admin_group."""
from contextlib import ExitStack
from pathlib import Path
from uuid import uuid4
import os

import pytest
from playwright.sync_api import expect
from psn_common import ROOT, assert_page, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_group'


def test_admin_group_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_group_filter_no_match(root_page, psn_config):
    root_page.locator('#group_filter').fill(psn_config.cases[PAGE]['no_match_text'])
    expect(root_page.locator('#group_list_table_tbody tr:visible')).to_have_count(0)
    take_screenshot(root_page, psn_config, 'group_no_match')


LOAD = '/panelsearch_nanbyo_admin_group_load_data'
PREFIX = '/panelsearch_nanbyo_admin_group_'


def _ready(page):
    expect(page.locator('#group_list_table')).to_be_visible()
    for selector in ('#vgp-loader-whole', '#vgp-loader', '#fh5co-loader'):
        for loader in page.locator(selector).all():
            expect(loader).not_to_be_visible(timeout=60000)


def _open(page, config):
    with page.expect_response(lambda r: response_matches(r, LOAD)) as pending:
        response = page.goto(config.page_url(PAGE))
    assert response.ok
    assert_json_response(pending.value)
    _ready(page)


def _post(page, config, action, data):
    return assert_json_response(page.context.request.post(
        config.settings['origin'].rstrip('/') + action, data=data))


def _data(page, config):
    return assert_json_response(page.context.request.get(
        config.settings['origin'].rstrip('/') + LOAD))


@pytest.fixture
def group_lab(browser, psn_config, request):
    # Setup and cleanup use admin APIs; actions under test use the actual UI.
    roles = ['admin']
    if 'curator' in request.node.name:
        roles.append('curator')
    if 'reviewer' in request.node.name or 'member' in request.node.name:
        roles.append('reviewer')
    paths = {}
    for role in roles:
        paths[role] = Path(os.getenv('PSN_' + role.upper() + '_STATE',
                          str(ROOT / psn_config.settings['auth_states'][role])))
        if not paths[role].is_file():
            message = f'Group tests require {role} storage state: {paths[role]}'
            if request.config.getoption('--psn-require-auth'):
                pytest.fail(message)
            pytest.skip(message)
    with ExitStack() as stack:
        pages = {}
        emails = {}
        for role in roles:
            context = browser.new_context(storage_state=str(paths[role]),
                                          viewport={'width': 1920, 'height': 1080})
            stack.callback(context.close)
            page = context.new_page()
            response = page.goto(psn_config.page_url('admin_profile'))
            assert response.ok
            expect(page.locator('#i_affiliation_email')).to_be_attached()
            emails[role] = page.locator('#i_affiliation_email').input_value()
            pages[role] = page
        admin = pages['admin']
        _open(admin, psn_config)
        users = _data(admin, psn_config)['user_list_arr']
        ids = {}
        for role, email in emails.items():
            matches = [str(u['id']) for u in users if u.get('email') == email]
            assert len(matches) == 1, f'Cannot uniquely identify {role} test account'
            ids[role] = matches[0]
        assert len(set(ids.values())) == len(ids), 'Use distinct role accounts'
        groups = []

        def create():
            title = 'PSN_E2E_GROUP_' + uuid4().hex
            result = _post(admin, psn_config, PREFIX + 'add_group', {'group_title': title})
            group_id = str(result['group_id'])
            groups.append((group_id, title))
            return group_id, title

        try:
            yield pages, ids, create, groups
        finally:
            # Remove links before soft-deleting groups, including on assertion failure.
            for group_id, title in reversed(groups):
                data = _data(admin, psn_config)
                members = data['group_user_hash'].get(group_id, {})
                if members:
                    _post(admin, psn_config, PREFIX + 'delete_group_user',
                          {'group_id': group_id, 'user_ids': ','.join(map(str, members))})
                panels = assert_json_response(admin.context.request.get(
                    psn_config.settings['origin'].rstrip('/') + '/panelsearch_nanbyo_get_group_panel',
                    params={'group_id': group_id}))['items']
                for panel in panels:
                    _post(admin, psn_config, '/panelsearch_nanbyo_delete_group_panel',
                          {'group_id': group_id, 'panel_id': panel['panel_id']})
                active = {str(g['group_id']) for g in data['group_list_arr']}
                if group_id in active:
                    _post(admin, psn_config, PREFIX + 'delete_group', {'group_id': group_id})


def _add_member(admin, config, group_id, user_id, role='reviewer'):
    _post(admin, config, PREFIX + 'add_group_user',
          {'group_id': group_id, 'user_ids': user_id})
    if role != 'reviewer':
        _post(admin, config, PREFIX + 'change_group_user_role',
              {'group_id': group_id, 'user_id': user_id, 'user_role': role})


def _select(page, config, group_id):
    _open(page, config)
    with page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_get_group_panel')) as pending:
        page.locator(f'#group_list_table_tbody tr[data-group_id="{group_id}"]').click()
    assert_json_response(pending.value)
    _ready(page)


def _submit(page, endpoint, action):
    with page.expect_response(lambda r: response_matches(r, endpoint)) as pending:
        action()
    assert_json_response(pending.value)
    _ready(page)


def test_admin_add_group(group_lab, psn_config):
    pages, ids, create, groups = group_lab
    page = pages['admin']
    title = 'PSN_E2E_GROUP_' + uuid4().hex
    # Register by unique title even if the reload makes response bodies unavailable.
    try:
        page.locator('#addGroupToggle').click()
        page.locator('#newGroupName').fill(title)
        with page.expect_navigation():
            page.locator('#saveGroupBtn').click()
        _ready(page)
        expect(page.locator('#group_list_table_tbody .group-title', has_text=title)).to_have_count(1)
    finally:
        matches = [g for g in _data(page, psn_config)['group_list_arr'] if g['group_title'] == title]
        groups.extend((str(g['group_id']), title) for g in matches)
    assert len(matches) == 1


def test_admin_delete_group(group_lab, psn_config):
    pages, ids, create, groups = group_lab
    group_id, title = create()
    page = pages['admin']
    _select(page, psn_config, group_id)
    page.locator(f'#group_list_table_tbody tr[data-group_id="{group_id}"] span.delete').click()
    with page.expect_navigation():
        page.locator('.swal2-confirm').click()
    _ready(page)
    expect(page.locator(f'#group_list_table_tbody tr[data-group_id="{group_id}"]')).to_have_count(0)
    assert group_id not in {str(g['group_id']) for g in _data(page, psn_config)['group_list_arr']}


@pytest.mark.parametrize('actor', ['admin', 'curator'])
@pytest.mark.parametrize('operation', ['add', 'remove', 'role'])
def test_group_member_operations(group_lab, psn_config, actor, operation):
    pages, ids, create, groups = group_lab
    group_id, title = create()
    admin = pages['admin']
    if actor == 'curator':
        _add_member(admin, psn_config, group_id, ids['curator'], 'curator')
    user_id = ids['reviewer']
    if operation != 'add':
        _add_member(admin, psn_config, group_id, user_id)
    page = pages[actor]
    _select(page, psn_config, group_id)
    if operation == 'role':
        selector = f'#in_group_user_list_table select[data-user_id="{user_id}"]'
        for role in ('curator', 'reviewer'):
            _submit(page, PREFIX + 'change_group_user_role',
                    lambda: page.locator(selector).select_option(role))
            _select(page, psn_config, group_id)
            expect(page.locator(selector)).to_have_value(role)
            assert _data(admin, psn_config)['group_user_hash'][group_id][user_id] == role
    else:
        table = 'not_in_group' if operation == 'add' else 'in_group'
        checkbox = page.locator(f'#{table}_user_list_table input.row-check[value="{user_id}"]')
        checkbox.locator('xpath=..').click()
        expect(checkbox).to_be_checked()
        if operation == 'add':
            _submit(page, PREFIX + 'add_group_user', lambda: page.locator('#btn_add_to_right').click())
        else:
            page.locator('#btn_add_to_left').click()
            _submit(page, PREFIX + 'delete_group_user', lambda: page.locator('.swal2-confirm').click())
        _select(page, psn_config, group_id)
        expect(page.locator(f'#in_group_user_list_table input[value="{user_id}"]')).to_have_count(
            1 if operation == 'add' else 0)
        assert (user_id in _data(admin, psn_config)['group_user_hash'].get(group_id, {})) == (operation == 'add')


def test_curator_only_sees_own_curator_groups(group_lab, psn_config):
    pages, ids, create, groups = group_lab
    own, _ = create()
    reviewer_group, _ = create()
    unrelated, _ = create()
    _add_member(pages['admin'], psn_config, own, ids['curator'], 'curator')
    _add_member(pages['admin'], psn_config, reviewer_group, ids['curator'])
    page = pages['curator']
    _open(page, psn_config)
    data = _data(pages['admin'], psn_config)
    expected = {str(g['group_id']) for g in data['group_list_arr']
                if data['group_user_hash'].get(str(g['group_id']), {}).get(ids['curator']) == 'curator'}
    visible = set(page.locator('#group_list_table_tbody tr').evaluate_all(
        '(rows) => rows.map(row => row.dataset.group_id)'))
    assert visible == expected
    assert own in visible and reviewer_group not in visible and unrelated not in visible


def test_curator_cannot_add_or_delete_group(group_lab, psn_config):
    pages, ids, create, groups = group_lab
    group_id, title = create()
    _add_member(pages['admin'], psn_config, group_id, ids['curator'], 'curator')
    page = pages['curator']
    _select(page, psn_config, group_id)
    expect(page.locator('#addGroupToggle')).to_have_count(0)
    expect(page.locator('#group_list_table_tbody span.delete')).to_have_count(0)
    denied_title = 'PSN_E2E_GROUP_' + uuid4().hex
    try:
        for endpoint, body in [('add_group', {'group_title': denied_title}),
                               ('delete_group', {'group_id': group_id})]:
            response = page.context.request.post(psn_config.settings['origin'].rstrip('/') + PREFIX + endpoint, data=body)
            assert response.status in (400, 403)
            assert response.json().get('error')
    finally:
        data = _data(pages['admin'], psn_config)
        groups.extend((str(g['group_id']), denied_title) for g in data['group_list_arr'] if g['group_title'] == denied_title)
    assert group_id in {str(g['group_id']) for g in data['group_list_arr']}
    assert not any(g['group_title'] == denied_title for g in data['group_list_arr'])


@pytest.mark.parametrize('operation', ['add', 'remove'])
def test_admin_group_panel_operations(group_lab, psn_config, operation):
    pages, ids, create, groups = group_lab
    group_id, title = create()
    page = pages['admin']
    panel_id = str(psn_config.pages['panel_detail']['query']['panel_id'])
    _post(page, psn_config, '/panelsearch_nanbyo_add_group_panel',
          {'group_id': group_id, 'panel_id': panel_id})
    items = assert_json_response(page.context.request.get(
        psn_config.settings['origin'].rstrip('/') + '/panelsearch_nanbyo_get_group_panel',
        params={'group_id': group_id}))['items']
    assert len(items) == 1
    panel_name = items[0]['panel_name']
    if operation == 'add':
        _post(page, psn_config, '/panelsearch_nanbyo_delete_group_panel',
              {'group_id': group_id, 'panel_id': panel_id})
    _select(page, psn_config, group_id)
    page.locator('#nav-group-disease').click()
    if operation == 'add':
        field = page.locator('#group_disease_list input[type="text"]')
        with page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_get_panel_by_name')) as pending:
            field.fill(panel_name)
        results = assert_json_response(pending.value)['items']
        index = next((i for i, item in enumerate(results) if item['panel_id'] == panel_id), None)
        assert index is not None, 'Configured panel must appear in panel suggestions'
        page.locator('#group_disease_list .dropdown-item').nth(index).click()
        _submit(page, '/panelsearch_nanbyo_add_group_panel', lambda: page.locator('#btn_add_disease_to_group').click())
    else:
        page.locator(f'#group_disease_table span.delete[data-panel_id="{panel_id}"]').click()
        _submit(page, '/panelsearch_nanbyo_delete_group_panel', lambda: page.locator('.swal2-confirm').click())
    _select(page, psn_config, group_id)
    page.locator('#nav-group-disease').click()
    expect(page.locator(f'#group_disease_table span.delete[data-panel_id="{panel_id}"]')).to_have_count(
        1 if operation == 'add' else 0)


def test_reviewer_cannot_access_group_page(group_lab, psn_config):
    page = group_lab[0]['reviewer']
    response = page.goto(psn_config.page_url(PAGE))
    assert response.ok
    expect(page.locator('.alert-danger')).to_contain_text('not enough privilege to access this page')
    expect(page.locator('#group_list_table')).to_have_count(0)
    expect(page.locator('#addGroupToggle')).to_have_count(0)
