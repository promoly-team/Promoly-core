from typing import Optional, List
from database.db import get_connection


class PlataformaRepository:
    def __init__(self):
        self.conn = get_connection()

    # -------------------------
    # CREATE
    # -------------------------
    def create(
        self,
        nome: str,
        slug: str,
        dominio_principal: str,
        suporta_afiliado: bool = True,
        tipo_afiliado: Optional[str] = None,
    ) -> int:
        cursor = self.conn.cursor()

        cursor.execute(
            """
            INSERT OR IGNORE INTO plataformas (
                nome,
                slug,
                dominio_principal,
                suporta_afiliado,
                tipo_afiliado
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                nome,
                slug,
                dominio_principal,
                int(suporta_afiliado),
                tipo_afiliado,
            ),
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
            FROM plataformas
            WHERE slug = ?
            """,
            (slug,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def get_by_id(self, plataforma_id: int) -> Optional[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM plataformas
            WHERE id = ?
            """,
            (plataforma_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def list_all(self, somente_ativas: bool = True) -> List[dict]:
        cursor = self.conn.cursor()

        if somente_ativas:
            cursor.execute(
                """
                SELECT *
                FROM plataformas
                WHERE ativa = 1
                ORDER BY nome
                """
            )
        else:
            cursor.execute(
                """
                SELECT *
                FROM plataformas
                ORDER BY nome
                """
            )

        return [dict(row) for row in cursor.fetchall()]

    # -------------------------
    # UPDATE
    # -------------------------
    def desativar(self, plataforma_id: int):
        self.conn.execute(
            """
            UPDATE plataformas
            SET ativa = 0
            WHERE id = ?
            """,
            (plataforma_id,),
        )
        self.conn.commit()

    def ativar(self, plataforma_id: int):
        self.conn.execute(
            """
            UPDATE plataformas
            SET ativa = 1
            WHERE id = ?
            """,
            (plataforma_id,),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
