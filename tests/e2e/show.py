
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(storage_state="playwright/.auth/state.json")
    page = context.new_page()
    page.goto("https://staging-pubcasefinder.dbcls.jp/", wait_until="domcontentloaded")
    # 此时应该已经处于登录状态
    browser.close()