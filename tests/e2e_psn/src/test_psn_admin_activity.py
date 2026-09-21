"""Browser tests for /panelsearch_nanbyo_admin_activity."""
import json
import os
from pathlib import Path

import pytest
from playwright.sync_api import expect
import test_psn_panel_detail as panel_tests
import test_psn_panel_entity_detail as entity_tests
from psn_common import ROOT, assert_page, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_activity'


def test_admin_activity_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_activity_date_filter(root_page, psn_config):
    value = psn_config.cases[PAGE]['from_date']
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_admin_load_activity')) as result:
        root_page.locator('#dateFrom').fill(value)
        root_page.locator('#dateFrom').blur()
    assert_json_response(result.value)
    expect(root_page.locator('#dateFrom')).to_have_value(value)
    expect(root_page.locator('#activity_table')).to_be_visible()


ACTIVITY_API = '/panelsearch_nanbyo_admin_load_activity'
DETAIL_API = '/panelsearch_nanbyo_admin_load_activity_detail'


@pytest.mark.parametrize('scenario,source,role,flag', [
    ('add_entity', 'panel_detail', 'reviewer', 'PSN_ADD_ENTITY_MUTATION'),
    ('add_review', 'panel_detail', 'reviewer', None),
    ('comment_lifecycle', 'panel_entity_detail', 'admin', 'PSN_REVIEW_COMMENT_MUTATION'),
    ('definition_lifecycle', 'panel_entity_detail', 'admin', 'PSN_DEFINITION_MUTATION'),
], ids=['add-entity', 'add-review', 'comment-add-edit-delete', 'definition-add-delete'])
def test_panel_operations_activity_consistency(root_page, browser, psn_config, scenario, source, role, flag):
    if flag and os.getenv(flag) != '1':
        pytest.skip(f'Set {flag}=1 to enable this existing mutation flow')
    state = Path(os.getenv('PSN_' + role.upper() + '_STATE',
                          str(ROOT / psn_config.settings['auth_states'][role])))
    if not state.is_file():
        pytest.fail(f'Consistency test requires {role} login state: {state}')
    origin = psn_config.settings['origin'].rstrip('/')
    api = root_page.context.request
    filters = dict(filter_panel='', filter_version='', filter_entity='', filter_from='', filter_to='')
    baseline = assert_json_response(api.post(origin + ACTIVITY_API, data=filters))
    seen = {str(row['activity_id']) for row in baseline}
    checked = []

    def check(target, action, marker, entity):
        # Comment changes are stored as review/change, with old/new comment IDs.
        log_target = 'review' if target == 'review_comment' else target
        log_action = 'change' if target == 'review_comment' else action
        records = assert_json_response(api.post(origin + ACTIVITY_API,
            data={**filters, 'filter_panel': entity['panel_id'], 'filter_entity': entity['entity_name']}))
        matches = []
        for event in records:
            if (str(event['activity_id']) in seen or event['target'] != log_target
                    or event['action'] != log_action):
                continue
            payload = dict(event)
            for diff in json.loads(event['difference']):
                if 'comment_ids' in diff:
                    payload['comment_ids'] = diff['comment_ids']
            detail = assert_json_response(api.post(origin + DETAIL_API, data=payload))
            side = 'former_data' if action == 'delete' else 'data'
            if detail.get(side, {}).get('comment') == marker:
                matches.append((event, detail))
        assert len(matches) == 1, f'Expected exactly one {target}/{action} activity for this operation'
        event, detail = matches[0]
        assert event['panel_id'] == entity['panel_id']
        assert event['entity_name'] == entity['entity_name']
        assert event['user_name'] and event['panel_versions']
        seen.add(str(event['activity_id']))
        with root_page.expect_response(lambda r: response_matches(r, ACTIVITY_API)) as pending:
            response = root_page.goto(psn_config.page_url(PAGE))
        assert response.ok
        loaded = assert_json_response(pending.value)
        assert str(event['activity_id']) in {str(row['activity_id']) for row in loaded}
        detail_selector = '#detail_div_' + str(event['activity_id'])
        # Follow pagination rather than assuming the new event is the first row.
        while root_page.locator(detail_selector).count() == 0:
            next_page = root_page.locator('#table-pagination .paginationjs-next:not(.disabled) a')
            assert next_page.count() == 1, 'Activity API record is absent from the rendered table'
            active = root_page.locator('#table-pagination .paginationjs-page.active').inner_text()
            next_page.click()
            expect(root_page.locator('#table-pagination .paginationjs-page.active')).not_to_have_text(active)
        lower = root_page.locator(detail_selector)
        upper = lower.locator('xpath=preceding-sibling::div[1]')
        expect(upper.locator('.user_name')).to_have_text(event['user_name'])
        expect(upper.locator('.panel_name')).to_contain_text(event['panel_name'])
        expect(upper.locator('.entity_name')).to_contain_text(entity['entity_name'])
        label = ('Modified' if target == 'review_comment' else
                 'Deleted' if action == 'delete' else
                 'Reviewed' if target == 'review' else 'Assessed')
        expect(upper.locator('.action')).to_have_text(label)
        # Clicking the row center can hit a Panel/Entity link, which does not expand it.
        toggle = upper.locator('.difference-ctl')
        expect(toggle).to_have_text('keyboard_arrow_down')
        with root_page.expect_response(lambda r: response_matches(r, DETAIL_API)) as pending:
            toggle.click()
        expect(toggle).to_have_text('keyboard_arrow_up')
        ui_detail = assert_json_response(pending.value)
        side = 'former_data' if action == 'delete' else 'data'
        assert ui_detail[side]['comment'] == marker
        if target == 'review_comment':
            if action == 'add':
                assert not ui_detail.get('former_data', {}).get('comment')
            elif action == 'change':
                assert ui_detail['former_data']['comment'] == marker.removesuffix('-MODIFIED')
            else:
                assert not ui_detail.get('data', {}).get('comment')
        expect(lower).to_be_visible()
        expect(lower).to_contain_text(marker)
        take_screenshot(root_page, psn_config, f'activity_consistency_{scenario}_{action}')
        checked.append((target, action))

    with browser.new_context(storage_state=str(state), viewport={'width': 1920, 'height': 1080}) as context:
        page = context.new_page()
        query = dict(psn_config.pages[source].get('query', {}))
        for key in psn_config.pages[source].get('required_query', []):
            query[key] = os.getenv('PSN_' + key.upper(), str(query.get(key) or ''))
            if not query[key]:
                pytest.skip(f'Configure {source}.{key} or PSN_{key.upper()}')
        response = page.goto(psn_config.page_url(source, query))
        assert response.ok
        flows = {
            'add_entity': panel_tests.test_panel_detail_add_entity_submit,
            'add_review': panel_tests.test_panel_detail_add_review_submit,
            'comment_lifecycle': entity_tests.test_panel_entity_review_comment_add_modify_delete,
            'definition_lifecycle': entity_tests.test_panel_entity_definition_add_delete_submit,
        }
        flows[scenario](page, psn_config, activity_check=check)
    expected = {'add_entity': [('review', 'add')], 'add_review': [('review', 'add')],
                'comment_lifecycle': [('review_comment', a) for a in ('add', 'change', 'delete')],
                'definition_lifecycle': [('definition', a) for a in ('add', 'delete')]}
    assert checked == expected[scenario]
