# PanelSearch Nanbyo E2E 実行結果（2026-09-18）

## 実行条件

- 対象: `http://pcf.bits.cc`
- ブラウザー: Chromium
- 認証: ローカルに保存した reviewer・curator・admin の認証状態
- コマンド（`tests/e2e_psn` で実行）:
  - `uv run pytest --browser=chromium --psn-lang ja --junitxml=test_result/ja/pytest-2026-09-18.xml -q -rs`
  - `uv run pytest --browser=chromium --psn-lang en --junitxml=test_result/en/pytest-2026-09-18.xml -q -rs`

## 結果

| 言語 | 収集 | 成功 | 失敗 | スキップ | 実行時間 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 日本語 | 51 | 48 | 0 | 3 | 357.19 秒 |
| 英語 | 51 | 48 | 0 | 3 | 347.83 秒 |

両言語で同じ 3 件がスキップされました。

- `test_panel_entity_definition_add_cancel[admin]`
- `test_panel_entity_definition_add_cancel[curator]`
  - 対象の ACTA1 には現在有効な Definition があるため、追加確認テストの前提条件を満たしません。
- `test_panel_entity_definition_add_delete_submit[admin]`
  - 使い捨ての対象エンティティと `PSN_DEFINITION_MUTATION=1` を設定していないため、実際の追加・削除は実行していません。

各テストの最新結果は [test_case.tsv](test_case.tsv) の「実行結果」に反映しました。JUnit XML とスクリーンショットはローカルの `test_result/ja`・`test_result/en` に保存し、コミット対象には含めていません。
