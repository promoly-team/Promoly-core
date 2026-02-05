from database.db import get_connection


class ClickRepository:
    def __init__(self):
        self.conn = get_connection()

    def register(
        self,
        produto_id: int,
        plataforma_id: int,
        ip: str | None,
        user_agent: str | None,
    ):
        self.conn.execute(
            """
            INSERT INTO clicks (
                produto_id,
                plataforma_id,
                ip,
                user_agent
            )
            VALUES (?, ?, ?, ?)
            """,
            (produto_id, plataforma_id, ip, user_agent),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
