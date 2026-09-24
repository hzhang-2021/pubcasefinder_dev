import pytest
from playwright.sync_api import expect

from test_common import Config, load_config, create_case_id, create_test_result_path, take_screenshot

@pytest.fixture(scope='module')
def create_config(get_config_path_by_lang):
    config_path = get_config_path_by_lang
    raw_config = load_config(config_path)
    return Config(
        raw_config['cases']['disease_search']['top_page']['base_url'],
        raw_config['test_result_path'],
        raw_config['cases']['disease_search']['top_page'],
        None
    )

@pytest.fixture()
def root_page(page, create_config):
    config = create_config
    page.goto(config.base_url)
    return page

# 症状入力・候補選択 #############################################################

def test_disease_search_candidate_symptoms(root_page, create_config):
    config = create_config
    for case in config.test_cases('disease_search_candidate_symptoms'):
        symptom = case['symptom']
        synonym = case['synonym']
        expected = case['expected']
        symptom_text = ' '.join([symptom['id'], symptom['name']])
        synonym_text = ' '.join([synonym['id'], synonym['name']])

        root_page.locator("#token-input-tokeninput_hpo").fill(symptom['name'])

        expect(root_page.get_by_role("listitem").filter(has_text=symptom_text)).to_be_visible()
        expect(root_page.get_by_role("listitem").filter(has_text=synonym_text)).to_be_visible()

        root_page.get_by_role("listitem").filter(has_text=symptom_text).click()
        root_page.locator('li').filter(
            has=root_page.get_by_text(symptom['name'], exact=True)
        ).click()
        expect(root_page.get_by_text(symptom['id'])).to_be_visible()
        expect(root_page.get_by_text(expected['definition'])).to_be_visible()
        expect(root_page.get_by_text(expected['comment'])).to_be_visible()
        expect(root_page.get_by_text(expected['superclass'])).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)

# 文章から症状自動抽出(日本語) #############################################################

def test_disease_search_candidate_symptoms_from_text(root_page, create_config):
    config = create_config
    for case in config.test_cases('disease_search_candidate_symptoms_from_text'):
        input_text = case['input']
        expected = case['expected']

        root_page.locator("#btn_text_input_trigger").click()
        expect(root_page.get_by_text('Automatically extract signs and symptoms from free-text.')).to_be_visible()

        root_page.locator("#text-input-area").fill(input_text)
        root_page.get_by_role("button", name="chevron_right").click()
        for expected_case in expected:
            expect(root_page.get_by_role("cell", name=expected_case)).to_be_visible()
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)
        root_page.get_by_role("button", name="ADD").click()
        for expected_case in expected:
            expect(
                root_page.locator("#UL-HPO-TOKEN-INPUT-LIST-tokeninput_hpo").get_by_text(
                    expected_case
                )
            ).to_be_visible()


# 検索実行・結果表示 #############################################################

def test_disease_search_results_are_visible(root_page, create_config):
    config = create_config
    for case in config.test_cases('disease_search_results_are_visible'):

        for input_case in case['input']:
            root_page.locator("#token-input-tokeninput_hpo").fill(input_case['name'])
            root_page.get_by_role("listitem").filter(has_text = input_case['id']).click()


        root_page.get_by_role("button", name="search").click()
        expect(root_page.get_by_role("button", name="Advanced Filter")).to_be_visible()

        for expected_case in case['expected'].values():
            expect(
                root_page.get_by_text(expected_case).first
            ).to_be_visible(timeout=10000)
        result_path = create_test_result_path(create_case_id(case), config.test_result_path)
        take_screenshot(root_page, result_path)


# test_case.tsv定義外 #############################################################

def test_top_page_is_visible(root_page, create_config):
    config = create_config
    case = config.test_case('top_page_is_visible')

    expect(root_page.get_by_role("textbox", name=case['expected'])).to_be_visible()
    expect(root_page.locator("#nav-login").get_by_text("Log in")).to_be_visible()
    result_path = create_test_result_path(create_case_id(case), config.test_result_path)
    take_screenshot(root_page, result_path)
