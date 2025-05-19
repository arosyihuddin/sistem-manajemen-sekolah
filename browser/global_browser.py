import asyncio
import os
from pathlib import Path

from playwright.async_api import async_playwright

_BEDROCK_PROJECT = os.environ.get("BEDROCK_PROJECT", "")


def is_bedrock_env() -> bool:
    return _BEDROCK_PROJECT != ""


async def launch_chrome_debug():
    """
    Launch Chrome browser with remote debugging enabled on port 9222
    Returns the browser instance when launched successfully
    """
    try:
        extension_path = Path(os.path.dirname(__file__)).joinpath("browser_extension/error_capture")  # type: ignore
        playwright = await async_playwright().start()
        disable_security_args = [
            "--disable-web-security",
            "--disable-site-isolation-trials",
            "--disable-features=IsolateOrigins,site-per-process",
        ]
        workspace = "/workspace" if is_bedrock_env() else "./workspace"
        await playwright.chromium.launch_persistent_context(
            user_data_dir=os.path.join(workspace, "browser", "user_data"),
            headless=False,
            viewport={"width": 1280, "height": 720},
            args=[
                "--no-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-infobars",
                "--disable-background-timer-throttling",
                "--disable-popup-blocking",
                "--disable-backgrounding-occluded-windows",
                "--disable-renderer-backgrounding",
                "--disable-window-activation",
                "--disable-focus-on-load",
                "--no-first-run",
                "--no-default-browser-check",
                "--window-position=0,0",
            ]
            + disable_security_args
            + [
                f"--disable-extensions-except={extension_path}",
                f"--load-extension={extension_path}",
                "--disable-web-security",
                "--disable-site-isolation-trials",
                "--remote-debugging-port=9222",
            ],
            channel="chromium",
        )

        # 永远保持浏览器进程
        while True:
            await asyncio.sleep(1000)

    except Exception as e:
        print(f"ERROR: Failed to launch Chrome browser: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(launch_chrome_debug())
