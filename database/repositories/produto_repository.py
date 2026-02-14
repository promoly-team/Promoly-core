from typing import Optional
from decimal import Decimal
from sqlalchemy import text



def _normalize(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


class ProdutoRepository:
    def __init__(self, conn=None):
        self.conn = conn

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

    # 🆕 cria ou atualiza produto
    def upsert(self, produto: dict) -> int:
        self.conn.execute(
            text("""
                INSERT INTO produtos (
                    external_id,
                    plataforma_id,
                    titulo,
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
                    updated_at = CURRENT_TIMESTAMP
            """),
            {
                "external_id": produto["external_id"],
                "plataforma_id": produto["plataforma_id"],
                "titulo": produto["titulo"],
                "descricao": produto.get("descricao"),
                "preco": float(produto["preco"]) if produto.get("preco") is not None else None,
                "avaliacao": float(produto["avaliacao"]) if produto.get("avaliacao") is not None else None,
                "vendas": produto.get("vendas"),
                "imagem_url": produto.get("imagem_url"),
                "link_original": produto["link_original"],
                "status": produto.get("status", "novo"),
                "card_hash": produto["card_hash"],
            },
        )

        # 🔒 buscar ID real (evita FK intermitente)
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

    # 🔄 atualiza status quando produto aparece
    def update_status(self, produto_id: int, status: str):
        self.conn.execute(
            text("""
                UPDATE produtos
                SET status = :status,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :produto_id
            """),
            {
                "status": status,
                "produto_id": produto_id,
            },
        )

    # 🧹 marcar produtos removidos
    def mark_removed(self, days: int = 7):
        self.conn.execute(
            text("""
                UPDATE produtos
                SET status = 'removido'
                WHERE status != 'removido'
                  AND updated_at < (NOW() - INTERVAL ':days days')
            """).bindparams(days=days)
        )

    def close(self):
        self.conn.close()
