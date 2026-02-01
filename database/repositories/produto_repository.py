from typing import Iterable, Optional
from database.db import get_connection

from decimal import Decimal

def _normalize(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


class ProdutoRepository:
    def __init__(self):
        self.conn = get_connection()

    # -------------------------
    # CREATE / UPSERT
    # -------------------------
    def upsert(self, produto: dict) -> int:
        """
        Insere ou atualiza um produto.
        Retorna o ID interno do produto.
        """

        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO produtos (
                external_id,
                plataforma_id,
                categoria_id,
                titulo,
                descricao,
                preco,
                avaliacao,
                vendas,
                imagem_url,
                link_original,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(external_id, plataforma_id)
            DO UPDATE SET
                titulo = excluded.titulo,
                descricao = excluded.descricao,
                preco = excluded.preco,
                avaliacao = excluded.avaliacao,
                vendas = excluded.vendas,
                imagem_url = excluded.imagem_url,
                link_original = excluded.link_original,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                produto["external_id"],
                produto["plataforma_id"],
                produto["categoria_id"],
                produto["titulo"],
                produto.get("descricao"),
                _normalize(produto.get("preco")),
                _normalize(produto.get("avaliacao")),
                produto.get("vendas"),
                produto.get("imagem_url"),
                produto["link_original"],
                produto.get("status", "novo"),
            ),
        )

        self.conn.commit()

        return cursor.lastrowid or self.get_id_by_external(
            produto["external_id"], produto["plataforma_id"]
        )

    def bulk_upsert(self, produtos: Iterable[dict]):
        for p in produtos:
            self.upsert(p)

    # -------------------------
    # READ
    # -------------------------
    def get_id_by_external(
        self, external_id: str, plataforma_id: int
    ) -> Optional[int]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT id
            FROM produtos
            WHERE external_id = ? AND plataforma_id = ?
            """,
            (external_id, plataforma_id),
        )
        row = cursor.fetchone()
        return row["id"] if row else None

    def get_by_status(self, status: str):
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM produtos
            WHERE status = ?
            ORDER BY created_at ASC
            """,
            (status,),
        )
        return cursor.fetchall()

    # -------------------------
    # UPDATE
    # -------------------------
    def update_status(self, produto_id: int, status: str):
        self.conn.execute(
            """
            UPDATE produtos
            SET status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (status, produto_id),
        )
        self.conn.commit()

    # -------------------------
    # DELETE
    # -------------------------
    def delete(self, produto_id: int):
        self.conn.execute(
            "DELETE FROM produtos WHERE id = ?", (produto_id,)
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
