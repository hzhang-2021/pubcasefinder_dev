import pytest
from playwright.sync_api import expect

from test_common import Config, load_config, create_case_id, create_test_result_path, take_screenshot

@pytest.fixture(scope='module')
def create_config(get_config_path_by_lang):
    config_path = get_config_path_by_lang
    raw_config = load_config(config_path)
    return Config(
        None,
        raw_config['test_result_path'],
        raw_config['cases']['login_logout'],
        raw_config['auth_state_path'],
    )

def test_login_logout(browser, create_config):
    config = create_config
    # print(config.cases)
    for case in config.cases:
        context = browser.new_context(
            storage_state=config.auth_state_path
        )
        page = context.new_page()
        page.goto(case['url'])
        login_result = create_test_result_path(
            create_case_id(case, 'AUTH-01'),
            config.test_result_path,
            'login',
        )
        logout_result = create_test_result_path(
            create_case_id(case, 'AUTH-02'),
            config.test_result_path,
            'logout',
        )

        expect(page.get_by_text(case['expected_user_name'])).to_be_visible()
        take_screenshot(page, login_result)
        page.get_by_text(case['expected_user_name']).click()
        page.get_by_role("button", name=case['logout_button']).click()
        expect(page.locator("#nav-login").get_by_text("Log in", exact=True)).to_be_visible()
        take_screenshot(page, logout_result)
        print(f'{create_case_id(case)} PASS')
