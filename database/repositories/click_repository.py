from sqlalchemy import text

class ClickRepository:
    def __init__(self, conn):
        self.conn = conn

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
        self.conn.commit()
