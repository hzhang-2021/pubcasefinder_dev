from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(storage_state="playwright/.auth/state.json")
    page = context.new_page()
    page.goto("http://pcf.bits.cc/panelsearch_nanbyo", wait_until="networkidle")

    print("URL:", page.url)
    print("TITLE:", page.title())
    page.wait_for_timeout(5000)                  # 停 5 秒观察
    browser.close()