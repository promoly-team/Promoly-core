"""Upsert do ProdutoRepository contra o Postgres de teste.

O caso que motivou: `produtos.slug` é NOT NULL UNIQUE no schema base e o
INSERT não mandava a coluna, então todo produto vindo do scraper morria em
NotNullViolation — 42 extraídos, 0 gravados.
"""

import pytest
from sqlalchemy import text

from database.repositories.produto_repository import ProdutoRepository

pytestmark = [pytest.mark.integration, pytest.mark.api]


def _produto(plataforma_id, **over):
    base = {
        "external_id": "MLB27732102",
        "plataforma_id": plataforma_id,
        "titulo": "Fone De Ouvido JBL Tune 520BT Preto",
        "descricao": None,
        "preco": 399.51,
        "avaliacao": 4.9,
        "vendas": 10,
        "imagem_url": "https://http2.mlstatic.com/D_Q_NP_2X_692556.webp",
        "link_original": "https://www.mercadolivre.com.br/fone-jbl-tune-520bt",
        "status": "novo",
        "card_hash": "a8be5aa0",
    }
    base.update(over)
    return base


class TestUpsertSlug:
    def test_insere_produto_do_scraper(self, db_session, seed):
        plat = seed.plataforma()
        repo = ProdutoRepository(conn=db_session)

        produto_id = repo.upsert(_produto(plat))

        slug = db_session.execute(
            text("SELECT slug FROM produtos WHERE id = :id"),
            {"id": produto_id},
        ).scalar()
        assert slug == "fone-de-ouvido-jbl-tune-520bt-preto"

    def test_titulos_iguais_em_anuncios_diferentes_entram_os_dois(
        self, db_session, seed
    ):
        # `produtos.slug` é UNIQUE: sem desempate, o segundo anúncio de mesmo
        # título não entraria.
        plat = seed.plataforma()
        repo = ProdutoRepository(conn=db_session)

        primeiro = repo.upsert(_produto(plat, external_id="MLB111"))
        segundo = repo.upsert(_produto(plat, external_id="MLB222"))

        assert primeiro != segundo

        slugs = db_session.execute(
            text("SELECT slug FROM produtos ORDER BY id")
        ).scalars().all()
        assert slugs == [
            "fone-de-ouvido-jbl-tune-520bt-preto",
            "fone-de-ouvido-jbl-tune-520bt-preto-mlb222",
        ]

    def test_reprocessar_nao_muda_o_slug(self, db_session, seed):
        # A URL /produto/[slug] já está no sitemap: reescrever o slug quando o
        # anúncio troca de título quebraria o link indexado.
        plat = seed.plataforma()
        repo = ProdutoRepository(conn=db_session)

        produto_id = repo.upsert(_produto(plat))
        repo.upsert(
            _produto(
                plat,
                titulo="Fone JBL Tune 520BT PROMOÇÃO RELÂMPAGO",
                preco=349.90,
            )
        )

        row = db_session.execute(
            text("SELECT slug, titulo, preco FROM produtos WHERE id = :id"),
            {"id": produto_id},
        ).mappings().first()

        assert row["slug"] == "fone-de-ouvido-jbl-tune-520bt-preto"
        assert row["titulo"] == "Fone JBL Tune 520BT PROMOÇÃO RELÂMPAGO"
        assert row["preco"] == 349.90

    def test_produto_gravado_aparece_na_rota_por_slug(self, client, seed, db_session):
        plat = seed.plataforma()
        repo = ProdutoRepository(conn=db_session)
        produto_id = repo.upsert(_produto(plat, status="ativo"))
        # A view `produtos_publicos` exige link de afiliado ok — sem ele o
        # produto existe mas não é público, e a rota devolve 404.
        seed.link_afiliado(produto_id, plat)
        db_session.commit()

        r = client.get("/products/slug/fone-de-ouvido-jbl-tune-520bt-preto")

        assert r.status_code == 200
        assert r.json()["produto"]["titulo"] == "Fone De Ouvido JBL Tune 520BT Preto"
