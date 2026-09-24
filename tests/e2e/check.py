from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(storage_state="playwright/.auth/state.json")
    page = context.new_page()
    page.goto("https://staging-pubcasefinder.dbcls.jp/")
    page.wait_for_timeout(5000)  # 停 5 秒，观察是否已登录
    print(page.title())
    browser.close()