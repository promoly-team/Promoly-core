from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def create_driver():
    options = Options()

    options.add_argument(
        "--user-data-dir=/home/leandro/selenium-chromium-profile"
    )
    options.add_argument("--profile-directory=Default")

    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")

    return webdriver.Chrome(options=options)
    