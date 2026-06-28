"""
Testes de integração da API com PostgreSQL real.

Cada teste usa o fixture `client` (TestClient com get_db sobrescrito)
e o fixture `seed` para popular o banco.
"""

import pytest

pytestmark = [pytest.mark.integration, pytest.mark.api]


# =====================================================
# HEALTH
# =====================================================

class TestHealth:
    def test_empty(self, client):
        r = client.get("/health/")
        assert r.status_code == 200
        assert r.json() == []

    def test_with_runs(self, client, seed):
        seed.pipeline_run(pipeline="scraper", status="ok")
        seed.commit()
        r = client.get("/health/")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["pipeline"] == "scraper"
        assert body[0]["status"] == "ok"


# =====================================================
# OFFERS
# =====================================================

class TestOffers:
    def test_empty(self, client):
        r = client.get("/offers/")
        assert r.status_code == 200
        assert r.json() == []

    def test_lists_only_valid_links(self, client, seed):
        seed.produto_completo()
        # produto sem link ok não deve aparecer
        plat = seed.plataforma(slug="amazon")
        prod2 = seed.produto(plat, external_id="MLB2", slug="sem-link")
        seed.link_afiliado(prod2, plat, status="pendente")
        seed.commit()

        r = client.get("/offers/")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["url_afiliada"]


# =====================================================
# AFFILIATES
# =====================================================

class TestAffiliates:
    def test_found(self, client, seed):
        ctx = seed.produto_completo()
        r = client.get(f"/affiliates/{ctx['produto_id']}")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_not_found(self, client):
        r = client.get("/affiliates/999")
        assert r.status_code == 404


# =====================================================
# PRICES
# =====================================================

class TestPrices:
    def test_history(self, client, seed):
        ctx = seed.produto_completo(precos=(300.0, 250.0, 200.0))
        r = client.get(f"/prices/{ctx['produto_id']}")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 3
        # ordenado ascendente por created_at -> primeiro é o mais antigo (300)
        assert body[0]["preco"] == 300.0

    def test_batch(self, client, seed):
        ctx = seed.produto_completo()
        r = client.get(f"/prices?ids={ctx['produto_id']}")
        assert r.status_code == 200
        # batch retorna agrupado por id quando >1 id; com 1 id, lista simples
        assert isinstance(r.json(), list)

    def test_batch_missing_param(self, client):
        r = client.get("/prices")
        assert r.status_code == 200
        assert "error" in r.json()


# =====================================================
# PRODUCTS
# =====================================================

class TestProducts:
    def test_total(self, client, seed):
        seed.produto_completo()
        r = client.get("/products/total")
        assert r.status_code == 200
        assert r.json()["total"] == 1

    def test_total_with_category(self, client, seed):
        seed.produto_completo(categoria_slug="eletronicos")
        r = client.get("/products/total?category=eletronicos")
        assert r.json()["total"] == 1
        r2 = client.get("/products/total?category=inexistente")
        assert r2.json()["total"] == 0

    def test_list(self, client, seed):
        seed.produto_completo()
        r = client.get("/products")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["preco_atual"] == 200.0
        assert body[0]["preco_anterior"] == 250.0
        assert body[0]["desconto_pct"] == 20.0

    def test_list_search(self, client, seed):
        seed.produto_completo()
        assert len(client.get("/products?search=fone").json()) == 1
        assert len(client.get("/products?search=geladeira").json()) == 0

    def test_list_order_preco(self, client, seed):
        seed.produto_completo()
        r = client.get("/products?order=preco")
        assert r.status_code == 200

    def test_detail(self, client, seed):
        ctx = seed.produto_completo()
        r = client.get(f"/products/{ctx['produto_id']}")
        assert r.status_code == 200
        body = r.json()
        assert body["produto"]["produto_id"] == ctx["produto_id"]
        assert "Eletrônicos" in body["produto"]["categorias"]

    def test_detail_not_found(self, client):
        assert client.get("/products/999").status_code == 404

    def test_by_slug(self, client, seed):
        seed.produto_completo(slug="fone-top")
        r = client.get("/products/slug/fone-top")
        assert r.status_code == 200
        assert r.json()["produto"]["slug"] == "fone-top"

    def test_by_slug_not_found(self, client):
        assert client.get("/products/slug/nada").status_code == 404

    def test_sitemap(self, client, seed):
        seed.produto_completo()
        r = client.get("/products/sitemap")
        assert r.status_code == 200
        assert len(r.json()) == 1

    def test_with_metrics(self, client, seed):
        seed.produto_completo(precos=(300.0, 200.0))
        r = client.get("/products/with-metrics")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["current_price"] == 200.0


# =====================================================
# DEALS
# =====================================================

class TestDeals:
    def test_deals(self, client, seed):
        seed.produto_completo(precos=(250.0, 200.0))
        r = client.get("/deals/")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["desconto_pct"] == 20.0

    def test_deals_category_filter(self, client, seed):
        seed.produto_completo(categoria_slug="casa")
        assert len(client.get("/deals/?categoria=casa").json()) == 1
        assert len(client.get("/deals/?categoria=pet").json()) == 0

    def test_all_time_low(self, client, seed):
        # menor preço = preço atual
        seed.produto_completo(precos=(300.0, 250.0, 200.0))
        r = client.get("/deals/all-time-low")
        assert r.status_code == 200
        body = r.json()
        assert len(body) == 1
        assert body[0]["current_price"] == 200.0
        assert body[0]["min_price"] == 200.0


# =====================================================
# REDIRECT
# =====================================================

class TestRedirect:
    def test_redirect(self, client, seed):
        ctx = seed.produto_completo()
        r = client.get(
            f"/redirect/{ctx['produto_id']}", follow_redirects=False
        )
        assert r.status_code == 302
        assert str(ctx["produto_id"]) in r.headers["location"]

    def test_redirect_registers_click(self, client, seed, db_session):
        from sqlalchemy import text
        ctx = seed.produto_completo()
        client.get(f"/redirect/{ctx['produto_id']}", follow_redirects=False)
        count = db_session.execute(
            text("SELECT COUNT(*) FROM clicks WHERE produto_id = :p"),
            {"p": ctx["produto_id"]},
        ).scalar()
        assert count == 1

    def test_redirect_not_found(self, client):
        r = client.get("/redirect/999", follow_redirects=False)
        assert r.status_code == 404


# =====================================================
# TWITTER (rotas protegidas por API key)
# =====================================================

class TestTwitterAuth:
    def test_blocked_without_key(self, client, monkeypatch):
        import api.core.security as security
        monkeypatch.setattr(security.settings, "API_KEY", "secret")
        r = client.get("/twitter/price-drop")
        assert r.status_code == 401

    def test_allowed_with_key(self, client, seed, monkeypatch):
        import api.core.security as security
        monkeypatch.setattr(security.settings, "API_KEY", "secret")
        seed.produto_completo(categoria_slug="eletronicos")
        r = client.get(
            "/twitter/price-drop", headers={"X-API-Key": "secret"}
        )
        assert r.status_code == 200
        assert "tweet" in r.json()

    def test_503_when_key_unset(self, client, monkeypatch):
        import api.core.security as security
        monkeypatch.setattr(security.settings, "API_KEY", "")
        r = client.get("/twitter/all-time-low")
        assert r.status_code == 503
