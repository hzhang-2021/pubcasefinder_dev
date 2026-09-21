"""Browser tests for /panelsearch_nanbyo_admin_group_activity."""
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.sync_api import expect
from psn_common import assert_page, assert_json_response, response_matches, take_screenshot

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
