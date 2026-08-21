"""Slug do produto: a coluna é NOT NULL UNIQUE desde o schema base, mas o
upsert do repositório não a preenchia — num banco criado pelo caminho
documentado (bootstrap_schema + alembic + seed), o scraper extraía produto e
gravava zero.
"""

import pytest

from database.repositories.produto_repository import (
    SLUG_TITULO_MAX,
    build_slug,
    slug_base,
)

pytestmark = [pytest.mark.unit]


class TestSlugBase:
    def test_titulo_vira_slug_legivel(self):
        assert slug_base("Fone De Ouvido JBL Tune 520BT Preto Bluetooth 5.3") == (
            "fone-de-ouvido-jbl-tune-520bt-preto-bluetooth-5-3"
        )

    def test_acento_e_pontuacao_saem(self):
        assert slug_base("Cadeira Gamer — Ergonômica!") == "cadeira-gamer-ergonomica"

    def test_titulo_sem_caractere_aproveitavel_fica_vazio(self):
        assert slug_base("★★★") == ""
        assert slug_base("") == ""


class TestBuildSlug:
    def test_acrescenta_o_external_id_ao_titulo(self):
        slug = build_slug(
            "Fone De Ouvido JBL Tune 520BT Preto Bluetooth 5.3",
            "MLB27732102",
        )

        assert slug == "fone-de-ouvido-jbl-tune-520bt-preto-bluetooth-5-3-mlb27732102"

    def test_mesmo_titulo_em_anuncios_diferentes_nao_colide(self):
        titulo = "Fone Bluetooth"

        a = build_slug(titulo, "MLB111")
        b = build_slug(titulo, "MLB222")

        assert a != b

    def test_titulo_sem_caractere_aproveitavel_cai_no_external_id(self):
        assert build_slug("★★★", "MLB27732102") == "mlb27732102"
        assert build_slug("", "MLB27732102") == "mlb27732102"

    def test_trecho_do_titulo_respeita_o_teto(self):
        titulo = "palavra " * 40

        slug = build_slug(titulo, "MLB1")

        base = slug.rsplit("-mlb1", 1)[0]
        assert len(base) <= SLUG_TITULO_MAX

    def test_corta_em_palavra_inteira(self):
        # word_boundary=True: o corte não pode deixar palavra pela metade.
        slug = build_slug("abacaxi " * 20, "MLB1")

        assert "-abac-" not in slug
        assert not slug.rsplit("-mlb1", 1)[0].endswith("abac")

    def test_e_deterministico(self):
        args = ("Fone De Ouvido JBL", "MLB27732102")

        assert build_slug(*args) == build_slug(*args)
