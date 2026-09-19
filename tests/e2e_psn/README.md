# PanelSearch Nanbyo E2E テスト

pytest と Playwright の同期 API を使用する独立した E2E テストプロジェクトです。
`../e2e` と同様に、YAML → Config → fixture → ページ操作・検証 → スクリーンショットの構成を採用しています。
13 ページのテストファイルと、ログイン状態・ログアウトを検証する共通テストファイルがあります。
デプロイ済みのサイトにアクセスして検証します。Flask の起動、データベースの作成・データ投入、バックエンド API のモックは行いません。

## ディレクトリ構成

```text
e2e_psn/
  pyproject.toml / uv.lock      依存関係と pytest の設定
  conftest.py                  言語、認証状態、ページ・API の読み込み、コンテキストの終了処理
  psn_common.py                設定、URL、JSON 応答の検証、スクリーンショットの共通処理
  config/{ja,en}/config.yaml   接続先、ページ、テストケースの設定
  src/test_psn_<page>.py       ページ別テストとログイン状態・ログアウトのテスト
  test_case.tsv               テストケース一覧、目的、成功条件、実行結果
  playwright/.auth/           ローカルの認証状態（コミット対象外）
  test_result/{ja,en}/         操作結果と失敗時のスクリーンショット（コミット対象外）
```

スクリーンショットのファイル名にはページ設定名を接頭辞として付けます。
例：`panel_list_PSN-01_visible.png`、`panel_detail_download.png`。
失敗時とログイン状態・ログアウトのスクリーンショットにも、テスト対象ページ名を使用します。
ログアウト後に別ページへ遷移した場合も同じです。新規に生成する画像に適用し、既存の画像名は変更しません。

共通モジュール名は `psn_common` とし、既存プロジェクトの `test_common` との衝突を避けています。
言語オプションは `--psn-lang` を使用し、既存の `--app-lang` と区別しています。
設定、画像、既定の認証ファイルのパスは、このディレクトリを基準に解決します。

## 対象ページと使用ロール

| ページ | 使用ロール | 検証内容 |
| --- | --- | --- |
| panel_list | anonymous | 初期表示、既存のパネル名による検索、該当なし検索、既定の Panel 選択、ドロップダウンの開閉、Gene 検索、検索文字を保持した Panel/Gene の相互切り替えと再検索、Genes・Clinical features の展開可否と表示内容 |
| panel_detail | anonymous / reviewer | 詳細表示、タブの切り替え、Version comments の履歴内容、Reviewers の一覧・件数・レビュー詳細、Version comparison の差分と絞り込み、Filter entities の絞り込みと解除、Panel Genes の Papers・Reviewer ratings・Reference ratings の表示、TSV ダウンロード、Add Entity の権限制御と確認・キャンセル、Add Review の確認・キャンセルと登録 |
| panel_entity_detail | anonymous / reviewer / admin / curator | エンティティ概要、Review／History タブの切り替え、Review Comment の追加・変更・削除、admin・curator で Entity Definition の編集画面表示、追加・削除の確認とキャンセル、専用データでの追加・削除 |
| ontology | anonymous | バージョン一覧、データベース内の既存バージョンの選択と読み込み |
| admin_user | admin | ユーザー一覧、該当なしの絞り込み |
| admin_group | curator | グループ一覧、該当なしの絞り込み |
| admin_group_activity | admin | グループ活動ログ、該当なしの絞り込み |
| admin_activity | admin | 活動一覧、日付による絞り込み時の API 呼び出し |
| admin_authentication | admin | 認証ログ、該当なしの絞り込み |
| admin_incharge | curator | 確認待ち活動一覧と確認履歴 API の読み込み |
| admin_profile | reviewer | プロフィール表示、編集画面の表示とキャンセル |
| admin_review | reviewer | 自分の Review の読み込み（Review がない場合も許容） |
| admin_mail | admin | ログの読み込み、テンプレート／SMTP／ログのタブ切り替え |

Gene 検索では `ACTA1` を入力し、結果に「先天性ミオパチー」が含まれることを検証します。
英語設定では対応する表示名 `Congenital myopathy` を検証します。

表のロールはテストに使用するアカウントのロールです。group と incharge は管理者もアクセスできます。
activity、profile、review のページルートは一般のログイン済みユーザーもアクセスできます。
ページの別名には共通のテストを使用します。
`admin_layout` と `panel_input_modal` はレイアウト・部分テンプレートです。
`admin_statistics` には対応するページルートがないため、独立したページテストを作成していません。

## 準備

```powershell
cd tests/e2e_psn
uv sync
uv run playwright install chromium
```

接続先は `settings.origin` または環境変数 `PSN_BASE_URL` で指定します。
値にはスキーム、ホスト、必要に応じてポートのみを指定します（例：`http://pcf.bits.cc`）。
`/panelsearch_nanbyo` は含めません。ページのパスは `pages.*.path` から追加します。
管理画面の一部は日本語固定のため、`en` 設定でもすべてが英語になるとは限りません。

### 認証状態の保存

Nanbyo 用の認証状態を使用します。通常の PanelSearch のセッションをそのまま再利用できるとは限りません。
reviewer、curator、admin の各アカウントで Nanbyo に手動ログインし、状態を保存します。
reviewer の保存先ファイル名は `member.json` です。

```powershell
uv run python login.py reviewer
uv run python login.py curator
uv run python login.py admin
```

スクリプトはロールごとに独立した永続ブラウザーディレクトリを使用します。
Google ログインを手動で完了した後、Inspector の Resume をクリックすると、
`playwright/.auth/member.json`、`curator.json`、`admin.json` にそれぞれ保存します。
`PSN_REVIEWER_STATE`、`PSN_CURATOR_STATE`、`PSN_ADMIN_STATE` で絶対パスを指定することもできます。
これらのファイルには認証情報が含まれるため、`.gitignore` に登録されています。
アカウントの自動作成や Google OAuth ログインの自動実行は行いません。

### テストデータと期待値

詳細ページには対象環境の実データが必要です。日本語・英語の設定ファイルの `pages.*.query` に指定します。

- `panel_detail`：`panel_id`。
- `panel_entity_detail`：`panel_id`、`entity_type_id`、`entity_name`、`gene_id`、`gene_symbol`。
  既定は Gene 型の `entity_type_id: '1'` です。同じエンティティの詳細リンクに含まれる値を使用してください。

必須項目は `PSN_PANEL_ID`、`PSN_ENTITY_NAME`、`PSN_GENE_ID`、`PSN_GENE_SYMBOL` でも上書きできます。
必須 ID や認証ファイルがない場合、該当テストをスキップします。認証ファイルが失効している場合は失敗します。
`--psn-require-auth` を指定すると、認証ファイルの不足も失敗として扱います。

- `suites.*.test_cases[].expected_text`：CSS セレクターごとの期待文字列。
- `suites.panel_list.search_text`：パネル名の検索語。空の場合は画面に表示された実際の名前を使用します。
- `suites.panel_list.gene_acta1_expected_panel`：ACTA1 検索で期待するパネル名。
- `suites.panel_detail.download_contains`：ダウンロードした TSV に含まれるべき文字列。

### テストデータと検証内容

1. **Ontology**

   読み込み可能な既存バージョンが少なくとも 1 件必要です。

2. **Panel List：Genes・Clinical features**

   現在表示されているパネルから、件数が 1 以上または 0 の行を選びます。
   件数が 1 以上なら、展開・表示・折りたたみを確認します。
   件数が 0 なら、詳細領域が開かずデータを読み込まないことを確認します。

   Genes はデータ URL を持つ表コンポーネントの生成を確認します。
   Clinical features は API 応答、各分類表の見出し、全データ行数を検証します。
   条件に一致する行がない場合は、該当ケースを理由付きでスキップします。

3. **Panel Genes：Papers・Reviewer ratings・Reference ratings**

   対象パネル内に、各項目が 1 件以上ある遺伝子と、件数が 0 の遺伝子が必要です。

   - 件数が 1 件以上：詳細表の展開・表示・折りたたみを確認します。
   - Papers：Title・Journal・Date・Source とデータ行を確認します。
   - Reviewer ratings・Reference ratings：見出しと表示行数を確認します。
   - 件数が 0：クリックしても詳細表が開かないことを確認します。

4. **Version comments**

   タブを開き、画面に渡されたバージョン履歴と表示行数が一致することを確認します。
   各行の日付、コメント、表示されるバージョン番号を履歴データと照合します。

5. **Reviewers**

   Review API の結果をユーザー単位に集計し、タブと合計の reviewer 数、名前順の一覧、所属、Review 件数を照合します。
   Review がある場合は先頭 reviewer の件数をクリックし、詳細表の見出し、1 ページ目の行数、Gene の並び、エンティティ詳細リンクを確認します。

6. **Version comparison**

   変更履歴 API の成功、直近 2 バージョンの初期選択、選択候補数を確認します。
   差分表の Entity 件数、Added・Removed・Rating changed の集計とサマリー表示を照合し、Entity 名による絞り込みと解除も検証します。

7. **Review・Comment の権限表示**

   - reviewer：本人の Review と Comment だけに編集・削除操作が表示され、他人の Review と Comment には表示されないことを確認します。
   - admin・curator：すべての Review と Comment に編集・削除操作が表示されることを確認します。
   - すべてのログインロール：すべての Review に Add Comment が表示されることを確認します。

   本人・他人の Review や Comment が揃わない場合は、該当ケースを理由付きでスキップします。

8. **Review Comment の変更・削除 API**

   Comment の作成者、admin、対象 Panel に割り当てられた curator だけが変更・削除できることを確認します。
   それ以外のユーザーには HTTP 403 を返します。
   Comment の所有者は、リクエスト値ではなくデータベースから判定します。

   オフライン権限テストは、リポジトリ直下で次のコマンドを実行します。

   ```powershell
   uv run --project tests/e2e_psn pytest tests/test_psn_review_comment_permissions.py tests/test_psn_review_delete_permissions.py -q
   ```

9. **Review Comment の追加・変更・削除**

   admin の認証状態を使用し、既存 Review に一意の Comment を追加します。

   - 画面と読み取り API への反映を確認します。
   - 同じ Comment を編集し、新しい内容に置き換わることを確認します。
   - 画面から削除し、Comment が消えることを確認します。
   - 途中で失敗した場合も、一意の Comment から残存データを特定して削除します。

10. **Entity Definition の編集・追加・削除確認**

    admin・curator の認証状態を使用します。

    - 編集表示：Edit ボタン、編集表、Save ボタン、Cancel による概要表示への復帰を確認します。Save は実行せず、定義を変更しません。
    - 追加確認：現在有効な定義がないエンティティを使用します。Comment を入力して Save を押し、確認画面を検証して Cancel で閉じます。入力値が保持され、定義が登録されないことを確認します。
    - 削除確認：有効な定義がある場合に Delete ボタンと確認画面を検証し、Cancel で閉じます。新しい画面と API がデプロイされるまで、実測結果は未実行として扱います。

追加・削除の確定テストは、専用の admin 認証状態と、現在有効な定義がない使い捨てエンティティを用意してから `PSN_DEFINITION_MUTATION=1` を設定した場合だけ実行します。対象は `pages.panel_entity_detail.query` または `PSN_PANEL_ID`・`PSN_ENTITY_NAME`・`PSN_GENE_ID`・`PSN_GENE_SYMBOL` で指定します。テストは一意のコメントを付けて画面から登録し、読み取り API と画面で新しい定義を確認した後、画面から削除して消失を確認します。途中で失敗しても今回のコメントで識別した有効な定義の削除を試みます。登録・削除に伴うパネルのバージョンと活動履歴は残ります。

```powershell
$env:PSN_DEFINITION_MUTATION = '1'
uv run pytest src/test_psn_panel_entity_detail.py -k add_delete_submit --browser=chromium --psn-require-auth
```

## 実行方法

```powershell
# テストの収集のみ（サイトにはアクセスしません）
uv run pytest --collect-only -q

# 日本語／英語
uv run pytest --browser=chromium
uv run pytest --browser=chromium --psn-lang en

# ページ単位で実行
uv run pytest src/test_psn_panel_list.py --browser=chromium

# 認証ファイルの不足を失敗として扱う
uv run pytest --browser=chromium --psn-require-auth
```

### 特別な環境変数が必要なテスト

通常実行では、デプロイ先のデータを更新する次のテストをスキップします。
実行する場合は、対象テストに対応する環境変数へ文字列 `1` を設定してください。

| 環境変数 | 対象テスト | 必要なロール | 前提条件 | テスト後の処理 |
| --- | --- | --- | --- | --- |
| `PSN_ADD_ENTITY_MUTATION=1` | `test_panel_detail_add_entity_submit` | reviewer | 対象パネルへ追加可能な未登録 Gene が候補一覧に存在する | 作成した Review を一意のコメントで特定して削除する |
| `PSN_REVIEW_COMMENT_MUTATION=1` | `test_panel_entity_review_comment_add_modify_delete` | admin | 対象 Entity にコメント追加先となる Review が1件以上存在する | 追加したコメントを画面から削除し、失敗時も API による後処理を試みる |
| `PSN_DEFINITION_MUTATION=1` | `test_panel_entity_definition_add_delete_submit` | admin | 現在有効な Definition がない使い捨て Entity を指定する | 追加した Definition を画面から削除し、失敗時も API による後処理を試みる |

Add Entity の確定テスト：

```powershell
$env:PSN_ADD_ENTITY_MUTATION = '1'
uv run pytest src/test_psn_panel_detail.py -k add_entity_submit --browser=chromium --psn-require-auth
Remove-Item Env:PSN_ADD_ENTITY_MUTATION
```

Review Comment の追加・変更・削除テスト：

```powershell
$env:PSN_REVIEW_COMMENT_MUTATION = '1'
uv run pytest src/test_psn_panel_entity_detail.py -k review_comment_add_modify_delete --browser=chromium --psn-require-auth
Remove-Item Env:PSN_REVIEW_COMMENT_MUTATION
```

Entity Definition の追加・削除テスト：

```powershell
$env:PSN_DEFINITION_MUTATION = '1'
uv run pytest src/test_psn_panel_entity_detail.py -k add_delete_submit --browser=chromium --psn-require-auth
Remove-Item Env:PSN_DEFINITION_MUTATION
```

これらのテストは作成した現在データを削除しますが、登録・変更・削除によって生成されたパネルのバージョンと活動履歴は残ります。
環境変数が未設定、空文字、または `1` 以外の場合、対応するテストはスキップされます。

`PSN_BASE_URL`、`PSN_CONFIG_DIR`、`PSN_REVIEWER_STATE`、`PSN_CURATOR_STATE`、`PSN_ADMIN_STATE`、
`PSN_PANEL_ID`、`PSN_ENTITY_NAME`、`PSN_GENE_ID`、`PSN_GENE_SYMBOL` は接続先、設定ファイル、認証状態、対象データを上書きする任意設定です。テストの更新操作を有効化する環境変数ではありません。

各テストで新しいブラウザーコンテキストを作成し、終了時に閉じます。
初期 API 応答の待機はページ遷移前に登録します。
JSON 応答では HTTP ステータスとアプリケーションのエラーを検証し、正常な空の結果は許容します。
スクリーンショットは言語別に保存します。テスト本体の失敗時は fixture が画像を保存してからコンテキストを閉じます。
画像は目視確認用で、基準画像との自動比較は行いません。現在、トレース・動画は有効にしていません。

`test_case.tsv` の「未実行」は実測前、「成功」は記載された言語・日付での実行成功を表します。
「テスト目的」は各ケースで確認したい動作、「成功条件」は現在のテストコードが実際に検証する条件です。実行結果とは独立して記録します。

## ログイン状態とログアウトのテスト

`src/test_psn_login_logout.py` は、保存済みの reviewer 認証状態を使用します。
対象は `suites.login_logout` で設定する panel_list、panel_detail、admin_profile です。
ユーザー表示とログインボタンの非表示を確認し、ユーザーメニューからログアウトします。
ログインボタンの再表示とユーザー表示の消失を確認した後、再読み込みしてログアウト状態の継続を検証します。
各ケースは独立したコンテキストで実行します。Google OAuth のログイン操作自体は自動化していません。

```powershell
uv run pytest src/test_psn_login_logout.py -rs
```

## 検証範囲と制約

### Add Review

Panel Detail の Add Review テストは reviewer の認証状態を使用します。
対象パネル（既定：`NANDO:1200477`）の ACTA1 に対するレビュー権限が必要です。
Publications には `PMID: 18976909 DOI: 10.1016/j.nmd.2008.09.005` を入力します。
確認ダイアログで PMID・DOI の表示を検証し、キャンセル時は入力保持、登録時は保存値の一致を確認します。
既存の匿名テストは匿名のまま実行します。

- `test_panel_detail_add_review_cancel`：ACTA1 の Add Review を開き、遺伝子・エンティティ型・新規登録状態を検証します。
  コメントを入力して Submit を押し、確認ダイアログの内容、キャンセル後の入力保持、フォームを閉じる操作を検証します。
- `test_panel_detail_add_review_submit`：一意の識別文字列をコメントに入力し、確認ダイアログから実際に登録します。
  登録 API の成功とエンティティ詳細画面でのコメント表示を検証します。
  終了時には同じ認証状態で削除 API を呼び出し、この実行で作成した Review だけを削除して一覧からの消失を確認します。
  検証失敗時も後処理を試みます。登録・削除の活動ログは残ります。

### Add Entity

Panel Detail の Add Entity テストは、匿名ユーザーにボタンが表示されないことを確認します。
reviewer では Add Entity を開き、現在のパネルに含まれない Gene 候補を画面から選択します。
新規 Review の状態、Gene 型、選択した Gene、確認ダイアログのコメントを検証し、Cancel 後も入力値が保持されることを確認します。
確認ダイアログでは確定しないため、パネルの Entity や Review は変更しません。

実際の登録テストは `PSN_ADD_ENTITY_MUTATION=1` を設定した場合だけ実行します。
画面から未登録 Gene を追加し、登録 API、Panel genes の一覧、Review とコメントの読み取り API への反映を確認します。
終了時には一意のコメントで今回作成した Review を特定して削除します。登録・削除の活動履歴は残ります。

```powershell
$env:PSN_ADD_ENTITY_MUTATION = '1'
uv run pytest src/test_psn_panel_detail.py -k add_entity_submit --browser=chromium --psn-require-auth
```

2026-09-16 の実行では、日本語の登録テストと日本語・英語のキャンセルテストが成功しました。
英語の登録テストでは、登録後のエンティティ詳細画面が `Reviews (0)` のままで、
追加したコメントの表示確認に失敗しています。作成したテスト Review の削除処理は成功しています。

```powershell
uv run pytest src/test_psn_panel_detail.py -k add_review -rs
```

ページ表示と閲覧操作を中心とする回帰テストです。
上記 Add Review テストと、明示的に有効化した Entity Definition の追加・削除テストを除き、定義の変更、コメントの単独追加・削除、Ontology の新規インポート、
グループ・ユーザー権限の変更、活動の確認、アカウント削除、メールテンプレートの変更、メール再送は実行しません。
これらの更新操作に必要なテストデータの準備・削除処理も実装していません。
メール画面は閲覧のみ、プロフィールは編集画面を開いてキャンセルするまで、Ontology は既存バージョンの読み込みのみです。

ページや API の読み込み成功だけで、すべての業務ロジックの正しさを保証するものではありません。
空の一覧を許容するテストもあるため、具体的なデータを検証する場合は期待値を設定してください。
AJAX の失敗、認証状態の期限切れ、データベースの変更、外部 SPARQL サービスへの接続失敗でもテストは失敗します。
テストの収集成功や過去のスクリーンショットを、実際の E2E テスト成功と混同しないでください。
