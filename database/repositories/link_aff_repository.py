from typing import Optional, List
from database.db import get_connection


class LinkAfiliadoRepository:
    def __init__(self):
        self.conn = get_connection()

    # -------------------------
    # CREATE / UPSERT
    # -------------------------
    def create_or_get(
        self,
        produto_id: int,
        plataforma_id: int,
        url_original: str,
    ) -> int:
        """
        Cria um registro pendente se não existir.
        Retorna o ID do link_afiliado.
        """
        cursor = self.conn.cursor()

        cursor.execute(
            """
            INSERT OR IGNORE INTO links_afiliados (
                produto_id,
                plataforma_id,
                url_original,
                status
            )
            VALUES (?, ?, ?, 'pendente')
            """,
            (produto_id, plataforma_id, url_original),
        )

        self.conn.commit()

        return self.get_id(produto_id, plataforma_id)

    # -------------------------
    # READ
    # -------------------------
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

    def get(self, link_id: int) -> Optional[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM links_afiliados
            WHERE id = ?
            """,
            (link_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def list_pendentes(self, limite: int = 10) -> List[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM links_afiliados
            WHERE status = 'pendente'
              AND tentativas < 5
            ORDER BY created_at ASC
            LIMIT ?
            """,
            (limite,),
        )
        return [dict(row) for row in cursor.fetchall()]

    # -------------------------
    # UPDATE
    # -------------------------
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
                status = 'erro',
                tentativas = tentativas + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (link_id,),
        )
        self.conn.commit()

    def invalidar(self, link_id: int):
        """
        Marca definitivamente como inválido (não tentar mais)
        """
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

    # -------------------------
    # DELETE (opcional)
    # -------------------------
    def delete(self, link_id: int):
        self.conn.execute(
            "DELETE FROM links_afiliados WHERE id = ?", (link_id,)
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
