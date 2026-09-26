"""Browser tests for /panelsearch_nanbyo_panel_entity_detail."""
from contextlib import contextmanager
import os
from urllib.parse import parse_qs, urlparse
from uuid import uuid4

import pytest

from playwright.sync_api import Error as PlaywrightError, expect
from psn_common import assert_page, assert_json_response, response_matches, take_screenshot

PAGE = 'panel_entity_detail'
DEFINITION_API = '/panelsearch_nanbyo_get_panel_entity_definition'
COMMENT_API = '/panelsearch_nanbyo_get_panel_entity_review_comment'


def assert_reload_response(response):
    try:
        return assert_json_response(response)
    except PlaywrightError as exc:
        # 成功直後の location.reload() により、旧ページの response body が
        # Chromium から破棄される場合がある。エラー応答では reload されない。
        assert 'No resource with given identifier found' in str(exc)
        assert response.ok, (
            f'{response.request.method} {response.url}: HTTP {response.status}')
        return None


def current_definitions(page, config):
    query = parse_qs(urlparse(page.url).query)
    response = page.context.request.get(
        config.settings['origin'].rstrip('/') + DEFINITION_API,
        params={key: query[key][0] for key in ('panel_id', 'entity_type_id', 'entity_name')})
    definitions = assert_json_response(response)
    assert isinstance(definitions, list)
    return [row for row in definitions
            if row['is_latest'] == 'YES' and row.get('is_deleted') != 'YES']


def current_review_comments(page, config):
    query = parse_qs(urlparse(page.url).query)
    response = page.context.request.get(
        config.settings['origin'].rstrip('/') + COMMENT_API,
        params={key: query[key][0]
                for key in ('panel_id', 'entity_type_id', 'entity_name')})
    comments = assert_json_response(response)
    assert isinstance(comments, list)
    return comments


@contextmanager
def definitionless_entity(page, config):
    """Use the configured entity, or create and clean up a temporary one."""
    if not current_definitions(page, config):
        yield page
        return
    if os.getenv('PSN_ADD_ENTITY_MUTATION') != '1':
        pytest.skip(
            'This entity already has a current definition; use '
            '--psn-enable-mutations to create a temporary Entity'
        )

    original_query = parse_qs(urlparse(page.url).query)
    panel_id = original_query['panel_id'][0]
    nando_id = original_query.get('nando_id', [panel_id])[0]
    origin = config.settings['origin'].rstrip('/')
    marker = 'PSN-E2E-DEFINITION-CANCEL-ENTITY-' + uuid4().hex
    params = None

    page.goto(config.page_url('panel_detail', {'panel_id': panel_id}),
              wait_until='domcontentloaded')
    button = page.locator('#wrapper_panel_add_entity_btn').get_by_text(
        'ADD ENTITY', exact=False)
    expect(button).to_be_visible(timeout=60000)
    button.click()
    expect(page.locator('#panel_review_form')).to_be_visible(timeout=60000)

    gene_input = page.locator('#tokenInput_gene_symbol input[type="text"]')
    gene_input.fill('A')
    suggestion = page.locator(
        '#tokenInput_gene_symbol .typeahead-dropdown .dropdown-item').first
    expect(suggestion).to_be_visible(timeout=60000)
    suggestion.click()
    gene_id, gene_symbol = page.locator(
        '#input_review_gene_symbol').input_value().split(',', 1)
    params = {'panel_id': panel_id, 'entity_type_id': '1',
              'entity_name': gene_symbol}
    page.locator('#input_review_comment').fill(marker)
    page.locator('#btn_vgp_review_submit').click()
    dialog = page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog).to_contain_text(gene_symbol)
    expect(dialog).to_contain_text(marker)

    def read_records(endpoint):
        response = page.context.request.get(origin + endpoint, params=params)
        records = assert_json_response(response)
        assert isinstance(records, list), f'{endpoint}: expected a list'
        return records

    try:
        with page.expect_navigation(wait_until='domcontentloaded'):
            with page.expect_response(lambda response: response_matches(
                    response, '/panelsearch_nanbyo_regist_review')) as result:
                dialog.locator('#btnConfirmAction').click()
            assert result.value.ok, (
                f'Temporary Entity submission: HTTP {result.value.status}')

        comments = [row for row in read_records(
            '/panelsearch_nanbyo_get_panel_entity_review_comment')
            if row.get('comment') == marker]
        assert len(comments) == 1, 'Expected one temporary Entity comment'
        reviews = [row for row in read_records(
            '/panelsearch_nanbyo_get_panel_entity_review')
            if row['review_id'] == comments[0]['review_id']]
        assert len(reviews) == 1, 'Expected one temporary Entity review'

        page.goto(config.page_url('panel_entity_detail', {
            'panel_id': panel_id,
            'nando_id': nando_id,
            'entity_type_id': '1',
            'entity_name': gene_symbol,
            'gene_id': gene_id,
            'gene_symbol': gene_symbol,
        }), wait_until='domcontentloaded')
        expect(page.locator('#btn-definition-edit')).to_be_visible(timeout=60000)
        assert not current_definitions(page, config), (
            'The temporary Entity unexpectedly has a current Definition')
        yield page
    finally:
        if params is not None:
            comments = [row for row in read_records(
                '/panelsearch_nanbyo_get_panel_entity_review_comment')
                if row.get('comment') == marker]
            reviews = read_records('/panelsearch_nanbyo_get_panel_entity_review')
            for comment in comments:
                matches = [row for row in reviews
                           if row['review_id'] == comment['review_id']
                           and row['user_id'] == comment['user_id']]
                assert len(matches) == 1, (
                    f'Cannot identify temporary Entity for cleanup: {marker}')
                response = page.context.request.post(
                    origin + '/panelsearch_nanbyo_delete_panel_entity_review',
                    data=matches[0])
                body = assert_json_response(response)
                assert body.get('suceed') == 'done', (
                    f'Temporary Entity cleanup failed: {marker}')
                assert all(row['review_id'] != matches[0]['review_id']
                           for row in read_records(
                               '/panelsearch_nanbyo_get_panel_entity_review'))


def test_panel_entity_detail_is_visible(root_page, psn_config):
    assert_page(root_page, psn_config, PAGE)


def test_panel_entity_detail_tabs(root_page, psn_config):
    for tab, panel in psn_config.pages[PAGE]['tabs']:
        root_page.locator(tab).click()
        expect(root_page.locator(tab)).to_have_attribute('aria-selected', 'true')
        # 履歴が空の場合、タブが有効でも領域の高さが 0 になる。
        expect(root_page.locator(panel + '.active.show')).to_have_count(1)
        take_screenshot(root_page, psn_config, PAGE + '_' + tab.lstrip('#'))


@pytest.mark.parametrize('root_page', ['reviewer'], indirect=True)
def test_panel_entity_review_permissions_for_reviewer(root_page, psn_config):
    current_user_id = str(root_page.evaluate('() => _get_current_user_id()'))
    reviews = root_page.locator(
        '#vgp-panel-gene-review-panel .vgp-panel-entity-review-list-wrapper'
        '[data-review_id]')
    expect(reviews.first).to_be_visible(timeout=60000)
    assert reviews.count() > 0

    review_selector = (
        '#vgp-panel-gene-review-panel .vgp-panel-entity-review-list-wrapper')
    own_reviews = root_page.locator(
        f'{review_selector}[data-review_id][data-user_id="{current_user_id}"]')
    other_reviews = root_page.locator(
        f'{review_selector}[data-review_id][data-user_id]'
        f':not([data-user_id="{current_user_id}"])')
    if own_reviews.count() == 0 or other_reviews.count() == 0:
        pytest.skip('本人と他人の Review が両方必要です')

    for review in own_reviews.all():
        expect(review.locator(
            '.vgp-review-control-subwrapper .vgp-review-control')).to_have_count(2)
    for review in other_reviews.all():
        expect(review.locator('.vgp-review-control-subwrapper')).to_have_count(0)
    expect(reviews.locator('.add-review-comment-panel')).to_have_count(reviews.count())

    comments = current_review_comments(root_page, psn_config)
    checked_own = False
    checked_other = False
    for row in comments:
        text = str(row.get('comment') or '')
        if not text:
            continue
        matches = root_page.locator('.vgp-review-comment-text-content', has_text=text)
        if matches.count() != 1:
            continue
        container = matches.first.locator('xpath=ancestor::div[contains(@class, "vgp-review-comment-container")]')
        controls = container.locator('.vgp-review-comment-control-btn-panel > span')
        if str(row.get('comment_user_id')) == current_user_id:
            expect(controls).to_have_count(2)
            checked_own = True
        else:
            expect(controls).to_have_count(0)
            checked_other = True
    if not checked_own or not checked_other:
        pytest.skip('本人と他人の Comment が両方必要です')
    take_screenshot(root_page, psn_config, 'review_permissions_reviewer')


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_review_permissions_for_manager(root_page, psn_config):
    reviews = root_page.locator(
        '#vgp-panel-gene-review-panel .vgp-panel-entity-review-list-wrapper'
        '[data-review_id]')
    expect(reviews.first).to_be_visible(timeout=60000)
    assert reviews.count() > 0
    for review in reviews.all():
        expect(review.locator(
            '.vgp-review-control-subwrapper .vgp-review-control')).to_have_count(2)
        expect(review.locator('.add-review-comment-panel')).to_have_count(1)

    comments = root_page.locator('.vgp-review-comment-container')
    if comments.count() == 0:
        pytest.skip('Comment の管理権限確認に必要な既存 Comment がありません')
    for comment in comments.all():
        expect(comment.locator(
            '.vgp-review-comment-control-btn-panel > span')).to_have_count(2)
    take_screenshot(root_page, psn_config, 'review_permissions_manager')


@pytest.mark.skipif(
    os.getenv('PSN_REVIEW_COMMENT_MUTATION') != '1',
    reason='Review Comment の更新テストには PSN_REVIEW_COMMENT_MUTATION=1 が必要です',
)
@pytest.mark.parametrize('root_page', ['admin'], indirect=True)
def test_panel_entity_review_comment_add_modify_delete(root_page, psn_config, activity_check=None):
    review = root_page.locator(
        '#vgp-panel-gene-review-panel .vgp-panel-entity-review-list-wrapper'
        '[data-review_id][data-original_review_id]').first
    expect(review).to_be_visible(timeout=60000)
    original_review_id = review.get_attribute('data-original_review_id')
    assert review.get_attribute('data-review_id') and original_review_id

    marker = 'PSN-E2E-COMMENT-' + uuid4().hex
    modified_marker = marker + '-MODIFIED'
    origin = psn_config.settings['origin'].rstrip('/')

    def matching_comments(text):
        return [row for row in current_review_comments(root_page, psn_config)
                if row.get('comment') == text
                and str(row.get('original_review_id')) == original_review_id]

    try:
        add_panel = review.locator('.add-review-comment-panel')
        expect(add_panel.locator('.title')).to_contain_text('Add Comment')
        add_panel.locator('.title').click()
        assert 'onEdit' in (add_panel.get_attribute('class') or '').split()
        add_panel.locator('textarea').fill(marker)
        root_page.once('dialog', lambda dialog: dialog.accept())
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_add_panel_entity_review_comment')) as result:
                add_panel.locator('button.comment').click()
            assert result.value.ok, f'Add Review Comment: HTTP {result.value.status}'

        added = matching_comments(marker)
        assert len(added) == 1, 'Expected exactly one added Review Comment'
        comment = root_page.locator('.vgp-review-comment-container').filter(
            has_text=marker).first
        expect(comment.locator('.vgp-review-comment-text-content')).to_have_text(marker)
        take_screenshot(root_page, psn_config, 'review_comment_added')
        if activity_check:
            query = parse_qs(urlparse(root_page.url).query)
            activity_check('review_comment', 'add', marker,
                           {key: query[key][0] for key in ('panel_id', 'entity_name')})

        controls = comment.locator('.vgp-review-comment-control-btn-panel > span')
        expect(controls).to_have_count(2)
        controls.nth(1).click()
        editor = comment.locator('.vgp-review-comment-text-editor')
        expect(editor).to_be_visible()
        editor.fill(modified_marker)
        root_page.once('dialog', lambda dialog: dialog.accept())
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_modify_panel_entity_review_comment')) as result:
                comment.locator(
                    '.vgp-review-comment-editor-control-panel button',
                    has_text='Save').click()
            assert_reload_response(result.value)

        modified = matching_comments(modified_marker)
        assert len(modified) == 1, 'Expected exactly one modified Review Comment'
        comment = root_page.locator('.vgp-review-comment-container').filter(
            has_text=modified_marker).first
        expect(comment.locator('.vgp-review-comment-text-content')).to_have_text(
            modified_marker)
        take_screenshot(root_page, psn_config, 'review_comment_modified')
        if activity_check:
            query = parse_qs(urlparse(root_page.url).query)
            activity_check('review_comment', 'change', modified_marker,
                           {key: query[key][0] for key in ('panel_id', 'entity_name')})

        root_page.once('dialog', lambda dialog: dialog.accept())
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_delete_panel_entity_review_comment')) as result:
                comment.locator(
                    '.vgp-review-comment-control-btn-panel > span').first.click()
            assert_reload_response(result.value)

        assert not matching_comments(modified_marker)
        expect(root_page.locator('.vgp-review-comment-text-content').filter(
            has_text=modified_marker)).to_have_count(0)
        take_screenshot(root_page, psn_config, 'review_comment_deleted')
        if activity_check:
            query = parse_qs(urlparse(root_page.url).query)
            activity_check('review_comment', 'delete', modified_marker,
                           {key: query[key][0] for key in ('panel_id', 'entity_name')})
    finally:
        leftovers = [row for row in current_review_comments(root_page, psn_config)
                     if row.get('comment') in (marker, modified_marker)
                     and str(row.get('original_review_id')) == original_review_id]
        for row in leftovers:
            response = root_page.context.request.post(
                origin + '/panelsearch_nanbyo_delete_panel_entity_review_comment',
                data={
                    'review_id': row['review_id'],
                    'original_review_id': row['original_review_id'],
                    'review_comment_id': row['review_comment_id'],
                    'user_id': row['user_id'],
                },
            )
            assert_json_response(response)


def test_panel_entity_definition_delete_hidden_for_anonymous(root_page):
    expect(root_page.locator('#vgp-panel-entity-summary-wrapper')).to_be_visible()
    expect(root_page.locator('#btn-definition-delete')).to_have_count(0)


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_definition_edit_visible(root_page, psn_config):
    query = parse_qs(urlparse(root_page.url).query)
    summary = root_page.locator('#vgp-panel-entity-summary-wrapper')
    edit = summary.locator('#btn-definition-edit')
    expect(edit).to_be_visible(timeout=60000)
    expect(summary.locator('#vgp-summary-table')).to_be_visible()
    edit.click()
    expect(summary.locator('#vgp-definition-table')).to_be_visible()
    expect(summary.locator('#input_definition_panel_id')).to_have_value(
        query['panel_id'][0])
    expect(summary.locator('#input_definition_entity_name')).to_have_value(
        query['entity_name'][0])
    expect(summary.locator('#btn-definition-save')).to_be_visible()
    take_screenshot(root_page, psn_config, 'entity_definition_edit_visible')
    summary.locator('#btn-definition-cancel').click()
    expect(summary.locator('#vgp-summary-table')).to_be_visible()
    expect(summary.locator('#vgp-definition-table')).not_to_be_visible()


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_definition_delete_cancel(root_page, psn_config):
    if not current_definitions(root_page, psn_config):
        pytest.skip('This entity has no current definition to delete')

    delete = root_page.locator('#btn-definition-delete')
    expect(root_page.locator('#btn-definition-edit')).to_be_visible(timeout=60000)
    expect(delete).to_be_visible(timeout=60000)
    definition_id = root_page.locator('#input_definition_review_id').input_value()
    assert definition_id
    delete.click()
    dialog = root_page.locator('#confirmationModal')
    expect(dialog).to_be_visible()
    expect(dialog.locator('#confirmationModalLabel')).to_have_text(
        'Confirm Deletion of Entity Definition')
    expect(dialog).to_contain_text(root_page.locator('#input_definition_entity_name').input_value())
    expect(dialog.locator('#btnConfirmAction')).to_have_text('Delete Definition')
    take_screenshot(root_page, psn_config, 'entity_definition_delete_confirmation')
    dialog.get_by_role('button', name='Cancel', exact=True).click()
    expect(dialog).not_to_be_visible()
    expect(delete).to_be_visible()


@pytest.mark.parametrize('root_page', ['admin', 'curator'], indirect=True)
def test_panel_entity_definition_add_cancel(root_page, psn_config):
    with definitionless_entity(root_page, psn_config) as page:
        summary = page.locator('#vgp-panel-entity-summary-wrapper')
        edit = summary.locator('#btn-definition-edit')
        expect(edit).to_be_visible(timeout=60000)
        edit.click()
        marker = 'PSN-E2E-CANCEL-' + uuid4().hex
        summary.locator('#input_definition_comment').fill(marker)
        summary.locator('#btn-definition-save').click()
        dialog = page.locator('#confirmationModal')
        expect(dialog).to_be_visible()
        expect(dialog.locator('#confirmationModalLabel')).to_have_text(
            'Confirm Addition of Entity Definition')
        expect(dialog).to_contain_text(marker)
        expect(dialog.locator('#btnConfirmAction')).to_have_text('Add Definition')
        take_screenshot(page, psn_config, 'entity_definition_add_confirmation')
        dialog.get_by_role('button', name='Cancel', exact=True).click()
        expect(dialog).not_to_be_visible()
        expect(summary.locator('#input_definition_comment')).to_have_value(marker)
        assert not current_definitions(page, psn_config)
        summary.locator('#btn-definition-cancel').click()
        expect(summary.locator('#vgp-summary-table')).to_be_visible()


@pytest.mark.parametrize('root_page', ['admin'], indirect=True)
def test_panel_entity_definition_add_delete_submit(root_page, psn_config, activity_check=None):
    if os.getenv('PSN_DEFINITION_MUTATION') != '1':
        pytest.skip('Set PSN_DEFINITION_MUTATION=1 for a disposable entity with no current definition')
    assert not current_definitions(root_page, psn_config), (
        'The mutation target must have no current definition')
    summary = root_page.locator('#vgp-panel-entity-summary-wrapper')
    edit = summary.locator('#btn-definition-edit')
    expect(edit).to_be_visible(timeout=60000)
    expect(summary.locator('#btn-definition-delete')).to_have_count(0)
    marker = 'PSN-E2E-DEFINITION-' + uuid4().hex
    origin = psn_config.settings['origin'].rstrip('/')
    created_id = None

    try:
        edit.click()
        summary.locator('#input_definition_comment').fill(marker)
        summary.locator('#btn-definition-save').click()
        dialog = root_page.locator('#confirmationModal')
        expect(dialog).to_be_visible()
        expect(dialog).to_contain_text(marker)
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_regist_entity_definition')) as result:
                dialog.locator('#btnConfirmAction').click()
            assert result.value.ok, f'Add Definition: HTTP {result.value.status}'

        saved = [row for row in current_definitions(root_page, psn_config)
                 if row.get('comment') == marker]
        assert len(saved) == 1, 'Expected exactly one new definition'
        created_id = saved[0]['review_id']
        expect(summary.locator('#input_definition_review_id')).to_have_value(str(created_id), timeout=60000)
        delete = summary.locator('#btn-definition-delete')
        expect(delete).to_be_visible()
        take_screenshot(root_page, psn_config, 'entity_definition_add_saved')
        if activity_check:
            query = parse_qs(urlparse(root_page.url).query)
            activity_check('definition', 'add', marker,
                           {key: query[key][0] for key in ('panel_id', 'entity_name')})

        delete.click()
        expect(dialog).to_be_visible()
        expect(dialog.locator('#confirmationModalLabel')).to_have_text(
            'Confirm Deletion of Entity Definition')
        expect(dialog).to_contain_text(marker)
        with root_page.expect_navigation(wait_until='domcontentloaded'):
            with root_page.expect_response(lambda r: response_matches(
                    r, '/panelsearch_nanbyo_delete_entity_definition')) as result:
                dialog.locator('#btnConfirmAction').click()
            assert result.value.ok, f'Delete Definition: HTTP {result.value.status}'

        assert not current_definitions(root_page, psn_config)
        expect(summary.locator('#btn-definition-delete')).to_have_count(0, timeout=60000)
        take_screenshot(root_page, psn_config, 'entity_definition_delete_saved')
        if activity_check:
            query = parse_qs(urlparse(root_page.url).query)
            activity_check('definition', 'delete', marker,
                           {key: query[key][0] for key in ('panel_id', 'entity_name')})
    finally:
        leftovers = [row for row in current_definitions(root_page, psn_config)
                     if row.get('comment') == marker]
        for row in leftovers:
            response = root_page.context.request.post(
                origin + '/panelsearch_nanbyo_delete_entity_definition',
                data={'entity_id': row['review_id']})
            body = assert_json_response(response)
            assert body.get('success') is True, f'Cleanup failed for definition {row["review_id"]}'
