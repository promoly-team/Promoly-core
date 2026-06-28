"""
Helper de seed para os testes de API. Insere dados via SQL bruto
no mesmo schema usado pelos serviços.
"""

from sqlalchemy import text


class SeedHelper:
    def __init__(self, db):
        self.db = db

    def plataforma(self, nome="Mercado Livre", slug="mercado_livre"):
        return self.db.execute(
            text("""
                INSERT INTO plataformas (nome, slug, dominio_principal)
                VALUES (:nome, :slug, 'mercadolivre.com.br')
                RETURNING id
            """),
            {"nome": nome, "slug": slug},
        ).scalar()

    def categoria(self, nome="Eletrônicos", slug="eletronicos"):
        return self.db.execute(
            text("""
                INSERT INTO categorias (nome, slug)
                VALUES (:nome, :slug)
                RETURNING id
            """),
            {"nome": nome, "slug": slug},
        ).scalar()

    def subcategoria(self, categoria_id, nome="Fones", slug="fones"):
        return self.db.execute(
            text("""
                INSERT INTO subcategorias (nome, slug, categoria_id)
                VALUES (:nome, :slug, :categoria_id)
                RETURNING id
            """),
            {"nome": nome, "slug": slug, "categoria_id": categoria_id},
        ).scalar()

    def produto(
        self,
        plataforma_id,
        external_id="MLB1",
        titulo="Fone Bluetooth XYZ",
        slug="fone-bluetooth-xyz",
        preco=199.90,
        avaliacao=4.8,
        status="ativo",
        descricao="Fone top",
    ):
        return self.db.execute(
            text("""
                INSERT INTO produtos (
                    external_id, plataforma_id, titulo, slug,
                    descricao, preco, avaliacao, imagem_url,
                    link_original, status, updated_at
                )
                VALUES (
                    :external_id, :plataforma_id, :titulo, :slug,
                    :descricao, :preco, :avaliacao, 'https://img/x.webp',
                    'https://ml/MLB1', :status, NOW()
                )
                RETURNING id
            """),
            {
                "external_id": external_id,
                "plataforma_id": plataforma_id,
                "titulo": titulo,
                "slug": slug,
                "descricao": descricao,
                "preco": preco,
                "avaliacao": avaliacao,
                "status": status,
            },
        ).scalar()

    def link_afiliado(
        self, produto_id, plataforma_id, status="ok",
        url="https://mercadolivre.com/sec/abc",
    ):
        return self.db.execute(
            text("""
                INSERT INTO links_afiliados (
                    produto_id, plataforma_id, url_afiliada,
                    url_original, status
                )
                VALUES (:pid, :plat, :url, 'https://ml/MLB1', :status)
                RETURNING id
            """),
            {"pid": produto_id, "plat": plataforma_id, "url": url, "status": status},
        ).scalar()

    def vincula_categoria(self, produto_id, categoria_id):
        self.db.execute(
            text("""
                INSERT INTO produto_categoria (produto_id, categoria_id)
                VALUES (:pid, :cid)
            """),
            {"pid": produto_id, "cid": categoria_id},
        )

    def vincula_subcategoria(self, produto_id, subcategoria_id):
        self.db.execute(
            text("""
                INSERT INTO produto_subcategoria (produto_id, subcategoria_id)
                VALUES (:pid, :sid)
            """),
            {"pid": produto_id, "sid": subcategoria_id},
        )

    def preco(self, produto_id, valor, offset_min=0):
        """Insere ponto de histórico. offset_min recua o created_at."""
        self.db.execute(
            text("""
                INSERT INTO produto_preco_historico (produto_id, preco, created_at)
                VALUES (:pid, :preco, NOW() - make_interval(mins => :off))
            """),
            {"pid": produto_id, "preco": valor, "off": offset_min},
        )

    def pipeline_run(self, pipeline="scraper", status="ok"):
        self.db.execute(
            text("""
                INSERT INTO pipeline_runs (pipeline, status, started_at, finished_at)
                VALUES (:p, :s, NOW(), NOW())
            """),
            {"p": pipeline, "s": status},
        )

    def commit(self):
        self.db.commit()

    # -------------------------------------------------------------
    # Cenário pronto: produto ativo + link ok + 2 preços (queda)
    # -------------------------------------------------------------
    def produto_completo(
        self,
        external_id="MLB1",
        slug="fone-bluetooth-xyz",
        categoria_slug="eletronicos",
        precos=(250.0, 200.0),
    ):
        plat = self.plataforma()
        cat = self.categoria(slug=categoria_slug)
        prod = self.produto(plat, external_id=external_id, slug=slug, preco=precos[-1])
        self.link_afiliado(prod, plat)
        self.vincula_categoria(prod, cat)
        # precos[0] mais antigo, precos[-1] mais recente
        n = len(precos)
        for i, valor in enumerate(precos):
            self.preco(prod, valor, offset_min=(n - i) * 10)
        self.commit()
        return {"produto_id": prod, "plataforma_id": plat, "categoria_id": cat}
