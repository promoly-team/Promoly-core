from typing import Optional, List
from sqlalchemy import text
from database.db import get_connection


class LinkAfiliadoRepository:
    def __init__(self, conn=None):
        self.conn = conn or get_connection()

    # =========================
    # CREATE
    # =========================
    def create_or_get(
        self,
        produto_id: int,
        plataforma_id: int,
        url_original: str,
    ) -> int:
        self.conn.execute(
            text("""
                INSERT INTO links_afiliados (
                    produto_id,
                    plataforma_id,
                    url_original,
                    status,
                    tentativas
                )
                VALUES (
                    :produto_id,
                    :plataforma_id,
                    :url_original,
                    'pendente',
                    0
                )
                ON CONFLICT (produto_id, plataforma_id)
                DO NOTHING
            """),
            {
                "produto_id": produto_id,
                "plataforma_id": plataforma_id,
                "url_original": url_original,
            },
        )

        link_id = self.get_id(produto_id, plataforma_id)
        assert link_id is not None, "Falha ao criar ou localizar link_afiliado"

        return link_id

    # =========================
    # READ
    # =========================
    def get_id(self, produto_id: int, plataforma_id: int) -> Optional[int]:
        result = self.conn.execute(
            text("""
                SELECT id
                FROM links_afiliados
                WHERE produto_id = :produto_id
                  AND plataforma_id = :plataforma_id
            """),
            {
                "produto_id": produto_id,
                "plataforma_id": plataforma_id,
            },
        )

        row = result.first()
        return row[0] if row else None

    # =========================
    # FILA (LOCK SAFE)
    # =========================
    def fetch_for_processing(self, limite: int = 5) -> List[dict]:
        """
        Seleciona links pendentes e marca como processando
        de forma segura (evita corrida entre workers).
        """

        result = self.conn.execute(
            text("""
                WITH selecionados AS (
                    SELECT id
                    FROM links_afiliados
                    WHERE status = 'pendente'
                      AND tentativas < 3
                    ORDER BY created_at ASC
                    LIMIT :limite
                    FOR UPDATE SKIP LOCKED
                )
                UPDATE links_afiliados
                SET
                    status = 'processando',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id IN (SELECT id FROM selecionados)
                RETURNING *
            """),
            {
                "limite": limite,
            },
        )

        return [dict(row._mapping) for row in result.fetchall()]

    # =========================
    # UPDATE
    # =========================
    def marcar_sucesso(self, link_id: int, url_afiliada: str):
        self.conn.execute(
            text("""
                UPDATE links_afiliados
                SET
                    url_afiliada = :url_afiliada,
                    status = 'ok',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """),
            {
                "url_afiliada": url_afiliada,
                "id": link_id,
            },
        )

    def marcar_falha(self, link_id: int, erro: Optional[str] = None):
        self.conn.execute(
            text("""
                UPDATE links_afiliados
                SET
                    status = 'pendente',
                    tentativas = tentativas + 1,
                    last_error = :erro,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """),
            {
                "erro": erro,
                "id": link_id,
            },
        )

    def invalidar(self, link_id: int):
        self.conn.execute(
            text("""
                UPDATE links_afiliados
                SET
                    status = 'invalido',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """),
            {
                "id": link_id,
            },
        )

    def close(self):
        self.conn.close()
