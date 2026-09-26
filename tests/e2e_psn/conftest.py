"""One clean browser context per test; external login states are role-specific."""
from contextlib import ExitStack
from pathlib import Path
from urllib.parse import urlparse
import os

import pytest
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError, expect

from psn_common import (ROOT, load_config, assert_json_response, response_matches,
                        screenshot_filename, wait_for_loaders)

expect.set_options(timeout=30000)

MUTATION_ENV_VARS = (
    'PSN_ADD_ENTITY_MUTATION',
    'PSN_REVIEW_COMMENT_MUTATION',
    'PSN_DEFINITION_MUTATION',
)


def pytest_addoption(parser):
    # Separate destinations prevent a collision when both E2E projects are collected.
    parser.addoption('--psn-lang', choices=['ja', 'en'], default='ja')
    parser.addoption('--psn-require-auth', action='store_true',
                     help='Fail rather than skip when a required storage state is missing')
    parser.addoption(
        '--psn-enable-mutations',
        action='store_true',
        help='Enable all PSN tests that write to the configured server',
    )


def pytest_configure(config):
    if not config.getoption('--psn-enable-mutations'):
        return
    config._psn_mutation_original_env = {
        name: os.environ.get(name) for name in MUTATION_ENV_VARS
    }
    for name in MUTATION_ENV_VARS:
        os.environ[name] = '1'


def pytest_unconfigure(config):
    original = getattr(config, '_psn_mutation_original_env', None)
    if original is None:
        return
    for name, value in original.items():
        if value is None:
            os.environ.pop(name, None)
        else:
            os.environ[name] = value


@pytest.fixture(scope='session')
def psn_config(request):
    return load_config(request.config.getoption('--psn-lang'))


@pytest.fixture
def root_page(browser, psn_config, request):
    name = request.module.PAGE
    settings = psn_config.pages[name]
    role = getattr(request, 'param', settings.get('role', 'anonymous'))
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
        url = psn_config.page_url(name, query)
        for attempt in range(2):
            try:
                # Register listeners before navigation so fast initial AJAX responses are caught.
                with ExitStack() as stack:
                    pending = [stack.enter_context(page.expect_response(
                        lambda response, path=path: response_matches(response, path), timeout=60000
                    )) for path in settings.get('load_apis', [])]
                    response = page.goto(url, wait_until='domcontentloaded')
                    assert response and response.ok, f'{name}: page navigation failed'
                    assert urlparse(page.url).path == settings['path'], (
                        f'{name}: redirected; check login state')
                for item in pending:
                    assert_json_response(item.value)
                wait_for_loaders(page)
                break
            except PlaywrightTimeoutError:
                if attempt == 1:
                    raise
        yield page
    finally:
        try:
            if getattr(request.node, 'rep_call', None) and request.node.rep_call.failed:
                folder = ROOT / psn_config.settings['test_result_path'] / 'failures'
                folder.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(folder / screenshot_filename(name, request.node.name)))
        finally:
            context.close()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    setattr(item, 'rep_' + report.when, report)
