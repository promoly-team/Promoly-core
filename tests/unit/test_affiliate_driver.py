"""Cobre a consolidação e a configuração por ambiente do create_driver
(pontos #7 e #8 da issue #52)."""
import pytest

from affiliate import driver as driver_mod


@pytest.fixture
def fake_chrome(mocker):
    """Evita subir Chrome real; devolve o Options capturado."""
    chrome = mocker.patch.object(driver_mod.webdriver, "Chrome")

    def _options():
        # webdriver.Chrome(options=options) -> kwarg
        _, kwargs = chrome.call_args
        return kwargs["options"]

    chrome.options = _options
    return chrome


@pytest.mark.unit
def test_create_driver_usa_env_profile_dir(mocker, fake_chrome):
    mocker.patch.dict(
        "os.environ",
        {"SELENIUM_PROFILE_DIR": "/custom/profile", "SELENIUM_PROFILE_NAME": "Bot"},
    )

    driver_mod.create_driver()

    args = fake_chrome.options().arguments
    assert "--user-data-dir=/custom/profile" in args
    assert "--profile-directory=Bot" in args


@pytest.mark.unit
def test_create_driver_default_sem_env(mocker, fake_chrome):
    mocker.patch.dict("os.environ", {}, clear=True)

    driver_mod.create_driver()

    args = fake_chrome.options().arguments
    assert f"--user-data-dir={driver_mod.DEFAULT_PROFILE_DIR}" in args
    assert "--profile-directory=Default" in args
    # default derivado do HOME, não um caminho de máquina hardcoded
    import os
    assert driver_mod.DEFAULT_PROFILE_DIR == os.path.expanduser(
        "~/selenium-chromium-profile"
    )


@pytest.mark.unit
def test_mlb_affiliate_reexporta_mesmo_create_driver():
    from affiliate.mlb_affiliate import create_driver as via_mlb

    assert via_mlb is driver_mod.create_driver
