import argparse
from pathlib import Path
from playwright.sync_api import Playwright, sync_playwright

ROLE_OUTPUT = {
    'reviewer': 'member.json',
    'curator': 'curator.json',
    'admin': 'admin.json',
}


def run(playwright: Playwright, role: str) -> Path:
    """Open a manual PSN login and save the resulting browser state for *role*."""
    output_dir = Path(__file__).resolve().parent / 'playwright' / '.auth'
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / ROLE_OUTPUT[role]

    # 1. 启动持久化上下文
    context = playwright.chromium.launch_persistent_context(
        user_data_dir=str(Path(__file__).resolve().parent / f'my_user_data_{role}'),
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

    # 4. 保存认证状态到角色对应的 JSON 文件
    # 注意：这里直接调用 context.storage_state()，而不是 browser_context
    context.storage_state(path=str(output_path))
    print(f"✅ stored {output_path}")

    # 5. 关闭上下文
    context.close()
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(
        description='保存 PanelSearch Nanbyo 的 Playwright 登录状态'
    )
    parser.add_argument(
        'role', choices=ROLE_OUTPUT,
        help='登录角色：reviewer（输出 member.json）、curator 或 admin'
    )
    args = parser.parse_args()
    with sync_playwright() as playwright:
        run(playwright, args.role)


if __name__ == '__main__':
    main()
