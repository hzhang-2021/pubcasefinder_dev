# PubCaseFinder E2Eテスト

## 目的

このディレクトリには、PubCaseFinderの主要機能を実際のブラウザーで操作し、画面遷移、入力、検索結果、ダウンロードなどが利用者の操作どおりに動くことを確認するE2E（End-to-End）テストがあります。

主な目的は次のとおりです。

- アプリケーションの変更によって、既存の画面操作が壊れていないことを確認する
- 日本語画面と英語画面で、表示文言や検索結果が期待どおりであることを確認する
- 認証、疾患検索、症例共有、遺伝子パネル検索という主要な利用経路を継続的に確認する
- テスト失敗時に、アプリの問題、テストデータの変化、設定値の不一致を切り分けやすくする

これらのテストはPlaywrightでChromiumを操作して実行します。画面文言や参照データは更新される可能性があるため、失敗時は直ちにアプリの不具合と判断せず、設定ファイルの期待値も確認してください。

## テスト対象

各テストの詳しい仕様、手順、期待結果は [`test_case.tsv`](./test_case.tsv) に記載しています。テスト関数は、仕様との対応を追いやすくするため、原則として仕様IDと同じ順番で管理します。

| 分類 | 仕様ID | 主な確認内容 |
| --- | --- | --- |
| 認証 | AUTH | ログイン状態の確認、ログアウト |
| 疾患検索 | DS | 症状入力、疾患検索、各結果タブ、フィルター、共有、ダウンロード |
| 症例共有 | CS | 症例の読込・編集・保存・結合、表現型、家系図、統計情報 |
| パネル検索 | PS | パネル・遺伝子・ツリー検索、詳細表示、ダウンロード、履歴、カスタムパネル |


## 全体構成

```text
tests/e2e/
├── README.md                         # この説明書
├── test_case.tsv                     # テスト仕様、手順、期待結果の一覧
├── conftest.py                       # pytest共通設定と言語設定
├── pyproject.toml                    # Python依存関係とpytest設定
├── uv.lock                           # 依存関係のロックファイル
├── config/
│   ├── ja/config.yaml                # 日本語画面用のURL、入力値、期待値
│   └── en/config.yaml                # 英語画面用のURL、入力値、期待値
├── src/
│   ├── test_common.py                # 設定読込、URL生成、共通処理
│   ├── test_login_logout.py          # 認証テスト
│   ├── test_disease_search_top_page.py     # 疾患検索の症状入力・検索実行テスト
│   ├── test_disease_search_result_page.py  # 疾患検索結果・絞り込み・出力テスト
│   ├── test_casesharing.py            # 症例共有の編集・入出力・可視化テスト
│   ├── test_panel_search.py           # 遺伝子パネルの検索・詳細操作テスト
│   └── data_sample/                  # アップロード・結合テスト用データ
├── playwright/.auth/state.json       # 手動作成するログイン状態（Git管理外）
└── test_result/                      # スクリーンショット等の結果（Git管理外）
```

## テストの設定ファイルを編集する際の注意

`config/ja/config.yaml`と`config/en/config.yaml`には、それぞれ日本語画面・英語画面のテストデータがあります。各項目の詳しい説明はファイル内のコメントを参照してください。

- YAMLのインデントや既存のキー構造を維持する
- 画面文言と各種IDは、実際の画面・データの組み合わせに合わせる
- テストケースを追加・削除・並べ替える場合は、`test_case.tsv`、言語別の`config.yaml`、対応する`test_*.py`を同時に確認する

## 操作手順

1. ディレクトリの移動

    ```bash
    cd ./tests/e2e
    ```

2. (基本的には初回のみでok) 仮想環境のセットアップ
    * ローカルPCにuvをinstallして動作
    * 初回のみ必要

    1. (必要ならば) uv がインストールされていることを確認

        ```bash
        # uvがホストにインストールされていることを確認
        # Command not foundになっている場合は、インストールする (参考: https://docs.astral.sh/uv/getting-started/installation/)
        uv self version
        ```

    2. 環境セットアップ

        ```bash
        # 環境設定
        uv sync

        # chromiumのインストール
        uv run playwright install chromium --with-deps
        ```

3. 認証情報を保存(`playwright/.auth/state.json` に認証情報が保存される)
    * 以下コマンドを実行するとブラウザエミュレーターが起動するのでログイン処理をする
    * ログイン後トップページに戻ったら、ブラウザの [x] を押して終了する

    ```bash
    uv run playwright codegen --save-storage=playwright/.auth/state.json https://staging-pubcasefinder.dbcls.jp/
    ```

4. configの調整

    - 日本語画面は`config/ja/config.yaml`、英語画面は`config/en/config.yaml`を使用する
    - テスト実行者や認証アカウントによって異なる設定を修正する
    - 現状は主に次の値を、実際のログイン後の表示に合わせる
        - `suites.login_logout.expected_user_name`
        - `suites.login_logout.logout_button`

5. テストの実行

    - デフォルトでは`config/ja/config.yaml`の日本語テストデータを使用する

    ```bash
    # 日本語画面
    uv run pytest --browser=chromium

    # 英語画面
    uv run pytest --browser=chromium --app-lang en
    ```

6. テストのログ(標準出力)を確認し、必要ならば調査する

    1. ログをチェック
        * PASSED -> OK
        * FAILED -> テスト失敗。タイムアウトしているだけならば、単体でテストを実行すると通る場合がある。あるいはテストデータの修正が必要になった場合がある。
    2. failしていた場合はタイムアウトしている可能性を考え、単体でテストを実行する
        * テストのログにどのテストが失敗したかを書かれているため、ここで指摘されたテストを実行する(例: `FAILED src/test_login_logout.py::test_login_logout[chromium] - PermissionError:`)

            ```bash
            # 例
            uv run pytest src/test_login_logout.py::test_login_logout[chromium]
            ```

        * ファイルごと実行したい場合は以下のように記載

            ```bash
            # 例
            uv run pytest src/test_login_logout.py
            ```

    3. failした原因を確認し、config.yamlの設定ミスか、アプリの動作の問題かを切り分ける。必要ならばconfig.yamlの修正、アプリの修正を実行する。
