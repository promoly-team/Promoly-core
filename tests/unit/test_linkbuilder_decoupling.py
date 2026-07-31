"""
Testes de desacoplamento do worker de afiliado em relação à UI PT-BR
do linkbuilder do Mercado Livre.

Cobre:
(a) seletores configuráveis por env var são usados;
(b) fallback de múltiplos textos do botão "Gerar";
(c) retorno do link quando extrair_link_afiliado devolve um link;
(d) comportamento quando o botão "Gerar" não é encontrado.
"""

import importlib

import pytest
from unittest.mock import MagicMock

import affiliate.mlb_affiliate as mlb


@pytest.fixture
def driver():
    """Driver Selenium mockado."""
    drv = MagicMock(name="driver")
    drv.page_source = "<html>conteúdo</html>"
    return drv


@pytest.fixture
def wait():
    """WebDriverWait mockado; .until() devolve um elemento mockado."""
    w = MagicMock(name="wait")
    w.until.return_value = MagicMock(name="elemento")
    return w


@pytest.fixture(autouse=True)
def _no_sleep(mocker):
    """Evita esperas reais durante os testes."""
    mocker.patch.object(mlb.time, "sleep")


def _recarrega_modulo():
    """Recarrega o módulo para reavaliar as constantes lidas de env."""
    return importlib.reload(mlb)


# ---------------------------------------------------------------------------
# (a) Seletores configuráveis por env var
# ---------------------------------------------------------------------------

def test_textarea_id_configuravel_por_env(monkeypatch, driver, wait, mocker):
    monkeypatch.setenv("LINKBUILDER_TEXTAREA_ID", "campo-custom")
    mod = _recarrega_modulo()
    mocker.patch.object(mod, "extrair_link_afiliado", return_value=None)
    # espiona o construtor de condição para inspecionar os locators usados
    spy = mocker.spy(mod.EC, "presence_of_element_located")

    assert mod.LINKBUILDER_TEXTAREA_ID == "campo-custom"

    mod.gerar_link_afiliado(driver, wait, "https://produto")

    # primeira condição deve localizar o textarea pelo ID custom
    primeiro_locator = spy.call_args_list[0].args[0]
    assert primeiro_locator[1] == "campo-custom"

    monkeypatch.delenv("LINKBUILDER_TEXTAREA_ID")
    _recarrega_modulo()


def test_gerar_texts_configuravel_por_env(monkeypatch):
    monkeypatch.setenv("LINKBUILDER_GERAR_TEXTS", "Gerar, Generate ,Generar")
    mod = _recarrega_modulo()

    assert mod.LINKBUILDER_GERAR_TEXTS == ["Gerar", "Generate", "Generar"]

    monkeypatch.delenv("LINKBUILDER_GERAR_TEXTS")
    _recarrega_modulo()


# ---------------------------------------------------------------------------
# (b) Fallback de múltiplos textos do botão
# ---------------------------------------------------------------------------

def test_xpath_botao_cobre_multiplos_idiomas():
    mod = _recarrega_modulo()
    xpath = mod._xpath_botao_gerar(["Gerar", "Generate"])
    assert "normalize-space()='Gerar'" in xpath
    assert "normalize-space()='Generate'" in xpath
    assert " or " in xpath


def test_botao_gerar_usa_xpath_com_textos_configurados(
    monkeypatch, driver, wait, mocker
):
    monkeypatch.setenv("LINKBUILDER_GERAR_TEXTS", "Gerar,Generate")
    mod = _recarrega_modulo()
    mocker.patch.object(mod, "extrair_link_afiliado", return_value=None)
    spy = mocker.spy(mod.EC, "presence_of_element_located")

    mod.gerar_link_afiliado(driver, wait, "https://produto")

    # segunda condição localiza o botão "Gerar" via XPath multilíngue
    locator = spy.call_args_list[1].args[0]
    assert locator[0].lower() == "xpath"
    assert "Gerar" in locator[1]
    assert "Generate" in locator[1]

    monkeypatch.delenv("LINKBUILDER_GERAR_TEXTS")
    _recarrega_modulo()


# ---------------------------------------------------------------------------
# (c) Retorno do link
# ---------------------------------------------------------------------------

def test_retorna_link_quando_extrator_devolve_link(driver, wait, mocker):
    mod = _recarrega_modulo()
    mocker.patch.object(
        mod, "extrair_link_afiliado", return_value="https://mercadolivre.com/sec/abc"
    )

    link = mod.gerar_link_afiliado(driver, wait, "https://produto")

    assert link == "https://mercadolivre.com/sec/abc"


def test_retorna_none_quando_extrator_devolve_none(driver, wait, mocker):
    mod = _recarrega_modulo()
    mocker.patch.object(mod, "extrair_link_afiliado", return_value=None)

    link = mod.gerar_link_afiliado(driver, wait, "https://produto")

    assert link is None


# ---------------------------------------------------------------------------
# (d) Botão não encontrado
# ---------------------------------------------------------------------------

def test_erro_claro_quando_botao_nao_encontrado(driver, mocker):
    mod = _recarrega_modulo()
    mocker.patch.object(mod, "extrair_link_afiliado", return_value=None)

    wait = MagicMock(name="wait")
    elemento_textarea = MagicMock(name="textarea")

    # primeira chamada (.until p/ textarea) ok; segunda (.until p/ botão) falha
    wait.until.side_effect = [elemento_textarea, Exception("timeout")]

    with pytest.raises(RuntimeError) as exc:
        mod.gerar_link_afiliado(driver, wait, "https://produto")

    assert "Gerar" in str(exc.value)


def test_erro_quando_lista_de_textos_vazia(monkeypatch, driver, wait, mocker):
    monkeypatch.setenv("LINKBUILDER_GERAR_TEXTS", " , ")
    mod = _recarrega_modulo()
    mocker.patch.object(mod, "extrair_link_afiliado", return_value=None)

    assert mod.LINKBUILDER_GERAR_TEXTS == []

    with pytest.raises(ValueError):
        mod.gerar_link_afiliado(driver, wait, "https://produto")

    monkeypatch.delenv("LINKBUILDER_GERAR_TEXTS")
    _recarrega_modulo()
