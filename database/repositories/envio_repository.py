from typing import Optional, List
from datetime import datetime, timedelta

from database.db import get_connection


class EnvioRepository:
    def __init__(self):
        self.conn = get_connection()

    # -------------------------
    # CREATE
    # -------------------------
    def criar_envio(
        self,
        produto_id: int,
        grupo_id: int,
        plataforma_id: int,
        link_afiliado_id: Optional[int] = None,
        agendado_para: Optional[datetime] = None,
    ) -> int:
        cursor = self.conn.cursor()

        cursor.execute(
            """
            INSERT INTO envios (
                produto_id,
                grupo_id,
                plataforma_id,
                link_afiliado_id,
                status,
                agendado_para
            )
            VALUES (?, ?, ?, ?, 'pendente', ?)
            """,
            (
                produto_id,
                grupo_id,
                plataforma_id,
                link_afiliado_id,
                agendado_para,
            ),
        )

        self.conn.commit()
        return cursor.lastrowid

    # -------------------------
    # READ (FILA)
    # -------------------------
    def listar_envios_pendentes(self, limite: int = 10) -> List[dict]:
        """
        Retorna envios prontos para envio agora
        """
        cursor = self.conn.cursor()

        cursor.execute(
            """
            SELECT e.*
            FROM envios e
            JOIN grupos_whatsapp g ON g.id = e.grupo_id
            WHERE e.status = 'pendente'
              AND g.ativo = 1
              AND (
                  e.agendado_para IS NULL
                  OR e.agendado_para <= CURRENT_TIMESTAMP
              )
            ORDER BY e.created_at ASC
            LIMIT ?
            """,
            (limite,),
        )

        return [dict(row) for row in cursor.fetchall()]

    def ja_enviado_hoje(self, produto_id: int, grupo_id: int) -> bool:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT 1
            FROM envios
            WHERE produto_id = ?
              AND grupo_id = ?
              AND status = 'enviado'
              AND date(enviado_em) = date('now')
            LIMIT 1
            """,
            (produto_id, grupo_id),
        )
        return cursor.fetchone() is not None

    # -------------------------
    # UPDATE
    # -------------------------
    def marcar_enviado(self, envio_id: int):
        self.conn.execute(
            """
            UPDATE envios
            SET
                status = 'enviado',
                enviado_em = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (envio_id,),
        )
        self.conn.commit()

    def marcar_falha(self, envio_id: int, erro: Optional[str] = None):
        self.conn.execute(
            """
            UPDATE envios
            SET
                status = 'erro',
                tentativas = tentativas + 1,
                erro_mensagem = ?
            WHERE id = ?
            """,
            (erro, envio_id),
        )
        self.conn.commit()

    def reagendar(
        self,
        envio_id: int,
        minutos: int,
    ):
        nova_data = datetime.utcnow() + timedelta(minutes=minutos)

        self.conn.execute(
            """
            UPDATE envios
            SET
                agendado_para = ?,
                status = 'pendente'
            WHERE id = ?
            """,
            (nova_data, envio_id),
        )
        self.conn.commit()

    def invalidar(self, envio_id: int):
        self.conn.execute(
            """
            UPDATE envios
            SET status = 'cancelado'
            WHERE id = ?
            """,
            (envio_id,),
        )
        self.conn.commit()

    # -------------------------
    # DELETE (opcional)
    # -------------------------
    def delete(self, envio_id: int):
        self.conn.execute(
            "DELETE FROM envios WHERE id = ?", (envio_id,)
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
