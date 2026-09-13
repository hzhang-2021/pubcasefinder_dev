"""Browser tests for /panelsearch_nanbyo_panel_detail."""
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_detail'


def test_panel_detail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_detail_tabs(root_page, psn_config):
    assert_tabs(root_page, psn_config, PAGE)


def test_panel_detail_download(root_page, psn_config):
    from pathlib import Path
    with root_page.expect_download(timeout=60000) as result:
        root_page.locator('#btn_download_panel').click()
    download = result.value
    assert download.failure() is None
    assert download.suggested_filename.endswith('.tsv')
    content = Path(download.path()).read_text(encoding='utf-8-sig')
    assert content.strip(), 'Downloaded panel is empty'
    for expected in psn_config.cases[PAGE].get('download_contains', []):
        assert expected in content
    take_screenshot(root_page, psn_config, 'panel_detail_download')
