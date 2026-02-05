from typing import Optional, List
from database.db import get_connection


class LinkAfiliadoRepository:
    def __init__(self):
        self.conn = get_connection()

    # =========================
    # CREATE
    # =========================
    def create_or_get(
        self,
        produto_id: int,
        plataforma_id: int,
        url_original: str,
    ) -> int:
        cursor = self.conn.cursor()

        cursor.execute(
            """
            INSERT OR IGNORE INTO links_afiliados (
                produto_id,
                plataforma_id,
                url_original,
                status,
                tentativas
            )
            VALUES (?, ?, ?, 'pendente', 0)
            """,
            (produto_id, plataforma_id, url_original),
        )

        self.conn.commit()

        return self.get_id(produto_id, plataforma_id)

    # =========================
    # READ (FILA)
    # =========================
    def get_id(self, produto_id: int, plataforma_id: int) -> Optional[int]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT id
            FROM links_afiliados
            WHERE produto_id = ? AND plataforma_id = ?
            """,
            (produto_id, plataforma_id),
        )
        row = cursor.fetchone()
        return row["id"] if row else None

    def fetch_for_processing(self, limite: int = 5) -> List[dict]:
        cursor = self.conn.cursor()

        # marca como processando e captura os ids escolhidos
        cursor.execute(
            """
            UPDATE links_afiliados
            SET status = 'processando'
            WHERE id IN (
                SELECT id
                FROM links_afiliados
                WHERE status = 'pendente'
                AND tentativas < 3
                ORDER BY created_at ASC
                LIMIT ?
            )
            """,
            (limite,),
        )

        self.conn.commit()

        # agora busca os que foram marcados
        cursor.execute(
            """
            SELECT *
            FROM links_afiliados
            WHERE status = 'processando'
            ORDER BY updated_at ASC
            LIMIT ?
            """,
            (limite,),
        )

        return [dict(row) for row in cursor.fetchall()]



    # =========================
    # UPDATE
    # =========================
    def marcar_sucesso(self, link_id: int, url_afiliada: str):
        self.conn.execute(
            """
            UPDATE links_afiliados
            SET
                url_afiliada = ?,
                status = 'ok',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (url_afiliada, link_id),
        )
        self.conn.commit()


    def marcar_falha(self, link_id: int, erro: Optional[str] = None):
        self.conn.execute(
            """
            UPDATE links_afiliados
            SET
                status = 'pendente',
                tentativas = tentativas + 1,
                last_error = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (erro, link_id),
        )
        self.conn.commit()

    def invalidar(self, link_id: int):
        self.conn.execute(
            """
            UPDATE links_afiliados
            SET
                status = 'invalido',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (link_id,),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
