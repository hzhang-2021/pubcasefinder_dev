"""Browser tests for /panelsearch_nanbyo_panel_detail."""
import os
from uuid import uuid4

import pytest
from playwright.sync_api import expect
from psn_common import assert_page, assert_tabs, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_detail'
REVIEW_PUBLICATIONS = 'PMID: 18976909 DOI: 10.1016/j.nmd.2008.09.005'


def open_add_review(page):
    button = page.locator('.vgp-add-review-btn[data-gene_symbol="ACTA1"]').first
    expect(button).to_be_visible(timeout=60000)
    button.click()
    expect(page.locator('#panel_review_form')).to_be_visible()
    expect(page.locator('#panel_review_title_text')).to_contain_text('ADD REVIEW')
    expect(page.locator('#input_review_review_id')).to_have_value('')
    expect(page.locator('#input_review_gene_symbol')).to_have_value('58,ACTA1')
    expect(page.locator('#input_review_entity_type_id')).to_have_value('1')
    page.locator('#input_review_publications').fill(REVIEW_PUBLICATIONS)
    return page.locator('#input_review_panel_id').input_value()


def assert_review_publications(dialog):
    expect(dialog).to_contain_text('18976909')
    expect(dialog).to_contain_text('10.1016/j.nmd.2008.09.005')


def test_panel_detail_add_entity_hidden_for_anonymous(root_page, psn_config):
    expect(root_page.locator('#wrapper_panel_add_entity_btn')).to_have_count(0)
    take_screenshot(root_page, psn_config, 'add_entity_hidden_for_anonymous')


@pytest.mark.parametrize('root_page', ['reviewer'], indirect=True)
def test_panel_detail_add_entity_cancel(root_page, psn_config):
    button = root_page.locator('#wrapper_panel_add_entity_btn').get_by_text(
        'ADD ENTITY', exact=False)
    expect(button).to_be_visible(timeout=60000)
    button.click()

    form = root_page.locator('#panel_review_form')
    expect(form).to_be_visible(timeout=60000)
    expect(root_page.locator('#panel_review_title_text')).to_contain_text('ADD REVIEW')
    expect(root_page.locator('#input_review_review_id')).to_have_value('')
    expect(root_page.locator('#input_review_entity_type_id')).to_have_value('1')
    expect(root_page.locator('#input_review_gene_symbol')).to_have_value('')

    gene_input = root_page.locator('#tokenInput_gene_symbol input[type="text"]')
    gene_input.fill('A')
    suggestion = root_page.locator(
        '#tokenInput_gene_symbol .typeahead-dropdown .dropdown-item').first
    expect(suggestion).to_be_visible()
    gene_symbol = suggestion.inner_text()
    suggestion.click()
    expect(root_page.locator('#input_review_gene_symbol')).not_to_have_value('')
    assert root_page.locator('#input_review_gene_symbol').input_value().endswith(
        f',{gene_symbol}')

    marker = 'PSN E2E Add Entity キャンセル確認'
    root_page.locator('#input_review_comment').fill(marker)
    root_page.locator('#btn_vgp_review_submit').click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog).to_contain_text(gene_symbol)
    expect(dialog).to_contain_text(marker)
    take_screenshot(root_page, psn_config, 'add_entity_confirmation')

    dialog.get_by_role('button', name='Cancel', exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(root_page.locator('#input_review_comment')).to_have_value(marker)
    expect(root_page.locator('#input_review_gene_symbol')).not_to_have_value('')
    root_page.locator('#panel_review_div #closeBtn').click()
    expect(form).not_to_be_visible()
    take_screenshot(root_page, psn_config, 'add_entity_cancel')


@pytest.mark.skipif(
    os.getenv('PSN_ADD_ENTITY_MUTATION') != '1',
    reason='Add Entity の確定テストには PSN_ADD_ENTITY_MUTATION=1 が必要です',
)
@pytest.mark.parametrize('root_page', ['reviewer'], indirect=True)
def test_panel_detail_add_entity_submit(root_page, psn_config):
    button = root_page.locator('#wrapper_panel_add_entity_btn').get_by_text(
        'ADD ENTITY', exact=False)
    expect(button).to_be_visible(timeout=60000)
    button.click()
    expect(root_page.locator('#panel_review_form')).to_be_visible(timeout=60000)

    gene_input = root_page.locator('#tokenInput_gene_symbol input[type="text"]')
    gene_input.fill('A')
    suggestion = root_page.locator(
        '#tokenInput_gene_symbol .typeahead-dropdown .dropdown-item').first
    expect(suggestion).to_be_visible()
    gene_symbol = suggestion.inner_text()
    suggestion.click()
    gene_id, selected_symbol = root_page.locator(
        '#input_review_gene_symbol').input_value().split(',', 1)
    assert selected_symbol == gene_symbol

    panel_id = root_page.locator('#input_review_panel_id').input_value()
    marker = 'PSN-E2E-ADD-ENTITY-' + uuid4().hex
    root_page.locator('#input_review_comment').fill(marker)
    root_page.locator('#btn_vgp_review_submit').click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog).to_contain_text(gene_symbol)
    expect(dialog).to_contain_text(marker)
    take_screenshot(root_page, psn_config, 'add_entity_submit_confirmation')

    origin = psn_config.settings['origin'].rstrip('/')
    params = {'panel_id': panel_id, 'entity_type_id': '1', 'entity_name': gene_symbol}
    api = root_page.context.request
    reviews_path = '/panelsearch_nanbyo_get_panel_entity_review'
    comments_path = '/panelsearch_nanbyo_get_panel_entity_review_comment'

    def read_records(endpoint):
        response = api.get(origin + endpoint, params=params)
        assert response.ok, f'{endpoint}: HTTP {response.status}'
        records = response.json()
        assert isinstance(records, list), f'{endpoint}: expected a list'
        return records

    try:
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_regist_review')) as result:
                root_page.locator('#btnConfirmAction').click()
            assert result.value.ok, f'Add Entity submission: HTTP {result.value.status}'
        matches = [row for row in read_records(comments_path)
                   if row.get('comment') == marker]
        assert len(matches) == 1, 'Expected exactly one saved Add Entity comment'
        saved_reviews = [row for row in read_records(reviews_path)
                         if row['review_id'] == matches[0]['review_id']]
        assert len(saved_reviews) == 1
        expect(root_page.locator('.vgp-panel-gene-name').filter(
            has_text=gene_symbol).first).to_be_visible(timeout=60000)
        take_screenshot(root_page, psn_config, 'add_entity_saved')
    finally:
        comments = [row for row in read_records(comments_path)
                    if row.get('comment') == marker]
        reviews = read_records(reviews_path)
        for comment in comments:
            matches = [row for row in reviews
                       if row['review_id'] == comment['review_id']
                       and row['user_id'] == comment['user_id']]
            assert len(matches) == 1, f'Cannot identify Add Entity test data: {marker}'
            review = matches[0]
            response = api.post(
                origin + '/panelsearch_nanbyo_delete_panel_entity_review', data=review)
            assert response.ok, f'Add Entity test cleanup failed: {marker}'
            body = response.json()
            assert not body.get('error') and body.get('suceed') == 'done', (
                f'Add Entity test cleanup failed: {marker}')
            assert all(row['review_id'] != review['review_id']
                       for row in read_records(reviews_path))


@pytest.mark.parametrize('root_page', ['reviewer'], indirect=True)
def test_panel_detail_add_review_cancel(root_page, psn_config):
    open_add_review(root_page)
    root_page.locator('#input_review_comment').fill('E2E キャンセル確認')
    root_page.locator('#btn_vgp_review_submit').click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog).to_contain_text('ACTA1')
    expect(dialog).to_contain_text('E2E キャンセル確認')
    assert_review_publications(dialog)
    take_screenshot(root_page, psn_config, 'add_review_confirmation')
    dialog.get_by_role('button', name='Cancel', exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(root_page.locator('#input_review_comment')).to_have_value('E2E キャンセル確認')
    expect(root_page.locator('#input_review_publications')).to_have_value(REVIEW_PUBLICATIONS)
    root_page.locator('#panel_review_div #closeBtn').click()
    expect(root_page.locator('#panel_review_form')).not_to_be_visible()
    take_screenshot(root_page, psn_config, 'add_review_cancel')


@pytest.mark.parametrize('root_page', ['reviewer'], indirect=True)
def test_panel_detail_add_review_submit(root_page, psn_config):
    panel_id = open_add_review(root_page)
    panel_name = root_page.locator('#input_review_panel_name').input_value()
    marker = 'PSN-E2E-' + uuid4().hex
    root_page.locator('#input_review_comment').fill(marker)
    root_page.locator('#btn_vgp_review_submit').click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog).to_contain_text(marker)
    assert_review_publications(dialog)
    take_screenshot(root_page, psn_config, 'add_review_submit_confirmation')
    origin = psn_config.settings['origin'].rstrip('/')
    params = {'panel_id': panel_id, 'entity_type_id': '1', 'entity_name': 'ACTA1'}
    api = root_page.context.request

    def read_records(endpoint):
        response = api.get(origin + endpoint, params=params)
        assert response.ok, f'{endpoint}: HTTP {response.status}'
        records = response.json()
        assert isinstance(records, list), f'{endpoint}: expected a list'
        return records

    reviews_path = '/panelsearch_nanbyo_get_panel_entity_review'
    comments_path = '/panelsearch_nanbyo_get_panel_entity_review_comment'
    # この実行で作成したコメントの識別子だけを使って後処理する。
    try:
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_regist_review')) as result:
                root_page.locator('#btnConfirmAction').click()
            # 保存直後の再読み込みで応答本文が破棄されるため、保存結果は画面と読み取り API で検証する。
            assert result.value.ok, f'Review submission: HTTP {result.value.status}'
        matches = [row for row in read_records(comments_path) if row.get('comment') == marker]
        assert len(matches) == 1, 'Expected exactly one saved test comment'
        saved_reviews = [row for row in read_records(reviews_path)
                         if row['review_id'] == matches[0]['review_id']]
        assert len(saved_reviews) == 1
        assert saved_reviews[0]['publications'] == REVIEW_PUBLICATIONS
        query = {**params, 'panel_name': panel_name, 'nando_id': panel_id,
                 'gene_id': '58', 'gene_symbol': 'ACTA1'}
        response = root_page.goto(psn_config.page_url('panel_entity_detail', query))
        assert response and response.ok
        expect(root_page.locator('#vgp-panel-gene-review-panel').get_by_text(marker, exact=True).first).to_be_visible(timeout=60000)
        take_screenshot(root_page, psn_config, 'add_review_saved', page_name=PAGE)
    finally:
        comments = [row for row in read_records(comments_path) if row.get('comment') == marker]
        reviews = read_records(reviews_path)
        for comment in comments:
            matches = [row for row in reviews
                       if row['review_id'] == comment['review_id']
                       and row['user_id'] == comment['user_id']]
            assert len(matches) == 1, f'Cannot identify test Review for cleanup: {marker}'
            review = matches[0]
            response = api.post(origin + '/panelsearch_nanbyo_delete_panel_entity_review', data=review)
            assert response.ok, f'Test Review cleanup failed: {marker}'
            body = response.json()
            assert not body.get('error') and body.get('suceed') == 'done', f'Test Review cleanup failed: {marker}'
            assert all(row['review_id'] != review['review_id'] for row in read_records(reviews_path))


def test_panel_detail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_detail_tabs(root_page, psn_config):
    assert_tabs(root_page, psn_config, PAGE)


def test_panel_detail_version_comments(root_page, psn_config):
    version_info = root_page.evaluate('() => window.panel_version_info')
    assert isinstance(version_info, list)
    assert version_info, 'Version comments の検証に必要な履歴がありません'

    tab = root_page.locator('#nav-vgp-version-comments-panel')
    tab.click()
    expect(tab).to_have_attribute('aria-selected', 'true')
    panel = root_page.locator('#vgp-version-comments-panel')
    expect(panel).to_be_visible()
    rows = panel.locator('#ul-version-comments > li')
    expect(rows).to_have_count(len(version_info))

    for index, change in enumerate(version_info):
        row = rows.nth(index)
        expect(row.locator('.time')).not_to_have_text('')
        expect(row.locator('p')).to_have_text(str(change.get('comment') or ''))
        labels = row.locator('label')
        if labels.count():
            expected_versions = [f'Ver {version}'
                                 for version in change.get('panel_versions', [])]
            assert labels.all_inner_texts() == expected_versions

    take_screenshot(root_page, psn_config, 'panel_detail_version_comments')


def test_panel_detail_reviewers(root_page, psn_config):
    panel_id = psn_config.pages[PAGE]['query']['panel_id']
    response = root_page.context.request.get(
        psn_config.settings['origin'].rstrip('/') +
        '/panelsearch_nanbyo_get_panel_review',
        params={'panel_id': panel_id},
    )
    reviews = assert_json_response(response)
    assert isinstance(reviews, list)

    reviews_by_user = {}
    for review in reviews:
        reviews_by_user.setdefault(str(review['user_id']), []).append(review)
    reviewers = sorted(
        reviews_by_user.items(),
        key=lambda item: (
            f"{item[1][0]['first_name_en']} {item[1][0]['last_name_en']}"),
    )

    tab = root_page.locator('#nav-vgp-reviewers-panel')
    tab.click()
    expect(tab).to_have_attribute('aria-selected', 'true')
    panel = root_page.locator('#vgp-reviewers-panel')
    expect(panel).to_be_visible()
    expect(tab).to_have_text(f'Reviewers({len(reviewers)})')
    expect(panel.locator('#reviewer_num')).to_have_text(str(len(reviewers)))

    rows = panel.locator('#vgp-reviewer-table-tbody > tr.vgp-table-datarow')
    expect(rows).to_have_count(len(reviewers))
    for index, (user_id, user_reviews) in enumerate(reviewers):
        reviewer = user_reviews[0]
        name = f"{reviewer['first_name_en']} {reviewer['last_name_en']}"
        cells = rows.nth(index).locator('td')
        expect(cells.nth(0)).to_have_text(name)
        expect(cells.nth(1)).to_have_text(str(reviewer.get('affiliation') or ''))
        expect(cells.nth(2).locator(f'#btn-reviewer-reviews-{user_id}')).to_have_text(
            f'{len(user_reviews)} reviews')

    if reviewers:
        user_id, user_reviews = reviewers[0]
        button = panel.locator(f'#btn-reviewer-reviews-{user_id}')
        button.click()
        popup = root_page.locator(f'#popup-reviewer-reviews-{user_id}')
        expect(popup).to_be_visible()
        expect(popup).to_contain_text(f'Total {len(user_reviews)}')
        for heading in ('Gene', 'Rating', 'Disease', 'Mode of inheritance',
                        'Review date', 'view review'):
            expect(popup.locator('thead')).to_contain_text(heading)
        detail_rows = popup.locator('#reviewer-reviews-table-tbody > tr')
        expect(detail_rows).to_have_count(min(5, len(user_reviews)))
        expected_genes = sorted(
            str(review.get('gene_symbol') or '') for review in user_reviews)[:5]
        assert detail_rows.locator('td:first-child').all_inner_texts() == expected_genes
        href = detail_rows.first.locator(
            'a', has_text='View review').get_attribute('href')
        assert href and 'panelsearch_nanbyo_panel_entity_detail?' in href

    take_screenshot(root_page, psn_config, 'panel_detail_reviewers')


def test_panel_detail_version_comparison(root_page, psn_config):
    version_info = root_page.evaluate('() => window.panel_version_info')
    assert isinstance(version_info, list)
    assert version_info, 'Version comparison の検証に必要な履歴がありません'

    tab = root_page.locator('#nav-vgp-compare-panel')
    with root_page.expect_response(lambda r: response_matches(
            r, '/panelsearch_nanbyo_get_panel_all_change_history')) as result:
        tab.click()
    assert_json_response(result.value)
    expect(tab).to_have_attribute('aria-selected', 'true')

    panel = root_page.locator('#vgp-compare-panel')
    wrapper = panel.locator('#compare-wrapper')
    expect(panel).to_be_visible()
    expect(panel.locator('#compare-loader')).not_to_be_visible()
    expect(panel.locator('#compare-content')).to_be_visible()
    assert 'loaded' in (wrapper.get_attribute('class') or '').split()

    expected_previous = version_info[1] if len(version_info) > 1 else version_info[0]
    expected_latest = version_info[0]
    selected_previous = panel.locator('#btn-version-selector-1').evaluate(
        'element => window.jQuery(element).data("selected_panel_change_id")')
    selected_latest = panel.locator('#btn-version-selector-2').evaluate(
        'element => window.jQuery(element).data("selected_panel_change_id")')
    assert selected_previous == expected_previous['panel_change_id']
    assert selected_latest == expected_latest['panel_change_id']
    expect(panel.locator('#dropdown-menu-version-selector-1 .dropdown-item')).to_have_count(
        len(version_info))
    expect(panel.locator('#dropdown-menu-version-selector-2 .dropdown-item')).to_have_count(
        len(version_info))

    rows = panel.locator('#compare-table-tbody > tr')
    entity_count = int(panel.locator('.vgp-panel-genes-num-compare').inner_text())
    expect(rows).to_have_count(entity_count)
    expect(panel.locator('#vgp-panel-genes-filter-compare')).to_have_attribute(
        'placeholder', f'Filter {entity_count} Entities')

    statuses = rows.locator('td:last-child').all_inner_texts()
    added = statuses.count('Added')
    removed = statuses.count('Removed')
    changed = statuses.count('Changed')
    summary = panel.locator('#compare-summary')
    expect(summary.locator('.rating-change-added')).to_have_text(f'Added({added})')
    expect(summary.locator('.rating-change-removed')).to_have_text(f'Removed({removed})')
    expect(summary.locator('.rating-change-changed')).to_have_text(
        f'Rating changed({changed})')

    if entity_count:
        entity_name = rows.first.locator('.vgp-panel-gene-name').inner_text().strip()
        entity_filter = panel.locator('#vgp-panel-genes-filter-compare')
        entity_filter.fill(entity_name)
        visible_rows = panel.locator('#compare-table-tbody > tr:not(.hidden)')
        expect(visible_rows).to_have_count(1)
        expect(visible_rows.first.locator('.vgp-panel-gene-name')).to_contain_text(
            entity_name)
        entity_filter.fill('')
        expect(visible_rows).to_have_count(entity_count)

    take_screenshot(root_page, psn_config, 'panel_detail_version_comparison')


def panel_entity_filter_elements(page):
    panel = page.locator('#vgp-panel-genes-panel')
    expect(panel).to_be_visible()
    rows = panel.locator('#vgp-panel-gene-table-tbody tr.vgp-table-datarow')
    expect(rows.first).to_be_visible(timeout=60000)
    entity_filter = panel.locator('#vgp-panel-genes-filter')
    total = int(panel.locator('.vgp-panel-genes-num').inner_text())
    assert total > 0
    expect(entity_filter).to_have_attribute('placeholder', f'Filter {total} Entities')
    return panel, rows, entity_filter, total


def test_panel_detail_filter_entities_existing(root_page, psn_config):
    panel, rows, entity_filter, total = panel_entity_filter_elements(root_page)
    entity_filter.fill('ACTA1')
    expect(panel.locator('.vgp-panel-genes-num')).to_have_text('1')
    visible_rows = panel.locator(
        '#vgp-panel-gene-table-tbody tr.vgp-table-datarow:not(.hidden)')
    expect(visible_rows).to_have_count(1)
    expect(visible_rows.locator('.vgp-panel-gene-name').first).to_have_text('ACTA1')
    assert rows.count() == total
    take_screenshot(root_page, psn_config, 'panel_detail_filter_entities_existing')


def test_panel_detail_filter_entities_no_match_and_clear(root_page, psn_config):
    panel, rows, entity_filter, total = panel_entity_filter_elements(root_page)
    entity_filter.fill('__PSN_E2E_NO_ENTITY_MATCH__')
    expect(panel.locator('.vgp-panel-genes-num')).to_have_text('0')
    visible_rows = panel.locator(
        '#vgp-panel-gene-table-tbody tr.vgp-table-datarow:not(.hidden)')
    hidden_rows = panel.locator(
        '#vgp-panel-gene-table-tbody tr.vgp-table-datarow.hidden')
    expect(visible_rows).to_have_count(0)
    expect(hidden_rows).to_have_count(rows.count())

    entity_filter.fill('')
    expect(panel.locator('.vgp-panel-genes-num')).to_have_text(str(total))
    expect(visible_rows).to_have_count(total)
    expect(hidden_rows).to_have_count(0)
    take_screenshot(root_page, psn_config, 'panel_detail_filter_entities_clear')


def _panel_gene_with_content(page, controller_selector):
    panel = page.locator('#vgp-panel-genes-panel')
    expect(panel).to_be_visible()
    rows = panel.locator('#vgp-panel-gene-table-tbody tr.vgp-table-datarow')
    expect(rows.first).to_be_visible(timeout=60000)
    gene_row = rows.filter(has=page.locator(controller_selector)).first
    expect(gene_row).to_be_visible(timeout=60000)
    expect(gene_row.locator('.vgp-panel-gene-name')).to_be_visible()
    source_row = gene_row.locator('.row-wrapper').filter(has=page.locator(controller_selector)).first
    expect(source_row).to_be_visible()
    return source_row


def test_panel_detail_panel_genes_papers(root_page, psn_config):
    row = _panel_gene_with_content(root_page, '.vgp-summary-controll.paper')
    controller = row.locator('.vgp-summary-controll.paper').first
    count = controller.evaluate('element => Number(window.jQuery(element).data("cnt"))')
    assert count > 0
    wrapper_id = controller.evaluate('element => window.jQuery(element).data("table-id")')
    wrapper = row.locator('#' + wrapper_id)
    controller.click()
    expect(wrapper).to_be_visible()
    expect(wrapper.locator('thead')).to_contain_text('Title')
    expect(wrapper.locator('thead')).to_contain_text('Journal')
    expect(wrapper.locator('thead')).to_contain_text('Date')
    expect(wrapper.locator('thead')).to_contain_text('Source')
    expect(wrapper.locator('tbody tr').first).to_be_visible(timeout=60000)
    take_screenshot(root_page, psn_config, 'panel_genes_papers')
    controller.click()
    expect(wrapper).not_to_be_visible()


def test_panel_detail_panel_genes_papers_zero(root_page, psn_config):
    row = _panel_gene_with_content(root_page, '.width-paper .related-paper-num.empty')
    count = row.locator('.width-paper .related-paper-num.empty').first
    expect(count).to_contain_text('0')
    expect(row.locator('.width-paper .vgp-summary-controll.paper')).to_have_count(0)
    wrapper = row.locator('.vgp-paper-table-wrapper').first
    expect(wrapper).not_to_be_visible()
    count.click()
    expect(wrapper).not_to_be_visible()
    take_screenshot(root_page, psn_config, 'panel_genes_papers_zero')


@pytest.mark.parametrize('kind,title,last_column', [
    ('reviewer', 'Reviewer ratings', 'Reviewer'),
    ('reference', 'Reference ratings', 'Reference'),
])
def test_panel_detail_panel_genes_ratings(root_page, psn_config, kind, title, last_column):
    row = _panel_gene_with_content(root_page, f'.vgp-summary-controll[id$="-{kind}"][data-cnt]:not([data-cnt="0"])')
    controller = row.locator(f'.vgp-summary-controll[id$="-{kind}"]').first
    count = int(controller.get_attribute('data-cnt'))
    assert count > 0
    wrapper = row.locator('#' + controller.get_attribute('data-table-id'))
    controller.click()
    expect(wrapper).to_be_visible()
    expect(wrapper.locator('.title')).to_have_text(title)
    for heading in ('Rating', 'Disease', 'Mode of inheritance', last_column):
        expect(wrapper.locator('thead')).to_contain_text(heading)
    expect(wrapper.locator('tbody tr').first).to_be_visible()
    assert wrapper.locator('tbody tr').count() == count
    take_screenshot(root_page, psn_config, f'panel_genes_{kind}_ratings')
    controller.click()
    expect(wrapper).not_to_be_visible()


@pytest.mark.parametrize('kind', ['reviewer', 'reference'])
def test_panel_detail_panel_genes_ratings_zero(root_page, psn_config, kind):
    selector = f'.vgp-summary-controll[id$="-{kind}"][data-cnt="0"]'
    row = _panel_gene_with_content(root_page, selector)
    controller = row.locator(selector).first
    expect(controller).to_contain_text('Show(0)')
    wrapper = row.locator('#' + controller.get_attribute('data-table-id'))
    expect(wrapper).to_have_count(0)
    controller.click()
    expect(controller).to_contain_text('Show(0)')
    assert 'vgp-active' not in (controller.get_attribute('class') or '').split()
    expect(wrapper).to_have_count(0)
    take_screenshot(root_page, psn_config, f'panel_genes_{kind}_ratings_zero')


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
