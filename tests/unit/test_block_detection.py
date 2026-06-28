import pytest

from scrapper_mlb.block_detection import is_blocked


@pytest.mark.unit
@pytest.mark.parametrize(
    "html",
    [
        "<html>Please solve the CAPTCHA</html>",
        "<html>verify you are human</html>",
        "<html>Access Denied</html>",
        "<html>unusual traffic detected</html>",
        "<div class='suspicious_traffic'></div>",
        "<header class='account-verification-header'></header>",
        "<button class='new-user-button'>x</button>",
        "<p>Olá! Para continuar, acesse sua conta</p>",
    ],
)
def test_is_blocked_detecta_markers(html):
    assert is_blocked(html) is True


@pytest.mark.unit
def test_is_blocked_case_insensitive():
    assert is_blocked("ACCOUNT-VERIFICATION") is True


@pytest.mark.unit
@pytest.mark.parametrize(
    "html",
    [
        "<html><body>ui-search-layout__item produto normal</body></html>",
        "<div class='andes-money-amount__fraction'>199</div>",
        "",
    ],
)
def test_is_blocked_pagina_normal(html):
    assert is_blocked(html) is False
