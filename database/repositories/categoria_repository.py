from typing import Optional, List
from database.db import get_connection


class CategoriaRepository:
    def __init__(self):
        self.conn = get_connection()

    # -------------------------
    # CREATE
    # -------------------------
    def create(self, nome: str, slug: str) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT OR IGNORE INTO categorias (nome, slug)
            VALUES (?, ?)
            """,
            (nome, slug),
        )
        self.conn.commit()

        return self.get_by_slug(slug)["id"]

    # -------------------------
    # READ
    # -------------------------
    def get_by_slug(self, slug: str) -> Optional[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM categorias
            WHERE slug = ?
            """,
            (slug,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def get_by_id(self, categoria_id: int) -> Optional[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM categorias
            WHERE id = ?
            """,
            (categoria_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def list_all(self, somente_ativas: bool = True) -> List[dict]:
        cursor = self.conn.cursor()

        if somente_ativas:
            cursor.execute(
                """
                SELECT *
                FROM categorias
                WHERE ativa = 1
                ORDER BY nome
                """
            )
        else:
            cursor.execute(
                """
                SELECT *
                FROM categorias
                ORDER BY nome
                """
            )

        return [dict(row) for row in cursor.fetchall()]

    # -------------------------
    # UPDATE
    # -------------------------
    def desativar(self, categoria_id: int):
        self.conn.execute(
            """
            UPDATE categorias
            SET ativa = 0
            WHERE id = ?
            """,
            (categoria_id,),
        )
        self.conn.commit()

    def ativar(self, categoria_id: int):
        self.conn.execute(
            """
            UPDATE categorias
            SET ativa = 1
            WHERE id = ?
            """,
            (categoria_id,),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
