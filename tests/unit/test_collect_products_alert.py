"""Cobre o alerta de quebra de seletor/layout (ponto #2 da issue #52).

collect_products deve emitir alerta quando a maioria dos cards falha na
extração, em vez de engolir tudo silenciosamente no `except ValueError`.
"""
import pytest

from scrapper_mlb.services import product_service
from scrapper_mlb.services.product_service import FAIL_RATIO_ALERT
from tests.factories import ProductFactory


@pytest.fixture
def patch_pipeline(mocker):
    """Neutraliza fetch/parse; cada nó é só um sentinela inteiro."""
    mocker.patch.object(product_service, "fetch_html", return_value="<html>")
    mocker.patch.object(product_service, "parse_html", return_value=object())

    def _setup(n_nodes):
        nodes = list(range(n_nodes))
        mocker.patch.object(
            product_service, "find_product_nodes", return_value=nodes
        )
        return nodes

    return _setup


def _build_side_effect(falhas: int):
    """build_product: as `falhas` primeiras chamadas levantam ValueError."""
    estado = {"chamadas": 0}

    def _fake(item):
        estado["chamadas"] += 1
        if estado["chamadas"] <= falhas:
            raise ValueError("seletor quebrado")
        return ProductFactory()

    return _fake


@pytest.mark.unit
def test_alerta_quando_maioria_falha(mocker, capsys, patch_pipeline):
    patch_pipeline(10)
    mocker.patch.object(
        product_service, "build_product", side_effect=_build_side_effect(8)
    )

    produtos = product_service.collect_products("http://x")

    out = capsys.readouterr().out
    assert "🚨 ALERTA" in out
    assert "8/10" in out
    assert len(produtos) == 2


@pytest.mark.unit
def test_sem_alerta_quando_poucas_falhas(mocker, capsys, patch_pipeline):
    patch_pipeline(10)
    # 2/10 = 20% < 60%: cards patrocinados esparsos, sem alerta
    mocker.patch.object(
        product_service, "build_product", side_effect=_build_side_effect(2)
    )

    produtos = product_service.collect_products("http://x")

    out = capsys.readouterr().out
    assert "ALERTA" not in out
    assert len(produtos) == 8


@pytest.mark.unit
def test_limiar_no_threshold_exato(mocker, capsys, patch_pipeline):
    n = 10
    falhas = int(n * FAIL_RATIO_ALERT)  # 6/10 == 60% -> alerta (>=)
    patch_pipeline(n)
    mocker.patch.object(
        product_service, "build_product", side_effect=_build_side_effect(falhas)
    )

    product_service.collect_products("http://x")

    assert "ALERTA" in capsys.readouterr().out
