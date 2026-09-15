"""Verify saved PSN login state and UI logout; OAuth login is prepared manually."""
import os
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import expect

from psn_common import ROOT, load_config, take_screenshot, screenshot_filename


def pytest_generate_tests(metafunc):
    if 'auth_case' in metafunc.fixturenames:
        config = load_config(metafunc.config.getoption('--psn-lang'))
        cases = config.test_cases('login_logout')
        metafunc.parametrize('auth_case', cases, ids=[case['id'] for case in cases])


def test_login_logout(browser, psn_config, request, auth_case):
    suite = psn_config.cases['login_logout']
    role = suite['role']
    state = Path(os.getenv('PSN_' + role.upper() + '_STATE',
                           str(ROOT / psn_config.settings['auth_states'][role])))
    if not state.is_file():
        message = f'Login/logout requires {role} login state: {state}'
        if request.config.getoption('--psn-require-auth'):
            pytest.fail(message)
        pytest.skip(message)
    page_name = auth_case['page']
    settings = psn_config.pages[page_name]
    query = dict(settings.get('query', {}))
    for key in settings.get('required_query', []):
        query[key] = os.getenv('PSN_' + key.upper(), str(query.get(key) or ''))
        if not query[key]:
            pytest.skip(f'Configure pages.{page_name}.query.{key}')

    context = browser.new_context(storage_state=str(state),
                                  viewport={'width': 1920, 'height': 1080})
    page = context.new_page()
    try:
        response = page.goto(psn_config.page_url(page_name, query))
        assert response and response.ok, 'Authenticated page navigation failed'
        assert urlparse(page.url).path == settings['path'], 'Unexpected login redirect'
        user = page.locator(suite['user_selector'])
        expect(user).to_be_visible()
        if suite.get('expected_user_name'):
            expect(user).to_contain_text(suite['expected_user_name'])
        expect(page.locator(suite['login_selector'])).not_to_be_visible()
        take_screenshot(page, psn_config, 'PSN-AUTH-01', page_name=page_name)

        user.click()
        logout = page.locator(suite['logout_selector'])
        expect(logout).to_be_visible()
        logout.click()
        expect(page.locator(suite['login_selector'])).to_be_visible()
        expect(page.locator(suite['user_selector'])).not_to_be_visible()
        # Confirm logout persists beyond the immediate UI transition.
        page.reload()
        expect(page.locator(suite['login_selector'])).to_be_visible()
        expect(page.locator(suite['user_selector'])).not_to_be_visible()
        take_screenshot(page, psn_config, 'PSN-AUTH-02', page_name=page_name)
    except Exception:
        folder = ROOT / psn_config.settings['test_result_path'] / 'failures'
        folder.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(folder / screenshot_filename(page_name, 'login_logout')))
        raise
    finally:
        context.close()
