import pytest
from fastapi import HTTPException

import api.core.security as security

pytestmark = pytest.mark.unit


class TestRequireApiKey:
    def test_blocks_when_not_configured(self, monkeypatch):
        monkeypatch.setattr(security.settings, "API_KEY", "")
        with pytest.raises(HTTPException) as exc:
            security.require_api_key("anything")
        assert exc.value.status_code == 503

    def test_rejects_wrong_key(self, monkeypatch):
        monkeypatch.setattr(security.settings, "API_KEY", "secret")
        with pytest.raises(HTTPException) as exc:
            security.require_api_key("wrong")
        assert exc.value.status_code == 401

    def test_accepts_correct_key(self, monkeypatch):
        monkeypatch.setattr(security.settings, "API_KEY", "secret")
        assert security.require_api_key("secret") is None


class _FakeClient:
    def __init__(self, host):
        self.host = host


class _FakeRequest:
    def __init__(self, host="1.2.3.4"):
        self.client = _FakeClient(host)


class TestRateLimit:
    def setup_method(self):
        security._hits.clear()

    def test_allows_under_limit(self, monkeypatch):
        monkeypatch.setattr(security.settings, "REDIRECT_RATE_LIMIT", 3)
        monkeypatch.setattr(security.settings, "REDIRECT_RATE_WINDOW", 60)
        req = _FakeRequest()
        for _ in range(3):
            assert security.rate_limit_redirect(req) is None

    def test_blocks_over_limit(self, monkeypatch):
        monkeypatch.setattr(security.settings, "REDIRECT_RATE_LIMIT", 2)
        monkeypatch.setattr(security.settings, "REDIRECT_RATE_WINDOW", 60)
        req = _FakeRequest()
        security.rate_limit_redirect(req)
        security.rate_limit_redirect(req)
        with pytest.raises(HTTPException) as exc:
            security.rate_limit_redirect(req)
        assert exc.value.status_code == 429

    def test_separate_ips(self, monkeypatch):
        monkeypatch.setattr(security.settings, "REDIRECT_RATE_LIMIT", 1)
        monkeypatch.setattr(security.settings, "REDIRECT_RATE_WINDOW", 60)
        security.rate_limit_redirect(_FakeRequest("1.1.1.1"))
        # IP diferente não compartilha bucket
        assert security.rate_limit_redirect(_FakeRequest("2.2.2.2")) is None
