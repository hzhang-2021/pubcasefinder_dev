import os
from playwright.sync_api import Playwright, sync_playwright

def run(playwright: Playwright) -> None:
    # 1. 启动持久化上下文
    context = playwright.chromium.launch_persistent_context(
        user_data_dir="./my_user_data1",
        headless=False,
        args=["--disable-blink-features=AutomationControlled"],
        channel="chrome"
    )
    
    page = context.pages[0] if context.pages else context.new_page()
    page.goto("http://pcf.bits.cc/panelsearch_nanbyo", wait_until="domcontentloaded")
    
    # 2. 导航到登录页面
    page.locator("a").filter(has_text="Log in").click()
    page.get_by_role("button", name="Log in").click()
    
    # 3. 暂停，等待你在浏览器中手动完成 Google 登录
    print("Playwright Inspector click 'Resume' ")
    page.pause()
    
    # 4. 确保目标目录存在 (避免因为目录不存在而报错)
    os.makedirs("playwright/.auth", exist_ok=True)
    
    # 5. 保存认证状态到指定的 JSON 文件
    # 注意：这里直接调用 context.storage_state()，而不是 browser_context
    context.storage_state(path="playwright/.auth/state.json")
    print("✅ stored playwright/.auth/state.json")
    
    # 6. 关闭上下文
    context.close()

with sync_playwright() as playwright:
    run(playwright)