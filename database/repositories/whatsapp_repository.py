from typing import Optional, List
from datetime import datetime, time

from sqlalchemy import text
from database.db import get_connection


class GrupoWhatsappRepository:
    def __init__(self, conn=None):
        self.conn = conn or get_connection()

    # -------------------------
    # CREATE
    # -------------------------
    def create(
        self,
        nome: str,
        identificador_externo: str,
        categoria_id: int,
        cooldown_minutos: int = 60,
        max_envios_dia: int = 10,
        horario_inicio: Optional[str] = None,
        horario_fim: Optional[str] = None,
    ) -> int:
        self.conn.execute(
            text("""
                INSERT INTO grupos_whatsapp (
                    nome,
                    identificador_externo,
                    categoria_id,
                    cooldown_minutos,
                    max_envios_dia,
                    horario_inicio,
                    horario_fim,
                    ativo
                )
                VALUES (
                    :nome,
                    :identificador_externo,
                    :categoria_id,
                    :cooldown_minutos,
                    :max_envios_dia,
                    :horario_inicio,
                    :horario_fim,
                    TRUE
                )
                ON CONFLICT (identificador_externo) DO NOTHING
            """),
            {
                "nome": nome,
                "identificador_externo": identificador_externo,
                "categoria_id": categoria_id,
                "cooldown_minutos": cooldown_minutos,
                "max_envios_dia": max_envios_dia,
                "horario_inicio": horario_inicio,
                "horario_fim": horario_fim,
            },
        )

        row = self.get_by_identificador(identificador_externo)
        assert row is not None, "Grupo não encontrado após create"
        return row["id"]

    # -------------------------
    # READ
    # -------------------------
    def get_by_identificador(self, identificador_externo: str) -> Optional[dict]:
        row = self.conn.execute(
            text("""
                SELECT *
                FROM grupos_whatsapp
                WHERE identificador_externo = :identificador
            """),
            {"identificador": identificador_externo},
        ).fetchone()

        return dict(row) if row else None

    def get_by_id(self, grupo_id: int) -> Optional[dict]:
        row = self.conn.execute(
            text("""
                SELECT *
                FROM grupos_whatsapp
                WHERE id = :id
            """),
            {"id": grupo_id},
        ).fetchone()

        return dict(row) if row else None

    def listar_ativos(self) -> List[dict]:
        rows = self.conn.execute(
            text("""
                SELECT *
                FROM grupos_whatsapp
                WHERE ativo = TRUE
                ORDER BY nome
            """)
        ).fetchall()

        return [dict(row) for row in rows]

    def listar_por_categoria(self, categoria_id: int) -> List[dict]:
        rows = self.conn.execute(
            text("""
                SELECT *
                FROM grupos_whatsapp
                WHERE ativo = TRUE
                  AND categoria_id = :categoria_id
            """),
            {"categoria_id": categoria_id},
        ).fetchall()

        return [dict(row) for row in rows]

    # -------------------------
    # REGRAS
    # -------------------------
    def dentro_do_horario(self, grupo: dict) -> bool:
        """
        Verifica se agora está dentro da janela permitida do grupo
        """
        if not grupo.get("horario_inicio") or not grupo.get("horario_fim"):
            return True

        agora = datetime.now().time()
        inicio = time.fromisoformat(grupo["horario_inicio"])
        fim = time.fromisoformat(grupo["horario_fim"])

        return inicio <= agora <= fim

    # -------------------------
    # UPDATE
    # -------------------------
    def desativar(self, grupo_id: int):
        self.conn.execute(
            text("""
                UPDATE grupos_whatsapp
                SET ativo = FALSE
                WHERE id = :id
            """),
            {"id": grupo_id},
        )

    def ativar(self, grupo_id: int):
        self.conn.execute(
            text("""
                UPDATE grupos_whatsapp
                SET ativo = TRUE
                WHERE id = :id
            """),
            {"id": grupo_id},
        )

    def close(self):
        self.conn.close()
