"""Garante que a página de produto usa rate limiter, backoff e detecção
de bloqueio unificada (ponto #3 da issue #52)."""
import pytest

from scrapper_mlb.product_page.service import update_service
from tests.factories import FakeResponseFactory, ProductPageDataFactory


@pytest.fixture
def patch_build(mocker):
    """Evita parsing/IO real do build_product_page."""
    return mocker.patch.object(
        update_service,
        "build_product_page",
        return_value=ProductPageDataFactory(),
    )


@pytest.mark.unit
def test_resposta_valida_usa_rate_limiter_e_success(mocker, patch_build):
    wait = mocker.patch.object(update_service.rate_limiter, "wait")
    success = mocker.patch.object(update_service.backoff, "success")
    error = mocker.patch.object(update_service.backoff, "error")
    mocker.patch.object(
        update_service.session, "get", return_value=FakeResponseFactory()
    )

    result = update_service._collect_once("http://x/MLB1#frag", produto_id=1)

    assert result is not None
    wait.assert_called_once()          # rate limiter aplicado antes do GET
    success.assert_called_once()       # backoff resetado na resposta válida
    error.assert_not_called()


@pytest.mark.unit
def test_pagina_de_bloqueio_dispara_backoff_error(mocker, patch_build):
    mocker.patch.object(update_service.rate_limiter, "wait")
    error = mocker.patch.object(update_service.backoff, "error")
    blocked = FakeResponseFactory(text="<html>resolva o CAPTCHA</html>")
    mocker.patch.object(update_service.session, "get", return_value=blocked)

    result = update_service._collect_once("http://x/MLB1", produto_id=1)

    assert result is None
    error.assert_called_once()
    patch_build.assert_not_called()    # nem tenta parsear página bloqueada


@pytest.mark.unit
def test_status_invalido_dispara_backoff_error(mocker, patch_build):
    mocker.patch.object(update_service.rate_limiter, "wait")
    error = mocker.patch.object(update_service.backoff, "error")
    mocker.patch.object(
        update_service.session,
        "get",
        return_value=FakeResponseFactory(status_code=503),
    )

    result = update_service._collect_once("http://x/MLB1", produto_id=1)

    assert result is None
    error.assert_called_once()


@pytest.mark.unit
def test_retry_usa_backoff_wait(mocker):
    # _collect_once sempre falha -> retry deve usar backoff.wait (não sleep fixo)
    mocker.patch.object(update_service, "_collect_once", return_value=None)
    backoff_wait = mocker.patch.object(update_service.backoff, "wait")

    result = update_service.collect_product_by_url("http://x", 1, retries=2)

    assert result is None
    assert backoff_wait.call_count == 2
