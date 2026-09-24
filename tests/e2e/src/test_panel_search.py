import re
from pathlib import Path
from urllib.parse import unquote

import pytest
from playwright.sync_api import expect

from test_common import Config, load_config, create_case_id, create_test_result_path, take_screenshot


@pytest.fixture(scope='module')
def create_config(get_config_path_by_lang):
    config_path = get_config_path_by_lang
    raw_config = load_config(config_path)

    return Config(
        raw_config['cases']['panel_search']['base_url'],
        raw_config['test_result_path'],
        raw_config['cases']['panel_search'],
        None
    )


@pytest.fixture
def root_page(browser, create_config):
    context = browser.new_context(
        accept_downloads=True,
        permissions=["clipboard-read", "clipboard-write"],
        viewport={'width': 1920, 'height': 1080}
    )
    page = context.new_page()
    page.goto(create_config.base_url)
    expect(page.locator("#vgp-filter")).to_be_visible()
    return page


def wait_for_panel_results(page):
    expect(page.locator("#vgp-content-list .vgp-panel-row").first).to_be_visible(timeout=60000)
    page.wait_for_function(
        """() => {
            const node = document.querySelector('#vgp-searched-panels-num');
            if (!node) return false;
            return Number(node.textContent.replace(/,/g, '')) > 0;
        }""",
        timeout=60000
    )


def search_panel_text(page, text: str):
    page.locator("#vgp-filter").fill(text)
    page.locator("#vgp-filter").press("Enter")
    wait_for_panel_results(page)


def change_panel_search_target(page, target: str):
    page.locator("#btn-vgp-target").click()
    page.locator(".dropdown-menu .dropdown-item").filter(has_text=target).click()
    expect(page.locator("#btn-vgp-target")).to_contain_text(target)


def get_panel_result_row(page, label: str):
    panel_row = page.locator("#vgp-content-list .vgp-panel-row").filter(has_text=label).first
    expect(panel_row).to_be_visible(timeout=60000)
    return panel_row


def get_panel_row_action_button(panel_row, icon_text: str):
    button = panel_row.locator(".vgp-button-panel button").filter(has_text=icon_text).first
    expect(button).to_be_visible()
    return button


def expect_selected_tree_panel(page, panel_id: str):
    selected_node = page.locator(
        f"#vgp-treeView a.curSelectedNode[title='{panel_id}']"
    ).first
    expect(selected_node).to_be_visible(timeout=60000)
    return selected_node


def show_related_category_tree(page, case):
    search_panel_text(page, case['input'])
    panel_row = get_panel_result_row(page, case['expected']['label'])
    panel_row.locator(".vgp-treeview-btn").click()
    expect_selected_tree_panel(page, case['expected']['panel_id'])


def open_panel_detail_page(root_page, case):
    search_panel_text(root_page, case['input'])
    panel_row = get_panel_result_row(root_page, case['expected']['label'])

    # 別タブで開かれたページはplaywrightではpopupとして扱われる
    with root_page.expect_popup() as popup_info:
        panel_row.locator(".vgp-name").click()

    detail_page = popup_info.value
    detail_page.wait_for_load_state("domcontentloaded")

    expected_title = case['expected'].get('known_as') or case['expected']['label']
    expect(detail_page.locator("#vgp-panel-name")).to_contain_text(expected_title, timeout=60000)
    expect(detail_page.locator("#btn_download_panel")).to_be_visible()
    expect_detail_gene_list(detail_page, case['expected']['min_gene_count'])

    return detail_page


def get_toggle_count(toggle):
    match = re.search(r'\(([\d,]+)\)', toggle.locator("span").inner_text())
    assert match is not None
    return int(match.group(1).replace(',', ''))


def expect_detail_gene_list(page, min_gene_count: int):
    gene_names = page.locator("#vgp-panel-gene-table-tbody tr .vgp-panel-gene-name")
    expect(gene_names.nth(min_gene_count - 1)).to_be_visible(timeout=60000)

    for index in range(min_gene_count):
        expect(gene_names.nth(index)).to_have_text(re.compile(r'\S+'))

    gene_count = int(
        page.locator(".vgp-panel-genes-num").inner_text().replace(',', '')
    )
    assert gene_count >= min_gene_count

    return gene_names


def assert_download_text_file(download, expected):
    if 'filename' in expected:
        assert download.suggested_filename == expected['filename']

    downloaded_file = download.path()
    assert downloaded_file, "downloaded file path is empty"

    content = Path(downloaded_file).read_text(encoding='utf-8')
    assert content.splitlines(), "downloaded file is empty"

    for expected_text in expected['contains']:
        assert expected_text in content


def read_clipboard_text(page):
    return page.evaluate("""
        async () => {
            for (let i = 0; i < 10; i++) {
                const text = await navigator.clipboard.readText();
                if (text) return text;
                await new Promise(r => setTimeout(r, 100));
            }
            return await navigator.clipboard.readText();
        }
    """)


def clear_clipboard(page):
    page.evaluate("async () => await navigator.clipboard.writeText('')")


def expect_history_button_active(page, selector: str):
    expect(page.locator(selector)).to_have_class(re.compile(r'.*\bvgp-active\b.*'), timeout=60000)


# Panel検索 #############################################################

def test_panel_search_by_panel_name(root_page, create_config):
    config = create_config

    for case in config.test_cases('panel_search_by_panel_name'):
        search_panel_text(root_page, case['input'])
        expect(root_page.locator("#vgp-content-list")).to_contain_text(
            case['expected']['result_text'],
            timeout=60000
        )

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        print(f'{create_case_id(case)} PASS')


# Gene検索 #############################################################

def test_panel_search_by_gene(root_page, create_config):
    config = create_config

    for case in config.test_cases('panel_search_by_gene'):
        change_panel_search_target(root_page, "Gene")
        search_panel_text(root_page, case['input'])
        expect(root_page.locator("#vgp-content-list")).to_contain_text(
            case['expected']['result_text'],
            timeout=60000
        )

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        print(f'{create_case_id(case)} PASS')


# Tree検索 #############################################################

def test_panel_search_by_tree(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_by_tree')

    root_page.wait_for_function(
        "() => document.querySelectorAll('#vgp-treeView li a').length > 1",
        timeout=60000
    )
    tree_node = root_page.locator("#vgp-treeView li a").filter(has_text=case['tree_node'])
    expect(tree_node).to_be_visible()
    tree_node.click()
    wait_for_panel_results(root_page)

    expect(root_page.locator('#vgp-panels-total-num')).to_contain_text(case['expected_panel_count'])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 遺伝子リストを表示 #############################################################

def test_panel_search_result_gene_list_is_visible(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_result_gene_list_is_visible')

    search_panel_text(root_page, case['input'])
    panel_row = get_panel_result_row(root_page, case['expected']['label'])

    genes_toggle = panel_row.locator(".list-show a").filter(has_text="Genes").first
    expect(genes_toggle).to_be_visible()
    assert get_toggle_count(genes_toggle) >= case['expected']['min_gene_count']

    genes_toggle.click()
    expect(genes_toggle.locator("span")).to_contain_text("Hide")

    gene_list = panel_row.locator(".list-show-panel.vgp-active").first
    expect(gene_list).to_be_visible(timeout=60000)
    expect(gene_list.locator("togostanza-pagination-table")).to_be_visible(timeout=60000)

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# panel詳細表示 #############################################################

def test_panel_search_panel_describe_visible(root_page, create_config):
    config = create_config
    case = config.test_case('test_panel_search_panel_describe_visible')

    search_panel_text(root_page, case['input'])
    expect(root_page.locator("#vgp-content-list")).to_contain_text(
        case['expected']['label'],
        timeout=60000
    )
    panel_row = get_panel_result_row(root_page, case['expected']['label'])

    # 別タブで開かれたページはplaywrightではpopupとして扱われる
    with root_page.expect_popup() as popup_info:
        panel_row.locator(".vgp-name").click()

    detail_page = popup_info.value

    gene_names = expect_detail_gene_list(detail_page, case['expected']['min_gene_count'])
    expect(detail_page.locator("#vgp-panel-gene-table-tbody tr").first).to_be_visible()
    expect(gene_names.first).to_be_visible()

    if case['expected']['known_as']:
        expect(detail_page.locator('#vgp-panel-name')).to_contain_text(case['expected']['known_as'])
    else:
        expect(detail_page.locator('#vgp-panel-name')).to_contain_text(case['expected']['label'])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(detail_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 個別パネルダウンロード #############################################################

def test_panel_search_detail_panel_download(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_detail_panel_download')

    detail_page = open_panel_detail_page(root_page, case)

    with detail_page.expect_download(timeout=60000) as download_info:
        detail_page.get_by_role('button', name = 'Download').click()

    assert_download_text_file(download_info.value, case['expected']['download'])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(detail_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 全件ダウンロード #############################################################

def test_panel_search_all_panel_download(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_all_panel_download')

    wait_for_panel_results(root_page)

    with root_page.expect_download(timeout=60000) as download_info:
        root_page.get_by_role('button', name = 'All panels').click()

    assert_download_text_file(download_info.value, case['expected']['download'])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# パネル情報コピー #############################################################

def test_panel_search_panel_info_copy(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_panel_info_copy')

    search_panel_text(root_page, case['input'])
    panel_row = get_panel_result_row(root_page, case['expected']['label'])

    clear_clipboard(root_page)
    get_panel_row_action_button(panel_row, "file_copy").click()

    clipboard_text = read_clipboard_text(root_page)
    for expected_text in case['expected']['contains']:
        assert expected_text in clipboard_text

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 関連カテゴリーツリー表示 #############################################################

def test_panel_search_related_category_tree_is_visible(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_related_category_tree_is_visible')

    show_related_category_tree(root_page, case)

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 表示履歴（元に戻す/やり直す） #############################################################

def test_panel_search_display_history_undo_redo(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_display_history_undo_redo')
    first_search = case['searches'][0]
    second_search = case['searches'][1]

    show_related_category_tree(root_page, first_search)
    take_screenshot(
        root_page,
        create_test_result_path(create_case_id(case), config.test_result_path, first_search['id'])
    )

    show_related_category_tree(root_page, second_search)
    take_screenshot(
        root_page,
        create_test_result_path(create_case_id(case), config.test_result_path, second_search['id'])
    )
    expect_history_button_active(root_page, "#vgp-undo-btn")

    root_page.locator("#vgp-undo-btn").click()
    expect_selected_tree_panel(root_page, first_search['expected']['panel_id'])
    take_screenshot(
        root_page,
        create_test_result_path(create_case_id(case), config.test_result_path, 'after_undo')
    )
    expect_history_button_active(root_page, "#vgp-redo-btn")

    root_page.locator("#vgp-redo-btn").click()
    expect_selected_tree_panel(root_page, second_search['expected']['panel_id'])
    take_screenshot(
        root_page,
        create_test_result_path(create_case_id(case), config.test_result_path, 'after_redo')
    )
    print(f'{create_case_id(case)} PASS')


# 個別パネルのコピーリンク #############################################################
# TODO: 現状個別パネルのコピーリンクは機能していない

# def test_panel_search_detail_copy_link(root_page, create_config):
#     config = create_config
#     case = config.test_case('panel_search_detail_copy_link')

#     detail_page = open_panel_detail_page(root_page, case)

#     clear_clipboard(detail_page)
#     detail_page.locator("#btn_copy_link").click()

#     clipboard_text = read_clipboard_text(detail_page)
#     assert clipboard_text == detail_page.url
#     assert case['expected']['panel_id'] in clipboard_text

#     result_path = create_test_result_path(create_case_id(case), config.test_result_path)
#     take_screenshot(detail_page, result_path)
#     print(f'{create_case_id(case)} PASS')


# カスタムパネルのseeAll画面 #############################################################

def test_panel_search_custom_panel_see_all(root_page, create_config):
    config = create_config
    case = config.test_case('panel_search_custom_panel_see_all')

    for panel in case['panels']:
        search_panel_text(root_page, panel['input'])
        panel_row = get_panel_result_row(root_page, panel['expected']['label'])
        add_button = panel_row.locator(".vgp-button-panel button.common-panel")
        add_button.click()

    expect(root_page.locator("#common-panel-count")).to_have_text(str(len(case['panels'])))
    root_page.locator("#nav-common-panel").click()
    see_all_link = root_page.get_by_text('See All')
    expect(see_all_link).to_be_visible()

    with root_page.expect_popup() as popup_info:
        see_all_link.click()

    custom_panel_page = popup_info.value
    custom_panel_page.wait_for_load_state("domcontentloaded")
    panel_table = custom_panel_page.locator("#vgp-panel-table-tbody")

    for panel in case['panels']:
        expect(panel_table).to_contain_text(panel['expected']['custom_panel_label'])
        assert panel['expected']['panel_id'] in unquote(custom_panel_page.url)

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(custom_panel_page, result_path)
    print(f'{create_case_id(case)} PASS')
