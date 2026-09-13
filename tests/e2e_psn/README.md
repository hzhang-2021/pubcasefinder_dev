# PanelSearch Nanbyo E2E

独立的 pytest + Playwright 同步 API 测试项目。沿用 `../e2e` 的
YAML → Config → fixture → 页面操作/断言 → 截图结构，每个独立页面一个测试文件。
测试访问已部署的网站，不启动 Flask，不建立或填充数据库，不 mock 后端 API。

## 目录

```text
e2e_psn/
  pyproject.toml / uv.lock      独立依赖与 pytest 配置
  conftest.py                  语言、登录状态、页面/API 加载、context 清理
  psn_common.py                Config、URL、JSON 响应断言与截图
  config/{ja,en}/config.yaml   settings / pages / suites
  src/test_psn_<page>.py       13 个页面文件
  test_case.tsv               场景清单；NOT RUN 表示尚未实测
  playwright/.auth/           本地登录状态（不提交）
  test_result/{ja,en}/         过程截图与 failures（不提交）
```

公共模块采用 `psn_common` 命名，避免与旧项目的 `test_common` 冲突。
语言开关采用 `--psn-lang`，避免与旧项目的 `--app-lang` 重复注册。
配置、截图及默认认证文件路径以本目录为基准，不依赖启动目录。

## 页面和角色

| 页面 | 配置角色 | 已实现覆盖 |
| --- | --- | --- |
| panel_list | anonymous | 初始数据、已有名称搜索、无匹配搜索 |
| panel_detail | anonymous | 详情、实体/版本历史/Reviewer 标签、TSV 下载 |
| panel_entity_detail | anonymous | 实体概况、Review/History 标签 |
| ontology | anonymous | 版本列表、选择并加载数据库中的版本 |
| admin_user | admin | 用户列表、无匹配过滤 |
| admin_group | curator | 分组列表、无匹配过滤 |
| admin_group_activity | admin | 分组活动日志、无匹配过滤 |
| admin_activity | member | 活动列表、日期过滤触发 API |
| admin_authentication | admin | 登录日志、无匹配过滤 |
| admin_incharge | curator | 待确认活动列表与确认历史 API 加载 |
| admin_profile | member | 资料展示、编辑和取消 |
| admin_review | member | 我的 Review 加载；允许账号没有 Review |
| admin_mail | admin | 日志加载、模板/SMTP/日志标签切换 |

这里的角色是测试使用的账号角色；group、incharge 页面也允许管理员访问。
activity、profile、review 的页面路由允许普通已登录用户访问。
页面别名共用测试，不为别名重复生成文件。
`admin_layout` 和 `panel_input_modal` 是布局/片段；`admin_statistics` 没有对应页面路由，
不创建一个永远无法访问的页面测试。

## 准备

```powershell
cd tests/e2e_psn
uv sync
uv run playwright install chromium
```

可编辑 `settings.origin`，或使用环境变量 `PSN_BASE_URL`。
该值只能包含协议、主机及可选端口，例如 `http://pcf.bits.cc`，
不能包含 `/panelsearch_nanbyo`；页面路径由 `pages.*.path` 单独拼接。
管理员界面部分路由固定日文，`en` 配置并不表示这些页面支持全英文。

业务测试使用 Nanbyo 登录状态，不能假设普通 PanelSearch 的 session 可直接复用。
分别用 member、curator、admin 账号手动登录 Nanbyo，再保存对应状态。例如：

```powershell
uv run playwright codegen --save-storage=playwright/.auth/admin.json https://staging-pubcasefinder.dbcls.jp/panelsearch_nanbyo
```

对另外两种角色分别保存为 `member.json`、`curator.json`。
也可用 `PSN_MEMBER_STATE`、`PSN_CURATOR_STATE`、`PSN_ADMIN_STATE` 指定文件绝对路径。
这些文件含登录凭证，已经加入 `.gitignore`。
测试不自动创建账号，也不自动执行 Google OAuth 登录。

详情页需要环境中的真实数据。在两份配置的 `pages.*.query` 中填入：

- `panel_detail`：`panel_id`。
- `panel_entity_detail`：`panel_id`、`entity_type_id`、`entity_name`、`gene_id`、`gene_symbol`。
  默认是 Gene 类型 `entity_type_id: '1'`，字段应来自同一个真实实体的详情链接。

也可以通过 `PSN_PANEL_ID`、`PSN_ENTITY_NAME`、`PSN_GENE_ID`、`PSN_GENE_SYMBOL` 覆盖必填字段。
未配置 ID 或缺少登录文件时，对应用例明确 skip；提供了失效的登录文件则失败。
`--psn-require-auth` 可将缺少登录文件改为失败，适合完整回归 CI。

`suites.*.test_cases[].expected_text` 可增加“CSS selector → 预期文字”的业务断言。
`suites.panel_list.search_text` 可固定搜索词；为空时读取列表中真实名称后搜索。
`suites.panel_detail.download_contains` 可配置导出文件必须包含的实体名称等。
Ontology 测试要求目标环境至少存在一个可读取版本。

## 运行

```powershell
# 仅检查收集，不访问网站
uv run pytest --collect-only -q

# 日文 / 英文
uv run pytest --browser=chromium
uv run pytest --browser=chromium --psn-lang en

# 单页面
uv run pytest src/test_psn_panel_list.py --browser=chromium

# 要求所有角色的登录文件存在
uv run pytest --browser=chromium --psn-require-auth
```

每个测试使用新的 context，结束时关闭；初始 API 的监听在导航前注册。
JSON 响应检查 HTTP 状态和应用层 error，允许合法空集合。
显式过程截图按语言分类；调用阶段失败时 fixture 保存失败截图再关闭 context。
截图用于人工检查，没有图像基线比对。当前未启用 trace/video。

## 覆盖边界

这是页面与查看交互的第一版回归套件。没有执行注册 Review、修改定义、
增删评论、导入新 Ontology、修改分组/用户权限、确认活动、删除账号、
修改邮件模板或重发邮件。也没有实现这些写操作的测试数据准备和清理。
邮件页仅查看；个人资料仅打开编辑并取消；Ontology 仅读取已有版本。

页面/API 能加载不等于全部业务逻辑正确。空列表允许通过；需要验证具体业务数据时，
应填写 golden expectations。AJAX 失败、过期账号、数据库数据变化和外部 SPARQL 服务
不可达均可能导致失败，不能把收集通过或历史截图当成实际 E2E 通过。

## ???????

`src/test_psn_login_logout.py` ?? admin ??????????????
????????????????????????????????????
??????????? context????????????
?? e2e ?????????????? session?????? Google OAuth?
???? YAML ? `suites.login_logout` ?????????????????????

```powershell
uv run pytest src/test_psn_login_logout.py -rs
```
