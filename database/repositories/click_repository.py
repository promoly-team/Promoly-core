from sqlalchemy import text
from database.db import get_connection


class ClickRepository:
    def __init__(self, conn=None):
        self.conn = conn or get_connection()

    def register(
        self,
        produto_id: int,
        plataforma_id: int,
        ip: str | None,
        user_agent: str | None,
    ):
        self.conn.execute(
            text("""
                INSERT INTO clicks (
                    produto_id,
                    plataforma_id,
                    ip,
                    user_agent
                )
                VALUES (
                    :produto_id,
                    :plataforma_id,
                    :ip,
                    :user_agent
                )
            """),
            {
                "produto_id": produto_id,
                "plataforma_id": plataforma_id,
                "ip": ip,
                "user_agent": user_agent,
            },
        )

    def close(self):
        self.conn.close()
