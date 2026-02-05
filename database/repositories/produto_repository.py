from typing import Iterable, Optional
from database.db import get_connection

from decimal import Decimal

def _normalize(value):
    if isinstance(value, Decimal):
        return float(value)
    return value

import sqlite3


class ProdutoRepository:
    def __init__(self):
        self.conn = sqlite3.connect("/app/data/promoly.db")
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON")

    # 🔎 retorna Row (id, card_hash, status)
    def get_by_external_id(self, external_id: str, plataforma_id: int):
        cursor = self.conn.execute(
            """
            SELECT id, card_hash, status
            FROM produtos
            WHERE external_id = ? AND plataforma_id = ?
            """,
            (external_id, plataforma_id),
        )
        return cursor.fetchone()

    # 🆕 cria ou atualiza produto
    def upsert(self, produto: dict) -> int:
        cursor = self.conn.cursor()

        cursor.execute(
            """
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
                status = excluded.status,
                card_hash = excluded.card_hash,
                updated_at = CURRENT_TIMESTAMP
            """,
            (
                produto["external_id"],
                produto["plataforma_id"],
                produto["titulo"],
                produto.get("descricao"),
                float(produto["preco"]) if produto.get("preco") is not None else None,
                float(produto["avaliacao"]) if produto.get("avaliacao") is not None else None,
                produto.get("vendas"),
                produto.get("imagem_url"),
                produto["link_original"],
                produto.get("status", "novo"),
                produto["card_hash"],
            ),
        )

        self.conn.commit()

        # 🔒 SEMPRE buscar o ID real (evita FK intermitente)
        cursor = self.conn.execute(
            """
            SELECT id
            FROM produtos
            WHERE external_id = ? AND plataforma_id = ?
            """,
            (produto["external_id"], produto["plataforma_id"]),
        )
        row = cursor.fetchone()
        assert row is not None, "Produto não encontrado após upsert"

        return row["id"]

    # 🔗 vínculo N:N produto ↔ categoria
    def link_categoria(self, produto_id: int, categoria_id: int):
        self.conn.execute(
            """
            INSERT OR IGNORE INTO produto_categoria (produto_id, categoria_id)
            VALUES (?, ?)
            """,
            (produto_id, categoria_id),
        )
        self.conn.commit()

    # 🔄 atualiza status quando produto aparece
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

    # 🧹 MARCAR PRODUTOS REMOVIDOS (🔥 AQUI ESTÁ O QUE VOCÊ PEDIU 🔥)
    def mark_removed(self, days: int = 7):
        """
        Marca como 'removido' produtos que não aparecem há X dias.
        """
        self.conn.execute(
            """
            UPDATE produtos
            SET status = 'removido'
            WHERE
                status != 'removido'
                AND updated_at < DATETIME('now', ?)
            """,
            (f"-{days} days",),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
