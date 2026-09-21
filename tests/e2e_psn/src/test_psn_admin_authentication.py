"""Browser tests for /panelsearch_nanbyo_admin_authentication."""
from datetime import datetime

import pytest
from playwright.sync_api import expect
from psn_common import assert_page, assert_json_response, response_matches, take_screenshot

PAGE = 'admin_authentication'


def test_admin_authentication_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_admin_authentication_filter_no_match(root_page, psn_config):
    term = psn_config.cases[PAGE]['no_match_text']
    with root_page.expect_response(lambda r: response_matches(r, '/panelsearch_nanbyo_admin_load_authentication_log')) as result:
        root_page.locator('#filter_letter').fill(term)
    assert_json_response(result.value)
    expect(root_page.locator('#total_num')).to_have_text('0')
    take_screenshot(root_page, psn_config, PAGE + '_no_match')


AUTHLOG_API = '/panelsearch_nanbyo_admin_load_authentication_log'


def _initial_logs(page):
    # Capture fresh real data without hard-coding account details or dates.
    with page.expect_response(lambda r: response_matches(r, AUTHLOG_API)) as pending:
        page.reload(wait_until='domcontentloaded')
    logs = assert_json_response(pending.value)
    assert isinstance(logs, list)
    if not logs:
        pytest.skip('Authentication filter tests require existing authentication logs')
    return logs


def _filter_logs(page, selector, value, field, expected):
    with page.expect_response(
        lambda r: response_matches(r, AUTHLOG_API)
        and r.request.post_data_json.get(field) == expected
    ) as pending:
        page.locator(selector).fill(value)
        page.locator(selector).blur()
    logs = assert_json_response(pending.value)
    assert isinstance(logs, list)
    assert logs, 'Filtering by a value from existing logs must return a match'
    expect(page.locator(selector)).to_have_value(value)
    expect(page.locator('#total_num')).to_have_text(str(len(logs)))
    expect(page.locator('#authlog_table_tbody tr').first).to_be_visible()
    return logs


def _test_text_filter(page, config, field):
    initial = _initial_logs(page)
    value = next((str(row[field]).strip() for row in initial if row.get(field)), None)
    if not value:
        pytest.skip(f'Authentication logs require a non-empty {field}')
    # The shared search box removes whitespace before submitting.
    term = ''.join(value.split())
    logs = _filter_logs(page, '#filter_letter', term, 'filter_name', term)
    assert any(''.join(str(row.get(field) or '').split()).casefold() == term.casefold()
               for row in logs), 'The source account must remain in the results'
    for row in logs:
        assert any(term.casefold() in ''.join(str(row.get(key) or '').split()).casefold()
                   for key in ('user_name', 'email')), 'An unrelated log passed the text filter'
    take_screenshot(page, config, PAGE + '_' + field + '_filter')


def test_admin_authentication_user_name_filter(root_page, psn_config):
    _test_text_filter(root_page, psn_config, 'user_name')


def test_admin_authentication_mail_filter(root_page, psn_config):
    _test_text_filter(root_page, psn_config, 'email')


def _test_date_filter(page, config, *, from_date):
    initial = _initial_logs(page)
    dates = sorted(datetime.fromisoformat(row['created_at']).date() for row in initial)
    value = dates[len(dates) // 2].isoformat()
    selector = '#dateFrom' if from_date else '#dateTo'
    field = 'filter_fromdate' if from_date else 'filter_todate'
    expected = value if from_date else value + ' 23:59:59'
    logs = _filter_logs(page, selector, value, field, expected)
    boundary = datetime.fromisoformat(expected)
    for row in logs:
        actual = datetime.fromisoformat(row['created_at'])
        assert (actual >= boundary if from_date else actual <= boundary), (
            'A log outside the requested date range was returned')
    assert any(row['created_at'][:10] == value for row in logs), (
        'Logs on the selected boundary date must be included')
    take_screenshot(page, config, PAGE + ('_date_from_filter' if from_date else '_date_to_filter'))


def test_admin_authentication_date_from_filter(root_page, psn_config):
    _test_date_filter(root_page, psn_config, from_date=True)


def test_admin_authentication_date_to_filter(root_page, psn_config):
    _test_date_filter(root_page, psn_config, from_date=False)
