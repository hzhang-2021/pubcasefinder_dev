import json
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest
from playwright.sync_api import expect

from test_common import Config, load_config, create_test_result_path, create_case_id, take_screenshot

@pytest.fixture(scope='module')
def create_config(get_config_path_by_lang):
    config_path = get_config_path_by_lang
    raw_config = load_config(config_path)
    return Config(
        raw_config['cases']['disease_search']['result_page']['base_url'],
        raw_config['test_result_path'],
        raw_config['cases']['disease_search']['result_page'],
        None
    )


@pytest.fixture
def root_page(browser, create_config):
    context = browser.new_context(
        accept_downloads=True,
        viewport = {'width': 1920, 'height': 1080},
        permissions = ["clipboard-read", "clipboard-write"]
    )
    page = context.new_page()
    config = create_config
    page.goto(config.base_url)
    return page


@pytest.fixture
def disease_search_top_page(page, get_config_path_by_lang):
    raw_config = load_config(get_config_path_by_lang)
    top_page_config = Config(
        raw_config['cases']['disease_search']['top_page']['base_url'],
        raw_config['test_result_path'],
        raw_config['cases']['disease_search']['top_page'],
        None,
    )
    page.goto(top_page_config.base_url)
    return page, top_page_config


def expect_visible_result_text(root_page, expected_text):
    expect(
        root_page.locator('.list-content_right:visible')
        .filter(has_text=expected_text)
        .first
    ).to_be_visible(timeout=60000)


def expect_visible_result_texts(root_page, expected_texts):
    for expected_text in expected_texts:
        expect_visible_result_text(root_page, expected_text)


def expect_default_genetic_disease_result(root_page, config):
    expected_name = config.test_case('disease_search_result_switch_genetic_disease_tab')['expected']['name']
    expect_visible_result_text(root_page, expected_name)


def click_tokeninput_result(root_page, expected_id):
    result = root_page.locator('.token-input-dropdown-facebook li').filter(
        has_text=expected_id
    ).first
    expect(result).to_be_visible(timeout=60000)
    result.click()


def add_symptom(root_page, symptom):
    root_page.locator("#token-input-tokeninput_hpo").fill(symptom['name'])
    root_page.get_by_role("listitem").filter(
        has_text=' '.join((symptom['id'], symptom['name']))
    ).click()
    expect(
        root_page.locator("#UL-HPO-TOKEN-INPUT-LIST-tokeninput_hpo")
        .get_by_text(symptom['name'], exact=True)
    ).to_be_visible()


def replace_selected_symptom_with_related_concept(root_page, case):
    input_symptom = case['input']
    relation = case['relation']
    expected = case['expected']

    add_symptom(root_page, input_symptom)
    token_list = root_page.locator("#UL-HPO-TOKEN-INPUT-LIST-tokeninput_hpo")
    token_list.locator('li').filter(
        has=root_page.get_by_text(input_symptom['name'], exact=True)
    ).click()

    relation_title = root_page.get_by_text(relation, exact=True).first
    expect(relation_title).to_be_visible()

    relation_panel = relation_title.locator("xpath=..")
    concept_link = relation_panel.get_by_role("link", name=expected['name'], exact=True)
    expect(concept_link).to_be_visible()

    replace_button = concept_link.locator(
        "xpath=ancestor::*[.//button][1]"
    ).locator("button.popup-hierarchy-hpo-button-replace")
    expect(replace_button).to_be_visible()

    replace_button.click()
    expect(token_list.get_by_text(expected['name'], exact=True)).to_be_visible()
    expect(token_list.get_by_text(input_symptom['name'], exact=True)).not_to_be_visible()


def get_share_url(root_page):

    root_page.get_by_role("button", name="share").click()
    copy_button = root_page.get_by_role("button", name="Copy Link")
    expect(copy_button).to_be_visible()
    copy_button.click()

    share_url = root_page.evaluate("""
            async () => {
                for (let i = 0; i < 10; i++) {
                    const text = await navigator.clipboard.readText();
                    if (text) return text;
                    await new Promise(r => setTimeout(r, 100));
                }
                return await navigator.clipboard.readText();
            }
        """)
    assert share_url.startswith('http'), f"share URL is invalid: {share_url}"

    root_page.locator('#btn_copy_link').click()
    root_page.keyboard.press('Escape')
    return share_url


def download_result(root_page, selection, file_format):
    root_page.locator('#btn_search_download').click()
    expect(root_page.locator('#sel_download_option')).to_be_visible()
    root_page.locator('#sel_download_option').select_option(
        value=selection
    )
    root_page.locator('#sel_download_format').select_option(
        value=file_format
    )

    with root_page.expect_download(timeout=60000) as download_info:
        root_page.locator('#btn_download').click()

    return download_info.value


def assert_download_file(download, file_format, expected):
    assert download.suggested_filename.endswith(expected['filename_suffix'])

    downloaded_file = download.path()
    assert downloaded_file, "downloaded file path is empty"

    content = Path(downloaded_file).read_text(encoding='utf-8')
    if file_format == 'json':
        parsed = json.loads(content)
        assert isinstance(parsed, list)
        assert parsed, "downloaded JSON is empty"
        content = json.dumps(parsed, ensure_ascii=False)
    else:
        assert content.splitlines(), "downloaded TSV is empty"

    for expected_text in expected['contains']:
        assert expected_text in content


# 以下4つのランキング切り替えはほとんど同じ実装なのでparameterizeしたいが、fixtureでconfigの読み取りを行っているため、parameterizeは外している
# 遺伝性疾患ランキング切替 #############################################################

def test_disease_search_result_switch_genetic_disease_tab(root_page, create_config):
    config = create_config

    for case in config.test_cases('disease_search_result_switch_genetic_disease_tab'):
        expect(root_page.get_by_text(case['expected']['name']).locator('visible=true').first).to_be_visible()
        expect(root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first).to_be_visible()
        result = root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first
        for label in case['expected']['labels']:
            expect(result.filter(has_text = label)).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)


# 希少疾患ランキング切替 #############################################################

def test_disease_search_result_switch_rare_disease_tab(root_page, create_config):
    config = create_config
    root_page.locator('.tab-button-orphanet').filter(
        has_text = 'Rare Disease'
    ).click()

    for case in config.test_cases('disease_search_result_switch_rare_disease_tab'):
        expect(root_page.get_by_text(case['expected']['name']).locator('visible=true').first).to_be_visible()
        expect(root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first).to_be_visible()
        result = root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first
        for label in case['expected']['labels']:
            expect(result.filter(has_text = label)).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)

# 遺伝子ランキング切替 #############################################################

def test_disease_search_result_switch_gene_tab(root_page, create_config):
    config = create_config
    root_page.locator('.tab-button-gene').filter(
        has_text = 'Gene'
    ).click()

    for case in config.test_cases('disease_search_result_switch_gene_tab'):
        expect(root_page.get_by_text(case['expected']['name']).locator('visible=true').first).to_be_visible()
        expect(root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first).to_be_visible()
        result = root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first
        for label in case['expected']['labels']:
            expect(result.filter(has_text = label)).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)

# 症例ランキング切替 #############################################################

def test_disease_search_result_switch_case_tab(root_page, create_config):
    config = create_config
    root_page.locator('.tab-button-case').filter(
        has_text = 'Case'
    ).click()

    for case in config.test_cases('disease_search_result_switch_case_tab'):
        expect(root_page.get_by_text(case['expected']['name']).locator('visible=true').first).to_be_visible()
        expect(root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first).to_be_visible()
        result = root_page.locator('.list-content_right').locator('visible=true').filter(
            has_text = case['expected']['name']
        ).first
        for label in case['expected']['labels']:
            expect(result.filter(has_text = label)).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)


# 上位概念への入れ替え #############################################################

def test_disease_search_replace_with_superclass(disease_search_top_page):
    page, config = disease_search_top_page
    for case in config.test_cases('disease_search_replace_with_superclass'):
        replace_selected_symptom_with_related_concept(page, case)
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(page, result_path)


# 下位概念への入れ替え #############################################################

def test_disease_search_replace_with_subclass(disease_search_top_page):
    page, config = disease_search_top_page
    for case in config.test_cases('disease_search_replace_with_subclass'):
        replace_selected_symptom_with_related_concept(page, case)
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(page, result_path)

# 検索条件フィルタ #############################################################

def test_disease_search_result_basic_filter(root_page, create_config):
    config = create_config

    for case in config.test_cases('disease_search_result_basic_filter'):
        root_page.locator(f"#PCF-FILTER-LOGICAL-CTL-{case['filter_condition']}-LIST").click()

        for check in case['checklist']:
            filter_item = (
                root_page.locator('#pcf-filter-list-panel .item-panel')
                .filter(has_text=check)
                .filter(has=root_page.locator("input[name='pcf-filter-item-list']"))
                .first
            )

            if not filter_item.is_visible():
                more_button = (
                    root_page.locator('#disease-list_wrapper_div .item-panel.ctl')
                    .filter(has_text='More')
                    .first
                )
                if more_button.is_visible():
                    more_button.click()

            filter_item.scroll_into_view_if_needed()
            expect(filter_item).to_be_visible()
            filter_item.locator("input[name='pcf-filter-item-list']").check()

            filters_applied = (
                root_page.locator('.list-header-down.active:visible')
                .filter(has_text='Filters applied')
                .first
            )
            expect(filters_applied).to_be_visible()
            expect(filters_applied).to_contain_text(check)

        for expected_result in case['expected']:
            expect(
                root_page.locator('.list-content_right:visible')
                .filter(has_text=expected_result)
                .first
            ).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)

        expect(root_page.get_by_text('Clear all')).to_be_visible()
        root_page.get_by_text("Clear all", exact=True).click()
        expect(root_page.locator('.list-header-down.active')).not_to_be_visible()
        print(f'test: {create_case_id(case)} PASS')

# Advanced Filter #############################################################

def test_disease_search_result_advanced_filter(root_page, create_config):
    config = create_config

    root_page.get_by_role("button", name="Advanced Filter expand_more").click()

    filter_token_box = root_page.get_by_role("textbox", name=config.cases['disease_search_result_advanced_filter']['placeholder'])
    expect(filter_token_box).to_be_editable()

    for case in config.test_cases('disease_search_result_advanced_filter'):

        filter_token_box.fill(case['input']['name'])
        root_page.get_by_role("listitem").filter(has_text=case['input']['id']).click()
        expect(root_page.locator('.search-advanced#search-box-filter')).to_contain_text(case['expected']['token'])

        for expected_result in case['expected']['results']:
            expect(root_page.get_by_text(expected_result).filter(visible=True).first).to_be_visible()

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)

        token = root_page.locator('.token-input-token-term-facebook').filter(has_text = case['expected']['token'])
        token.locator('.token-input-delete-token-facebook').click()

        expect(token.get_by_text(case['expected']['token'])).not_to_be_visible()

        print(f'test: {create_case_id(case)} PASS')


# Virtual Gene Panel #############################################################

def test_disease_search_result_virtual_gene_panel(root_page, create_config):
    config = create_config
    expect_default_genetic_disease_result(root_page, config)

    root_page.get_by_role("button", name="Virtual Gene Panel expand_more").click()

    vgp_config = config.cases['disease_search_result_virtual_gene_panel']
    vgp_token_box = root_page.get_by_role("textbox", name=vgp_config['placeholder'])
    expect(vgp_token_box).to_be_editable()

    for case in config.test_cases('disease_search_result_virtual_gene_panel'):
        vgp_token_box.fill(case['input']['name'])
        click_tokeninput_result(root_page, case['input']['id'])

        expect(root_page.locator('.search-advanced#search-box-vgp')).to_contain_text(case['expected']['token'])
        expect(root_page.locator('#btn_search_vgp')).to_contain_text(case['expected']['button_label'])
        expect_visible_result_texts(root_page, case['expected']['results'])

        share_url = get_share_url(root_page)
        assert parse_qs(urlparse(share_url).query).get('vgp') == [case['expected']['share_query']['vgp']]

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        print(f'test: {create_case_id(case)} PASS')


# 検索結果共有リンク #############################################################

def test_disease_search_result_share(root_page, create_config):
    config = create_config
    case = config.test_case('disease_search_result_share')

    share_url = get_share_url(root_page)
    assert share_url == case['expected']['url']

    shared_page = root_page.context.new_page()
    shared_page.goto(share_url)
    expect_visible_result_texts(shared_page, case['expected']['results'])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(shared_page, result_path)
    shared_page.close()
    print(f'test: {create_case_id(case)} PASS')


# 検索結果ダウンロード #############################################################

def test_disease_search_result_download(root_page, create_config):
    config = create_config
    expect_default_genetic_disease_result(root_page, config)

    for case in config.test_cases('disease_search_result_download'):
        for download_format in case['formats']:
            file_format = download_format['format']
            download = download_result(root_page, case['selection'], file_format)
            assert_download_file(download, file_format, download_format['expected'])

            result_path = create_test_result_path(
                create_case_id(case),
                config.test_result_path,
                file_format
            )
            take_screenshot(root_page, result_path)
            print(f"test: {create_case_id(case)}_{file_format} PASS")
