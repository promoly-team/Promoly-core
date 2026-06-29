"""Cobre a robustez do worker de afiliado: espera real pelo link (#9) e
restart periódico do driver (#10) da issue #52."""
import pytest
from selenium.common.exceptions import TimeoutException

from affiliate import mlb_affiliate
from affiliate import main as worker_main


# ---------------------------------------------------------------------------
# #9 — gerar_link_afiliado espera o link aparecer em vez de sleep fixo
# ---------------------------------------------------------------------------

@pytest.fixture
def driver(mocker):
    return mocker.MagicMock(name="driver")


@pytest.fixture(autouse=True)
def no_sleep(mocker):
    mocker.patch.object(mlb_affiliate.time, "sleep")


@pytest.mark.unit
def test_gerar_link_retorna_quando_link_aparece(mocker, driver):
    wait = mocker.MagicMock(name="wait")
    # WebDriverWait(...).until() devolve sem estourar -> link disponível
    fake_wait = mocker.patch.object(mlb_affiliate, "WebDriverWait")
    fake_wait.return_value.until.return_value = True
    mocker.patch.object(
        mlb_affiliate, "extrair_link_afiliado", return_value="http://aff/x"
    )

    link = mlb_affiliate.gerar_link_afiliado(driver, wait, "http://prod/MLB1")

    assert link == "http://aff/x"
    fake_wait.assert_called_once_with(driver, mlb_affiliate.RESULT_TIMEOUT)


@pytest.mark.unit
def test_gerar_link_retorna_none_em_timeout(mocker, driver):
    wait = mocker.MagicMock(name="wait")
    fake_wait = mocker.patch.object(mlb_affiliate, "WebDriverWait")
    fake_wait.return_value.until.side_effect = TimeoutException()
    mocker.patch.object(mlb_affiliate, "extrair_link_afiliado", return_value=None)

    link = mlb_affiliate.gerar_link_afiliado(driver, wait, "http://prod/MLB1")

    assert link is None


# ---------------------------------------------------------------------------
# #10 — restart_driver encerra o driver antigo e devolve um novo
# ---------------------------------------------------------------------------

@pytest.mark.unit
def test_restart_driver_encerra_e_recria(mocker):
    old = mocker.MagicMock(name="old_driver")
    novo = mocker.MagicMock(name="novo_driver")
    create = mocker.patch.object(worker_main, "create_driver", return_value=novo)
    mocker.patch.object(worker_main, "WebDriverWait", return_value="wait_obj")

    driver, wait = worker_main.restart_driver(old)

    old.quit.assert_called_once()
    create.assert_called_once()
    assert driver is novo
    assert wait == "wait_obj"


@pytest.mark.unit
def test_restart_driver_ignora_erro_no_quit(mocker):
    old = mocker.MagicMock(name="old_driver")
    old.quit.side_effect = Exception("já morto")
    novo = mocker.MagicMock(name="novo_driver")
    mocker.patch.object(worker_main, "create_driver", return_value=novo)
    mocker.patch.object(worker_main, "WebDriverWait", return_value="wait_obj")

    driver, _ = worker_main.restart_driver(old)

    assert driver is novo  # erro no quit não derruba o restart


@pytest.mark.unit
def test_restart_every_configurado():
    assert worker_main.RESTART_DRIVER_EVERY > 0
