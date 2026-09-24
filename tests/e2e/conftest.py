import os
from dataclasses import dataclass, field

import pytest
from playwright.sync_api import expect

from src.test_common import CONFIG_DIR_PATH

expect.set_options(timeout=30_000)

# https://docs.pytest.org/en/7.1.x/reference/reference.html#initialization-hooks
def pytest_addoption(parser):
    parser.addoption('--app-lang', action='store', default='ja', help='language: ja, en')

@pytest.fixture(scope='session')
def get_config_path_by_lang(request):
    lang = request.config.getoption('--app-lang')

    if lang == 'ja':
        return(CONFIG_DIR_PATH.rstrip('/') + '/ja/' + 'config.yaml')
    if lang == 'en':
        return(CONFIG_DIR_PATH.rstrip('/') + '/en/' + 'config.yaml')
