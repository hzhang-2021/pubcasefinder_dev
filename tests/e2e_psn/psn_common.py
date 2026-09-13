"""Configuration and browser helpers shared by the per-page PSN suites."""
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlencode, urlparse
import os
import re

import yaml
from playwright.sync_api import expect

ROOT = Path(__file__).resolve().parent


@dataclass
class Config:
    settings: dict
    pages: dict
    cases: dict

    def page_url(self, name, query=None):
        page = self.pages[name]
        params = {**page.get('query', {}), **(query or {}), 'lang': self.settings['lang']}
        return self.settings['origin'].rstrip('/') + page['path'] + '?' + urlencode(params)

    def test_cases(self, name):
        suite = self.cases[name]
        return [{**case, 'spec_id': suite['spec_id']} for case in suite['test_cases']]


def load_config(lang):
    directory = Path(os.getenv('PSN_CONFIG_DIR', str(ROOT / 'config')))
    with (directory / lang / 'config.yaml').open(encoding='utf-8') as source:
        raw = yaml.safe_load(source)
    raw['settings']['origin'] = os.getenv('PSN_BASE_URL', raw['settings']['origin'])
    origin = raw['settings']['origin']
    parsed = urlparse(origin)
    if (parsed.scheme not in ('http', 'https') or not parsed.netloc
            or parsed.path not in ('', '/') or parsed.query or parsed.fragment):
        example = f'{parsed.scheme}://{parsed.netloc}' if parsed.netloc else 'http://pcf.bits.cc'
        raise ValueError(
            f'settings.origin / PSN_BASE_URL must contain only scheme and host '
            f'(optional port), without a page path, query or fragment. '
            f'Use {example!r}; page paths are configured in pages.*.path.'
        )
    return Config(raw['settings'], raw['pages'], raw['suites'])


def assert_json_response(response):
    assert response.ok, f'{response.request.method} {response.url}: HTTP {response.status}'
    body = response.json()
    if isinstance(body, dict):
        assert not body.get('error'), f'API error from {response.url}'
        assert body.get('status') != 'error', f'API error from {response.url}'
    return body


def response_matches(response, path):
    return urlparse(response.url).path == path


def take_screenshot(page, config, case_id):
    for selector in ('#vgp-loader-whole', '#vgp-loader', '#fh5co-loader'):
        for loader in page.locator(selector).all():
            expect(loader).not_to_be_visible(timeout=60000)
    folder = ROOT / config.settings['test_result_path']
    folder.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(folder / (re.sub(r'[^\w.-]', '_', case_id) + '.png')))


def assert_page(page, config, page_name):
    for selector in config.pages[page_name]['visible']:
        expect(page.locator(selector)).to_be_visible()
    for selector in config.pages[page_name].get('attached', []):
        expect(page.locator(selector)).to_be_attached()
    for case in config.test_cases(page_name):
        for selector, expected in case.get('expected_text', {}).items():
            expect(page.locator(selector)).to_contain_text(expected)
    take_screenshot(page, config, config.cases[page_name]['spec_id'] + '_visible')


def assert_tabs(page, config, page_name):
    for tab, panel in config.pages[page_name].get('tabs', []):
        page.locator(tab).click()
        expect(page.locator(panel)).to_be_visible()
        expect(page.locator(tab)).to_have_attribute('aria-selected', 'true')
        take_screenshot(page, config, page_name + '_' + tab.lstrip('#'))
