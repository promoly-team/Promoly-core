from typing import Optional
from decimal import Decimal
from slugify import slugify
from sqlalchemy import text
from sqlalchemy.sql import bindparam

# Teto do trecho vindo do título, para o slug não virar a frase inteira do
# anúncio. O front ainda concatena `-{produto_id}` na URL.
SLUG_TITULO_MAX = 80


def _normalize(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def slug_base(titulo: str) -> str:
    """Slug legível a partir do título, sem garantia de unicidade."""
    return slugify(titulo or "", max_length=SLUG_TITULO_MAX, word_boundary=True)


def build_slug(titulo: str, external_id: str) -> str:
    """Forma à prova de colisão: título + `external_id` (MLB…, único por
    plataforma).

    Usada quando o slug do título já pertence a outro anúncio — `produtos.slug`
    é UNIQUE, e sem desempate o segundo produto não entra. Título sem nenhum
    caractere aproveitável cai só no identificador.
    """
    base = slug_base(titulo)
    sufixo = slugify(external_id)

    return f"{base}-{sufixo}" if base else sufixo


class ProdutoRepository:
    def __init__(self, conn=None):
        self.conn = conn

    # 🔎 retorna {url_afiliada, plataforma_id}
    def get_active_affiliate_link(self, produto_id: int) -> Optional[dict]:
        result = self.conn.execute(
            text("""
                SELECT
                    la.url_afiliada,
                    la.plataforma_id
                FROM links_afiliados la
                JOIN produtos p ON p.id = la.produto_id
                WHERE la.produto_id = :produto_id
                  AND la.status = 'ok'
                  AND p.status = 'ativo'
                LIMIT 1
            """),
            {"produto_id": produto_id},
        )

        return result.mappings().first()

    # 🔎 retorna {id, card_hash, status}
    def get_by_external_id(self, external_id: str, plataforma_id: int) -> Optional[dict]:
        result = self.conn.execute(
            text("""
                SELECT id, card_hash, status
                FROM produtos
                WHERE external_id = :external_id
                  AND plataforma_id = :plataforma_id
                LIMIT 1
            """),
            {
                "external_id": external_id,
                "plataforma_id": plataforma_id,
            },
        )

        return result.mappings().first()

    # 🔤 slug do produto: o do título quando estiver livre, senão o desempate
    # pelo external_id. O valor é calculado em todo upsert, mas só é gravado
    # na inserção — no conflito o DO UPDATE não toca na coluna.
    def _resolve_slug(self, titulo: str, external_id: str, plataforma_id: int) -> str:
        base = slug_base(titulo)

        if not base:
            return build_slug(titulo, external_id)

        dono = self.conn.execute(
            text("""
                SELECT external_id, plataforma_id
                FROM produtos
                WHERE slug = :slug
                LIMIT 1
            """),
            {"slug": base},
        ).mappings().first()

        if dono is None or (
            dono["external_id"] == external_id
            and dono["plataforma_id"] == plataforma_id
        ):
            return base

        return build_slug(titulo, external_id)

    # 🆕 cria ou atualiza produto
    def upsert(self, produto: dict) -> int:
        self.conn.execute(
            text("""
                INSERT INTO produtos (
                    external_id,
                    plataforma_id,
                    titulo,
                    slug,
                    descricao,
                    preco,
                    avaliacao,
                    vendas,
                    imagem_url,
                    link_original,
                    status,
                    card_hash
                )
                VALUES (
                    :external_id,
                    :plataforma_id,
                    :titulo,
                    :slug,
                    :descricao,
                    :preco,
                    :avaliacao,
                    :vendas,
                    :imagem_url,
                    :link_original,
                    :status,
                    :card_hash
                )
                ON CONFLICT (external_id, plataforma_id)
                -- `slug` fica de fora de propósito: o anúncio muda de título
                -- com frequência no ML, e reescrever o slug quebraria a URL
                -- de /produto/[slug] que já está indexada e no sitemap.
                DO UPDATE SET
                    titulo = EXCLUDED.titulo,
                    descricao = EXCLUDED.descricao,
                    preco = EXCLUDED.preco,
                    avaliacao = EXCLUDED.avaliacao,
                    vendas = EXCLUDED.vendas,
                    imagem_url = EXCLUDED.imagem_url,
                    link_original = EXCLUDED.link_original,
                    status = EXCLUDED.status,
                    card_hash = EXCLUDED.card_hash,
                    updated_at = NOW()
            """),
            {
                "external_id": produto["external_id"],
                "plataforma_id": produto["plataforma_id"],
                "titulo": produto["titulo"],
                "slug": self._resolve_slug(
                    produto["titulo"],
                    produto["external_id"],
                    produto["plataforma_id"],
                ),
                "descricao": produto.get("descricao"),
                "preco": _normalize(produto.get("preco")),
                "avaliacao": _normalize(produto.get("avaliacao")),
                "vendas": produto.get("vendas"),
                "imagem_url": produto.get("imagem_url"),
                "link_original": produto["link_original"],
                "status": produto.get("status", "novo"),
                "card_hash": produto["card_hash"],
            },
        )

        result = self.conn.execute(
            text("""
                SELECT id
                FROM produtos
                WHERE external_id = :external_id
                  AND plataforma_id = :plataforma_id
            """),
            {
                "external_id": produto["external_id"],
                "plataforma_id": produto["plataforma_id"],
            },
        )

        row = result.mappings().first()
        assert row is not None, "Produto não encontrado após upsert"

        return row["id"]

    # 🔗 vínculo N:N produto ↔ categoria
    def link_categoria(self, produto_id: int, categoria_id: int):
        self.conn.execute(
            text("""
                INSERT INTO produto_categoria (produto_id, categoria_id)
                VALUES (:produto_id, :categoria_id)
                ON CONFLICT DO NOTHING
            """),
            {
                "produto_id": produto_id,
                "categoria_id": categoria_id,
            },
        )

    # 🔄 atualiza status
    def update_status(self, produto_id: int, status: str):
        self.conn.execute(
            text("""
                UPDATE produtos
                SET status = :status,
                    updated_at = NOW()
                WHERE id = :produto_id
            """),
            {
                "status": status,
                "produto_id": produto_id,
            },
        )

    # 🧹 marcar produtos removidos (CORRIGIDO)
    def mark_removed(self, days: int = 7):
        self.conn.execute(
            text("""
                UPDATE produtos
                SET status = 'removido'
                WHERE status != 'removido'
                  AND updated_at < NOW() - (:days * INTERVAL '1 day')
            """),
            {"days": days},
        )

    # 🔄 update leve usado pelo worker
    def update_price_and_rating(self, produto_id: int, preco, avaliacao):
        self.conn.execute(
            text("""
                UPDATE produtos
                SET preco = :preco,
                    avaliacao = :avaliacao,
                    updated_at = NOW()
                WHERE id = :produto_id
            """),
            {
                "produto_id": produto_id,
                "preco": _normalize(preco),
                "avaliacao": _normalize(avaliacao),
            },
        )

    # 🔁 usado pelo update worker
    def get_all_for_update(self):
        result = self.conn.execute(
            text("""
                SELECT id, titulo, link_original
                FROM produtos
                WHERE status = 'ativo'
            """)
        )

        return [dict(row._mapping) for row in result]

    def close(self):
        self.conn.close()

    def get_batch_for_update(self, limit: int = 300, hours: int = 6):
        result = self.conn.execute(
            text("""
                SELECT id, titulo, link_original
                FROM produtos
                WHERE status = 'ativo'
                AND updated_at < NOW() - (:hours * INTERVAL '1 hour')
                ORDER BY updated_at ASC
                LIMIT :limit
            """),
            {"limit": limit, "hours": hours},
        )

        return [dict(row._mapping) for row in result]


    def get_by_ids(self, ids: list[int]):
        if not ids:
            return []

        stmt = text("""
            SELECT id, titulo, link_original
            FROM produtos
            WHERE id IN :ids
        """).bindparams(bindparam("ids", expanding=True))

        result = self.conn.execute(stmt, {"ids": ids})

        return [dict(row._mapping) for row in result]
    

        # 🔎 retorna {id, titulo, link_original}
    def get_by_id(self, produto_id: int) -> Optional[dict]:
        result = self.conn.execute(
            text("""
                SELECT id, titulo, link_original
                FROM produtos
                WHERE id = :produto_id
                LIMIT 1
            """),
            {"produto_id": produto_id},
        )

        return result.mappings().first()

    # 🗑 marcar produto como removido pelo worker
    def mark_as_removed(self, produto_id: int):
        self.conn.execute(
            text("""
                UPDATE produtos
                SET status = 'removido',
                    updated_at = NOW()
                WHERE id = :produto_id
            """),
            {"produto_id": produto_id},
        )