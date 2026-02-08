from typing import Optional, List
from datetime import datetime, timedelta

from sqlalchemy import text



class EnvioRepository:
    def __init__(self, conn=None):
        self.conn = conn

    # =========================
    # CREATE
    # =========================
    def criar_envio(
        self,
        produto_id: int,
        grupo_id: int,
        plataforma_id: int,
        link_afiliado_id: Optional[int] = None,
        agendado_para: Optional[datetime] = None,
    ) -> int:
        result = self.conn.execute(
            text("""
                INSERT INTO envios (
                    produto_id,
                    grupo_id,
                    plataforma_id,
                    link_afiliado_id,
                    status,
                    agendado_para
                )
                VALUES (
                    :produto_id,
                    :grupo_id,
                    :plataforma_id,
                    :link_afiliado_id,
                    'pendente',
                    :agendado_para
                )
                RETURNING id
            """),
            {
                "produto_id": produto_id,
                "grupo_id": grupo_id,
                "plataforma_id": plataforma_id,
                "link_afiliado_id": link_afiliado_id,
                "agendado_para": agendado_para,
            },
        )

        return result.scalar_one()

    # =========================
    # READ (FILA SEGURA)
    # =========================
    def listar_envios_pendentes(self, limite: int = 10) -> List[dict]:
        """
        Retorna envios prontos para envio agora
        (lock-safe para múltiplos workers)
        """

        result = self.conn.execute(
            text("""
                WITH selecionados AS (
                    SELECT e.id
                    FROM envios e
                    JOIN grupos_whatsapp g ON g.id = e.grupo_id
                    WHERE e.status = 'pendente'
                      AND g.ativo = true
                      AND (
                          e.agendado_para IS NULL
                          OR e.agendado_para <= CURRENT_TIMESTAMP
                      )
                    ORDER BY e.created_at ASC
                    LIMIT :limite
                    FOR UPDATE SKIP LOCKED
                )
                UPDATE envios
                SET status = 'processando'
                WHERE id IN (SELECT id FROM selecionados)
                RETURNING *
            """),
            {"limite": limite},
        )

        return [dict(row._mapping) for row in result.fetchall()]

    def ja_enviado_hoje(self, produto_id: int, grupo_id: int) -> bool:
        result = self.conn.execute(
            text("""
                SELECT 1
                FROM envios
                WHERE produto_id = :produto_id
                  AND grupo_id = :grupo_id
                  AND status = 'enviado'
                  AND enviado_em::date = CURRENT_DATE
                LIMIT 1
            """),
            {
                "produto_id": produto_id,
                "grupo_id": grupo_id,
            },
        )

        return result.first() is not None

    # =========================
    # UPDATE
    # =========================
    def marcar_enviado(self, envio_id: int):
        self.conn.execute(
            text("""
                UPDATE envios
                SET
                    status = 'enviado',
                    enviado_em = CURRENT_TIMESTAMP
                WHERE id = :id
            """),
            {"id": envio_id},
        )

    def marcar_falha(self, envio_id: int, erro: Optional[str] = None):
        self.conn.execute(
            text("""
                UPDATE envios
                SET
                    status = 'erro',
                    tentativas = tentativas + 1,
                    erro_mensagem = :erro
                WHERE id = :id
            """),
            {
                "id": envio_id,
                "erro": erro,
            },
        )

    def reagendar(self, envio_id: int, minutos: int):
        nova_data = datetime.utcnow() + timedelta(minutes=minutos)

        self.conn.execute(
            text("""
                UPDATE envios
                SET
                    agendado_para = :agendado_para,
                    status = 'pendente'
                WHERE id = :id
            """),
            {
                "id": envio_id,
                "agendado_para": nova_data,
            },
        )

    def invalidar(self, envio_id: int):
        self.conn.execute(
            text("""
                UPDATE envios
                SET status = 'cancelado'
                WHERE id = :id
            """),
            {"id": envio_id},
        )

    # =========================
    # DELETE (opcional)
    # =========================
    def delete(self, envio_id: int):
        self.conn.execute(
            text("DELETE FROM envios WHERE id = :id"),
            {"id": envio_id},
        )

    def close(self):
        self.conn.close()
