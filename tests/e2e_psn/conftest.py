"""One clean browser context per test; external login states are role-specific."""
from contextlib import ExitStack
from pathlib import Path
from urllib.parse import urlparse
import os

import pytest
from playwright.sync_api import expect

from psn_common import ROOT, load_config, assert_json_response, response_matches

expect.set_options(timeout=30000)


def pytest_addoption(parser):
    # Separate destinations prevent a collision when both E2E projects are collected.
    parser.addoption('--psn-lang', choices=['ja', 'en'], default='ja')
    parser.addoption('--psn-require-auth', action='store_true',
                     help='Fail rather than skip when a required storage state is missing')


@pytest.fixture(scope='session')
def psn_config(request):
    return load_config(request.config.getoption('--psn-lang'))


@pytest.fixture
def root_page(browser, psn_config, request):
    name = request.module.PAGE
    settings = psn_config.pages[name]
    role = settings.get('role', 'anonymous')
    options = dict(accept_downloads=True, viewport={'width': 1920, 'height': 1080},
                   permissions=['clipboard-read', 'clipboard-write'])
    if role != 'anonymous':
        state = Path(os.getenv('PSN_' + role.upper() + '_STATE',
                               str(ROOT / psn_config.settings['auth_states'][role])))
        if not state.is_file():
            message = f'{name} requires {role} login state: {state}'
            if request.config.getoption('--psn-require-auth'):
                pytest.fail(message)
            pytest.skip(message)
        options['storage_state'] = str(state)
    query = dict(settings.get('query', {}))
    for key in settings.get('required_query', []):
        value = os.getenv('PSN_' + key.upper(), str(query.get(key) or ''))
        if not value:
            pytest.skip(f'Configure pages.{name}.query.{key} or PSN_{key.upper()}')
        query[key] = value
    context = browser.new_context(**options)
    page = context.new_page()
    try:
        # Register listeners before navigation so fast initial AJAX responses are caught.
        with ExitStack() as stack:
            pending = [stack.enter_context(page.expect_response(
                lambda response, path=path: response_matches(response, path), timeout=60000
            )) for path in settings.get('load_apis', [])]
            response = page.goto(psn_config.page_url(name, query), wait_until='domcontentloaded')
            assert response and response.ok, f'{name}: page navigation failed'
            assert urlparse(page.url).path == settings['path'], f'{name}: redirected; check login state'
        for item in pending:
            assert_json_response(item.value)
        yield page
    finally:
        try:
            if getattr(request.node, 'rep_call', None) and request.node.rep_call.failed:
                folder = ROOT / psn_config.settings['test_result_path'] / 'failures'
                folder.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(folder / (request.node.name.replace(':', '_') + '.png')))
        finally:
            context.close()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    setattr(item, 'rep_' + report.when, report)
