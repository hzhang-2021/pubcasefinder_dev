import os

from copy import deepcopy
import inspect as isp
from dataclasses import dataclass
from urllib.parse import urlencode

import yaml

@dataclass
class Config:
    base_url: str | None
    test_result_path: str
    cases: dict | list
    auth_state_path: str | None

    def test_cases(self, name: str):
        test = self.cases[name]
        return [
            {**case, 'spec_id': test.get('spec_id')}
            for case in test['test_cases']
        ]

    def test_case(self, name: str):
        cases = self.test_cases(name)
        assert len(cases) == 1, f"expected one test case for {name}, got {len(cases)}"
        return cases[0]

CONFIG_DIR_PATH = os.getenv('CONFIG_DIR_PATH', 'config')

LOADING_SELECTORS = (
    '#fh5co-loader',
    '.fh5co-loader',
    '#vgp-loader-whole',
    '#vgp-loader',
    '#text-input-loader',
)

def create_case_id(obj: dict, spec_id: str | None = None):
    caller_frame = isp.currentframe().f_back
    caller_name = caller_frame.f_code.co_name
    case_id = caller_name.removeprefix('test_') + '_' + obj.get('id')
    return '_'.join(filter(None, (spec_id or obj.get('spec_id'), case_id)))

def create_test_result_path(id: str, test_result_path: str, *args):
    return test_result_path.rstrip('/') + '/' + '_'.join((id, *args)) + '.png'

def take_screenshot(page, path):
    for selector in LOADING_SELECTORS:
        page.locator(selector).wait_for(state='hidden', timeout=60000)
    page.screenshot(path=path)

def encode_query_value(value):
    encoder = {list: ','.join}.get(type(value), str)
    return encoder(value)

def build_page_url(settings: dict, page: dict):
    origin = settings['origin'].rstrip('/')
    path = '/' + page.get('path', '/').lstrip('/')
    query = deepcopy(page.get('query', {}))
    query['lang'] = settings['lang']

    return origin + path + '?' + urlencode({
        key: encode_query_value(value)
        for key, value in query.items()
    })

def build_page_urls(settings: dict, pages: dict):
    return {
        name: build_page_url(settings, page)
        for name, page in pages.items()
    }

def login_logout_suite(suites: list, args_dict: dict, page_urls: dict):
    normalized = deepcopy(suites)
    for suite in normalized:
        suite['url'] = page_urls[suite['page']]
        for key, value in args_dict.items():
            suite[key] = value
    return normalized



def page_suite(suite: dict, page_urls: dict):
    normalized = deepcopy(suite)
    tests = normalized.pop('tests')
    normalized.pop('page')
    normalized.pop('base_url', None)
    normalized['base_url'] = page_urls[suite['page']]
    normalized.update(tests)
    return normalized

def normalize_config(config):
    settings = config['settings']
    suites = config['suites']

    page_urls = build_page_urls(settings, config['pages'])

    return {
        'test_result_path': settings['test_result_path'],
        'auth_state_path': settings['auth_state_path'],
        'cases': {
            'login_logout': login_logout_suite(
                suites['login_logout']['test_cases'],
                {
                    'logout_button': suites['login_logout']['logout_button'],
                    'expected_user_name': suites['login_logout']['expected_user_name'],
                },
                page_urls,
            ),
            'disease_search': {
                'top_page': page_suite(
                    suites['disease_search']['top_page'],
                    page_urls,
                ),
                'result_page': page_suite(
                    suites['disease_search']['result_page'],
                    page_urls,
                ),
            },
            'casesharing': page_suite(
                suites['casesharing'],
                page_urls,
            ),
            'panel_search': page_suite(
                suites['panel_search'],
                page_urls,
            ),
        },
    }

def load_config(config_path):
    with open(config_path, 'r', encoding='utf-8') as r:
        config = yaml.safe_load(r)
    return normalize_config(config)
