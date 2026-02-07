from typing import Optional, List
from sqlalchemy import text
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
        self.conn.execute(
            text("""
                INSERT INTO plataformas (
                    nome,
                    slug,
                    dominio_principal,
                    suporta_afiliado,
                    tipo_afiliado
                )
                VALUES (
                    :nome,
                    :slug,
                    :dominio_principal,
                    :suporta_afiliado,
                    :tipo_afiliado
                )
                ON CONFLICT (slug) DO NOTHING
            """),
            {
                "nome": nome,
                "slug": slug,
                "dominio_principal": dominio_principal,
                "suporta_afiliado": suporta_afiliado,
                "tipo_afiliado": tipo_afiliado,
            },
        )

        plataforma = self.get_by_slug(slug)
        assert plataforma is not None, "Falha ao criar ou buscar plataforma"

        return plataforma["id"]

    # -------------------------
    # READ
    # -------------------------
    def get_by_slug(self, slug: str) -> Optional[dict]:
        result = self.conn.execute(
            text("""
                SELECT *
                FROM plataformas
                WHERE slug = :slug
            """),
            {"slug": slug},
        )
        return result.mappings().first()

    def get_by_id(self, plataforma_id: int) -> Optional[dict]:
        result = self.conn.execute(
            text("""
                SELECT *
                FROM plataformas
                WHERE id = :id
            """),
            {"id": plataforma_id},
        )
        return result.mappings().first()

    def list_all(self, somente_ativas: bool = True) -> List[dict]:
        if somente_ativas:
            result = self.conn.execute(
                text("""
                    SELECT *
                    FROM plataformas
                    WHERE ativa = true
                    ORDER BY nome
                """)
            )
        else:
            result = self.conn.execute(
                text("""
                    SELECT *
                    FROM plataformas
                    ORDER BY nome
                """)
            )

        return result.mappings().all()

    # -------------------------
    # UPDATE
    # -------------------------
    def desativar(self, plataforma_id: int):
        self.conn.execute(
            text("""
                UPDATE plataformas
                SET ativa = false
                WHERE id = :id
            """),
            {"id": plataforma_id},
        )

    def ativar(self, plataforma_id: int):
        self.conn.execute(
            text("""
                UPDATE plataformas
                SET ativa = true
                WHERE id = :id
            """),
            {"id": plataforma_id},
        )

    def close(self):
        self.conn.close()
