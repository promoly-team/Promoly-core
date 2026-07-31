"""Cobre o hardening da camada de listagem: rotação de User-Agent (#5),
debug sem corrida entre threads (#4) e page size configurável (#6)."""
import importlib

import pytest

from scrapper_mlb import config
from scrapper_mlb import http_client
from scrapper_mlb.services import url_builder


# ---------------------------------------------------------------------------
# #5 — rotação de User-Agent
# ---------------------------------------------------------------------------

@pytest.mark.unit
def test_build_headers_usa_ua_do_pool():
    headers = config.build_headers()
    assert headers["User-Agent"] in config.USER_AGENTS
    # mantém os headers base
    assert headers["Accept-Language"].startswith("pt-BR")


@pytest.mark.unit
def test_build_headers_rotaciona(mocker):
    # força UAs distintos em chamadas consecutivas
    mocker.patch.object(
        config.random, "choice", side_effect=[config.USER_AGENTS[0], config.USER_AGENTS[1]]
    )
    a = config.build_headers()["User-Agent"]
    b = config.build_headers()["User-Agent"]
    assert a != b


# ---------------------------------------------------------------------------
# #4 — debug não escreve por padrão e usa arquivo único por URL
# ---------------------------------------------------------------------------

@pytest.mark.unit
def test_save_debug_desabilitado_por_padrao(mocker, tmp_path):
    mocker.patch.object(http_client, "DEBUG_ENABLED", False)
    mocker.patch.object(http_client, "DEBUG_DIR", tmp_path)

    http_client._save_debug("http://x/MLB1", "<html>")

    assert list(tmp_path.glob("*.html")) == []  # nada escrito quando desabilitado


@pytest.mark.unit
def test_save_debug_arquivo_unico_por_url(mocker, tmp_path):
    mocker.patch.object(http_client, "DEBUG_ENABLED", True)
    mocker.patch.object(http_client, "DEBUG_DIR", tmp_path)

    http_client._save_debug("http://x/MLB1", "<html>1</html>")
    http_client._save_debug("http://x/MLB2", "<html>2</html>")

    arquivos = list(tmp_path.glob("*.html"))
    assert len(arquivos) == 2  # URLs diferentes -> arquivos diferentes


# ---------------------------------------------------------------------------
# #6 — page size configurável
# ---------------------------------------------------------------------------

@pytest.mark.unit
def test_offset_usa_page_size_default(monkeypatch):
    monkeypatch.setenv("URL_MLB_SEARCH_BASE", "http://ml")
    importlib.reload(url_builder)
    url = url_builder.build_search_url("notebook", page=3)
    # (3-1)*48 + 1 = 97
    assert "_Desde_97" in url


@pytest.mark.unit
def test_offset_respeita_env_page_size(monkeypatch):
    monkeypatch.setenv("URL_MLB_SEARCH_BASE", "http://ml")
    monkeypatch.setenv("ML_PAGE_SIZE", "50")
    importlib.reload(url_builder)
    url = url_builder.build_search_url("notebook", page=2)
    # (2-1)*50 + 1 = 51
    assert "_Desde_51" in url
    monkeypatch.delenv("ML_PAGE_SIZE", raising=False)
    importlib.reload(url_builder)
