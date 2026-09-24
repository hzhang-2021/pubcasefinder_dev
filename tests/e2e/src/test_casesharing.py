from pathlib import Path

import pytest
from playwright.sync_api import expect, Page

from test_common import Config, load_config, create_test_result_path, create_case_id, take_screenshot


@pytest.fixture(scope='module')
def create_config(get_config_path_by_lang):
    config_path = get_config_path_by_lang
    raw_config = load_config(config_path)
    return Config(
        raw_config['cases']['casesharing']['base_url'],
        raw_config['test_result_path'],
        raw_config['cases']['casesharing'],
        None
    )


@pytest.fixture
def root_page(browser, create_config):
    config = create_config
    context = browser.new_context(
        accept_downloads=True,
        viewport={'width': 1920, 'height': 1080}
    )
    # showSaveFilePickerが存在すると既存実装はネイティブ保存ダイアログを使い、
    # Playwrightのdownloadイベントが発火しないため、削除してフォールバック保存を使わせる。
    context.add_init_script("""
        for (const target of [window, Window.prototype]) {
            try {
                delete target.showSaveFilePicker;
            } catch (error) {}
        }
    """)
    page = context.new_page()
    page.goto(config.base_url)
    return page


def accept_overwrite_dialog(dialog, message):
    assert dialog.type == "confirm"
    assert dialog.message == message
    dialog.accept()


def casesharing_upload_data(
    page: Page,
    confirm_dialog_message: str,
    path: str,
    case_count: str,
    input_selector: str = "#import_btn",
):
    upload_path = Path(path).resolve()
    assert upload_path.is_file(), f"upload file not found: {upload_path}"
    page.once(
        'dialog',
        lambda dialog: accept_overwrite_dialog(dialog, confirm_dialog_message)
    )
    page.locator(input_selector).set_input_files(path)
    expect(page.locator("#row_count")).to_have_text(case_count)


def accept_delete_dialog(dialog):
    assert dialog.type == "confirm"
    dialog.accept()


def get_case_detail_field_aliases(config: Config) -> dict:
    return config.cases["field_aliases"]["detail"]


def resolve_case_detail_field_id(field_aliases: dict, field_name: str) -> str:
    assert field_name in field_aliases, f"field alias is not defined: {field_name}"
    return field_aliases[field_name]


def fill_case_detail_field_text(page: Page, field_aliases: dict, field_name: str, field_value: str):
    field_id = resolve_case_detail_field_id(field_aliases, field_name)
    locate = page.locator('.form-container').locator('tr').filter(has = page.locator(f'#{field_id}'), visible=True).get_by_role('textbox').first
    locate.scroll_into_view_if_needed()
    locate.fill(field_value)
    locate.blur()
    expect(locate).to_have_value(field_value)


def expect_case_detail_field_text(page: Page, field_aliases: dict, field_name: str, expected_value: str):
    field_id = resolve_case_detail_field_id(field_aliases, field_name)
    field = page.locator('.form-container').locator('tr').filter(
        has=page.locator(f'#{field_id}'),
        visible=True,
    ).get_by_role('textbox').first
    field.scroll_into_view_if_needed()
    expect(field).to_have_value(expected_value)


def get_handsontable_column_index(page: Page, header_text: str) -> int:
    header = page.locator("#myGrid .ht_clone_top th").filter(has_text=header_text).first
    expect(header).to_be_visible()
    return header.evaluate("th => Array.from(th.parentElement.children).indexOf(th)")


def edit_casesharing_table_cell(page: Page, header_text: str, row_index: int, value: str):
    # TODO: マジックナンバー。セルの番号がずれている。
    column_index = get_handsontable_column_index(page, header_text) - 1
    cell = page.locator("#myGrid .ht_master tbody tr").nth(row_index).locator("td").nth(column_index)
    expect(cell).to_be_visible()
    cell.click()
    page.keyboard.press("Enter")
    page.keyboard.press("Control+A")
    page.keyboard.type(value)
    page.keyboard.press("Enter")
    expect(page.locator("#myGrid .ht_master tbody tr").nth(row_index).locator("td").nth(column_index)).to_contain_text(value)


def open_casesharing_detail_modal(page: Page):
    page.locator(".list-icon.list-edit").filter(visible=True).first.click(force=True)
    expect(page.locator("#modal-karte .modal-close")).to_be_visible()


def select_casesharing_detail_tab(page: Page, tab_name: str):
    tab = page.locator("#tab-wrap .tab-btn").filter(has_text=tab_name, visible=True).first
    expect(tab).to_be_visible()
    tab.click()


def add_casesharing_phenotype(page: Page, placeholder: str, hpo_name: str, hpo_id: str):
    phenotype_count = page.locator("#phenotype_num")
    count_before_add = int(phenotype_count.inner_text().strip("()"))

    token_input_field = page.get_by_placeholder(placeholder)
    expect(token_input_field).to_be_editable()
    token_input_field.fill(hpo_name)
    page.get_by_role("listitem").filter(has_text=f"{hpo_id}").click()

    expect(page.get_by_text(hpo_id)).to_be_visible()
    page.locator("#phenotype_add").click()
    expect(phenotype_count).to_have_text(f"({count_before_add + 1})")

    expect(page.locator("#phenotype_list")).to_contain_text(hpo_id)
    expect(page.locator("#phenotype_list")).to_contain_text(hpo_name)


def get_tab_field(page: Page, tab_name: str, field_name: str):
    tab = page.locator(
        "#modal-karte .category-header.show .section-nav-button"
    ).filter(has_text=tab_name, visible=True).first
    expect(tab).to_be_visible()
    tab.click()

    tab_content = page.locator("#modal-karte #tab-wrap > .tab-contents.show")
    expect(tab_content).to_be_visible()
    header = tab_content.locator("th.input-header").filter(
        has_text=field_name,
    ).first
    expect(header).to_be_attached()
    return header.locator("xpath=following-sibling::td[1]")


def set_tab_and_edit(
    page: Page,
    tab_name: str,
    field_type: str,
    field_name: str,
    value: str,
) -> None:
    field = get_tab_field(page, tab_name, field_name)

    match field_type:
        case "list":
            control = field.locator("select")
            control.select_option(label=value)
            expect(control.locator("option:checked")).to_have_text(value)

        case "button":
            control = field.locator("label").filter(has_text=value).first
            control.click()
            expect(control.locator("input")).to_be_checked()

        case "text":
            control = field.get_by_role("textbox")
            control.fill(value)
            expect(control).to_have_value(value)

        case _:
            raise ValueError(f"未対応のfield_typeです: {field_type}")

    control.blur()


def expect_tab_field_value(
    page: Page,
    tab_name: str,
    field_type: str,
    field_name: str,
    value: str,
) -> None:
    field = get_tab_field(page, tab_name, field_name)

    match field_type:
        case "list":
            expect(field.locator("select option:checked")).to_have_text(value)
        case "button":
            expect(
                field.locator("label").filter(has_text=value).first.locator("input")
            ).to_be_checked()
        case "text":
            expect(field.get_by_role("textbox")).to_have_value(value)
        case _:
            raise ValueError(f"未対応のfield_typeです: {field_type}")


# サンプルデータ読込 #############################################################

def test_casesharing_file_upload(root_page, create_config):
    config = create_config

    for case in config.test_cases("casesharing_file_upload"):
        upload_path = Path(case["upload_file_path"]).resolve()
        assert upload_path.is_file(), f"upload file not found: {upload_path}"

        casesharing_upload_data(root_page, case['dialog_message'], case['upload_file_path'], str(case['case_count']))

        for expected_result in case['expected']:
            selected_row = root_page.locator("table tbody tr").filter(has_text=expected_result['case_id'])
            expect(selected_row).to_be_visible()
            expect(selected_row.locator("td").filter(has_text=expected_result['sex'])).to_be_visible()

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        print(f'{create_case_id(case)} PASS')


# 症例の追加 #############################################################

def test_casesharing_add_case(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_add_case')
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    row_count = int(root_page.locator("#row_count").inner_text())
    root_page.locator("#table_menu .list-icon.list-row").filter(visible=True).click()
    expect(root_page.locator("#row_count")).to_have_text(str(row_count + 1))

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 症例の削除 #############################################################

def test_casesharing_delete_case(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_delete_case')
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    row_count = int(root_page.locator("#row_count").inner_text())
    root_page.once('dialog', accept_delete_dialog)
    root_page.locator("#myGrid .list-delete").last.click()
    expect(root_page.locator("#row_count")).to_have_text(str(row_count - 1))

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 症例の複製 #############################################################

def test_casesharing_copy_case(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_copy_case')
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    original_count = int(root_page.locator("#row_count").inner_text())
    original_row = root_page.locator("#myGrid .ht_master tbody tr").first
    original_row_element = original_row.locator('.htMiddle').all_inner_texts()

    open_casesharing_detail_modal(root_page)
    root_page.locator("#modal-karte .modal-copy").click()

    expect(root_page.locator("#row_count")).to_have_text(str(original_count + 1))
    copied_row = root_page.locator("#myGrid .ht_master tbody tr").last
    copied_row_element = copied_row.locator('.htMiddle').all_inner_texts()

    assert original_row_element == copied_row_element

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 詳細情報編集 #############################################################

def test_casesharing_edit_detail_info(root_page, create_config):
    config = create_config
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    for case in config.test_cases('casesharing_edit_detail_info'):
        open_casesharing_detail_modal(root_page)

        for input_field in case["input_fields"]:
            select_casesharing_detail_tab(root_page, input_field["tab"])

            for field in input_field['fields']:
                if field['type'] == 'phenotype':
                    add_casesharing_phenotype(
                        root_page,
                        field['placeholder'],
                        field['input'],
                        field['hpo_id'],
                    )
                    continue

                set_tab_and_edit(
                    root_page,
                    field['field_tab'],
                    field['type'],
                    field['field_name'],
                    field['input'],
                )

        root_page.locator("#modal-karte .modal-close").click()
        expect(root_page.locator("#modal-karte .modal-close")).not_to_be_visible()

        open_casesharing_detail_modal(root_page)
        for input_field in case["input_fields"]:
            select_casesharing_detail_tab(root_page, input_field["tab"])

            for field in input_field['fields']:
                if field['type'] == 'phenotype':
                    phenotype_list = root_page.locator("#phenotype_list")
                    expect(phenotype_list).to_contain_text(field['hpo_id'])
                    expect(phenotype_list).to_contain_text(field['input'])
                    continue

                expect_tab_field_value(
                    root_page,
                    field['field_tab'],
                    field['type'],
                    field['field_name'],
                    field['input'],
                )

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        root_page.locator("#modal-karte .modal-close").click()
        print(f'{create_case_id(case)} PASS')


# 一覧画面での編集 #############################################################

def test_casesharing_edit_list(root_page, create_config):
    config = create_config
    for case in config.test_cases('casesharing_list_edit'):
        sample_data = config.test_case('casesharing_file_upload')
        casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

        edit_casesharing_table_cell(root_page, case["header"], 0, case["new_value"])

        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        print(f'{create_case_id(case)} PASS')


# 保存・再読込 #############################################################

def test_casesharing_save_and_reload(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_save_and_reload')
    field_aliases = get_case_detail_field_aliases(config)
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    original_count = int(root_page.locator("#row_count").inner_text())
    open_casesharing_detail_modal(root_page)
    for input_field in case['input_fields']:
        select_casesharing_detail_tab(root_page, input_field['tab'])
        for field_name, field_value in input_field['fields'].items():
            fill_case_detail_field_text(root_page, field_aliases, field_name, field_value)
    root_page.locator("#modal-karte .modal-close").click()

    root_page.locator("#menu-save").click()
    root_page.locator("#menu-save #dl-select").select_option("json")

    with root_page.expect_download() as download_info:
        root_page.locator("#dl_table_button").click()

    downloaded_file = download_info.value.path()
    assert downloaded_file, "downloaded file path is empty"

    casesharing_upload_data(root_page, sample_data['dialog_message'], downloaded_file, str(original_count))

    open_casesharing_detail_modal(root_page)
    for input_field in case['input_fields']:
        select_casesharing_detail_tab(root_page, input_field['tab'])
        for field_name, expected_value in input_field['fields'].items():
            expect_case_detail_field_text(root_page, field_aliases, field_name, expected_value)

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# ファイル結合 #############################################################

def test_casesharing_merge_file(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_merge_case')
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    original_count = int(root_page.locator("#row_count").inner_text())
    merge_path = Path(case["merge_file_path"]).resolve()
    casesharing_upload_data(
        root_page,
        case['dialog_message'],
        str(merge_path),
        case_count=str(original_count + int(case["merge_case_count"])),
        input_selector="#merge_btn",
    )

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 臨床症状登録 #############################################################

def test_casesharing_register_phenotype(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_phenotype')

    open_casesharing_detail_modal(root_page)
    select_casesharing_detail_tab(root_page, case['input_fields']['tab'])

    add_casesharing_phenotype(root_page, case['input_fields']['placeholder'], case['input_fields']["input"], case['input_fields']["hpo_id"])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')


# 家系図自動生成 #############################################################

def test_casesharing_pedigree_is_visible(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_pedigree_is_visible')
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    target_row = root_page.locator("#myGrid .ht_master tbody tr").filter(has_text=case['expected_id']).first
    expect(target_row).to_be_visible()
    target_row_index = target_row.evaluate(
        "row => Array.prototype.indexOf.call(row.parentElement.children, row)"
    )
    edit_button = root_page.locator(
        "#myGrid .ht_clone_left tbody tr, #myGrid .ht_clone_inline_start tbody tr"
    ).nth(target_row_index).locator(".list-icon.list-edit")
    expect(edit_button).to_be_visible()
    edit_button.click()

    pedigree_tab = root_page.locator("#tab-wrap .tab-btn").filter(
        has_text=case["tab"],
        visible=True,
    ).first
    expect(pedigree_tab).to_be_visible()
    pedigree_tab.click()

    pedigree_section = root_page.locator("#section_family_info_pedigree")
    pedigree_section.scroll_into_view_if_needed()
    expect(pedigree_section.get_by_text(case['expected_id']).first).to_be_visible()

    result_path = create_test_result_path(f'{create_case_id(case)}', config.test_result_path)
    take_screenshot(root_page, result_path)

    for dl_type in case['download_type']:
        with root_page.expect_download() as download_info:
            pedigree_section.locator('.btn.download-pedigree-btn').filter(has_text = dl_type).click()
        downloaded_file = download_info.value.path()
        assert downloaded_file, "downloaded file path is empty"

        print(f'{create_case_id(case)}_{dl_type} PASS')


# 統計情報チャート #############################################################

def expect_stats_count_card(page: Page, expected_card: dict):
    card = page.locator("#charts-patients .chart-count-contents").filter(
        has=page.get_by_text(expected_card["title"], exact=True)
    )
    expect(card).to_be_visible()
    expect(card.get_by_text(str(expected_card["value"]), exact=True)).to_be_visible()

    if "most_title" in expected_card:
        expect(card).to_contain_text(expected_card["most_title"])
        expect(card).to_contain_text(expected_card["most_value"])


def read_chart_values(page: Page, canvas_id: str):
    # canvasを返すまで待機する
    page.wait_for_function(
        expression="""canvasId => {
            const canvas = document.getElementById(canvasId);
            return canvas && window.Chart && Chart.getChart(canvas);
        }""",
        arg = canvas_id,
    )

    return page.evaluate(
        expression = """canvasId => {
            const chart = Chart.getChart(document.getElementById(canvasId));
            const title = chart.options?.plugins?.title?.text ?? null;
            const values = {};
            chart.data.labels.forEach((label, index) => {
                values[String(label)] = chart.data.datasets[0].data[index];
            });

            return {
                title: Array.isArray(title) ? title.join(" ") : title,
                values
            };
        }""",
        arg = canvas_id,
    )


def expect_stats_chart(page: Page, canvas_id: str, expected_chart: dict):
    chart = read_chart_values(page, canvas_id)

    if chart["title"] == '':
        expect(
            page.get_by_text(expected_chart["title"], exact=True).filter(visible=True)
        ).to_be_visible()
    else:
        assert chart["title"] == expected_chart["title"]

    assert chart["values"] == expected_chart["values"]

def test_casesharing_stats_charts_are_visible(root_page, create_config):
    config = create_config
    case = config.test_case('casesharing_stats_charts_are_visible')
    sample_data = config.test_case('casesharing_file_upload')
    casesharing_upload_data(root_page, sample_data['dialog_message'], sample_data['upload_file_path'], str(sample_data['case_count']))

    root_page.get_by_text('Stats', exact=True).click()
    expect(root_page.get_by_text('MY CHART').filter(visible=True)).to_be_visible()

    for expected_card in case["expected"]["count_cards"]:
        expect_stats_count_card(root_page, expected_card)

    expect_stats_chart(root_page, "pie-chart-sex", case["expected"]["charts"]["sex"])
    expect_stats_chart(root_page, "bar-chart-group", case["expected"]["charts"]["group"])

    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
    print(f'{create_case_id(case)} PASS')
