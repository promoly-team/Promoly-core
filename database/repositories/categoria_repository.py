from sqlalchemy import text
from database.db import get_connection
from typing import Optional, List


class CategoriaRepository:
    def __init__(self):
        self.conn = get_connection()

    def create(self, nome: str, slug: str) -> int:
        self.conn.execute(
            text("""
                INSERT INTO categorias (nome, slug)
                VALUES (:nome, :slug)
                ON CONFLICT (slug) DO NOTHING
            """),
            {"nome": nome, "slug": slug}
        )

        row = self.conn.execute(
            text("""
                SELECT id FROM categorias WHERE slug = :slug
            """),
            {"slug": slug}
        ).fetchone()

        return row.id

    def get_by_slug(self, slug: str) -> Optional[dict]:
        row = self.conn.execute(
            text("""
                SELECT * FROM categorias WHERE slug = :slug
            """),
            {"slug": slug}
        ).mappings().first()

        return row

    def list_all(self, somente_ativas: bool = True) -> List[dict]:
        if somente_ativas:
            result = self.conn.execute(
                text("""
                    SELECT * FROM categorias
                    WHERE ativa = true
                    ORDER BY nome
                """)
            )
        else:
            result = self.conn.execute(
                text("""
                    SELECT * FROM categorias
                    ORDER BY nome
                """)
            )

        return result.mappings().all()

    def desativar(self, categoria_id: int):
        self.conn.execute(
            text("""
                UPDATE categorias SET ativa = false WHERE id = :id
            """),
            {"id": categoria_id}
        )

    def ativar(self, categoria_id: int):
        self.conn.execute(
            text("""
                UPDATE categorias SET ativa = true WHERE id = :id
            """),
            {"id": categoria_id}
        )

    def close(self):
        self.conn.close()
