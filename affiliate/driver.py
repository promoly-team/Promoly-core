import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


# Perfil persistente do Chrome usado pelo worker de afiliado.
# Configurável por ambiente para não ficar preso a um caminho de máquina.
DEFAULT_PROFILE_DIR = os.path.expanduser("~/selenium-chromium-profile")


def create_driver():
    profile_dir = os.getenv("SELENIUM_PROFILE_DIR", DEFAULT_PROFILE_DIR)
    profile_name = os.getenv("SELENIUM_PROFILE_NAME", "Default")

    options = Options()

    options.add_argument(f"--user-data-dir={profile_dir}")
    options.add_argument(f"--profile-directory={profile_name}")

    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")

    return webdriver.Chrome(options=options)
