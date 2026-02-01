from typing import Optional, List
from datetime import datetime, time

from database.db import get_connection


class GrupoWhatsappRepository:
    def __init__(self):
        self.conn = get_connection()

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
        cursor = self.conn.cursor()

        cursor.execute(
            """
            INSERT OR IGNORE INTO grupos_whatsapp (
                nome,
                identificador_externo,
                categoria_id,
                cooldown_minutos,
                max_envios_dia,
                horario_inicio,
                horario_fim,
                ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
            """,
            (
                nome,
                identificador_externo,
                categoria_id,
                cooldown_minutos,
                max_envios_dia,
                horario_inicio,
                horario_fim,
            ),
        )

        self.conn.commit()

        return self.get_by_identificador(identificador_externo)["id"]

    # -------------------------
    # READ
    # -------------------------
    def get_by_identificador(self, identificador_externo: str) -> Optional[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM grupos_whatsapp
            WHERE identificador_externo = ?
            """,
            (identificador_externo,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def get_by_id(self, grupo_id: int) -> Optional[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM grupos_whatsapp
            WHERE id = ?
            """,
            (grupo_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None

    def listar_ativos(self) -> List[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM grupos_whatsapp
            WHERE ativo = 1
            ORDER BY nome
            """
        )
        return [dict(row) for row in cursor.fetchall()]

    def listar_por_categoria(self, categoria_id: int) -> List[dict]:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            SELECT *
            FROM grupos_whatsapp
            WHERE ativo = 1
              AND categoria_id = ?
            """,
            (categoria_id,),
        )
        return [dict(row) for row in cursor.fetchall()]

    # -------------------------
    # REGRAS
    # -------------------------
    def dentro_do_horario(self, grupo: dict) -> bool:
        """
        Verifica se agora está dentro da janela permitida do grupo
        """
        if not grupo["horario_inicio"] or not grupo["horario_fim"]:
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
            """
            UPDATE grupos_whatsapp
            SET ativo = 0
            WHERE id = ?
            """,
            (grupo_id,),
        )
        self.conn.commit()

    def ativar(self, grupo_id: int):
        self.conn.execute(
            """
            UPDATE grupos_whatsapp
            SET ativo = 1
            WHERE id = ?
            """,
            (grupo_id,),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
