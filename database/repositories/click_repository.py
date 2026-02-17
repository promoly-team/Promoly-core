from sqlalchemy import text

class ClickRepository:
    def __init__(self, conn):
        self.conn = conn


    def register(
        self,
        produto_id: int,
        twitter_post_id: int | None,
        ip: str | None,
        user_agent: str | None,
    ):
        self.conn.execute(
            text("""
                INSERT INTO clicks (
                    produto_id,
                    twitter_post_id,
                    ip,
                    user_agent
                )
                VALUES (
                    :produto_id,
                    :twitter_post_id,
                    :ip,
                    :user_agent
                )
            """),
            {
                "produto_id": produto_id,
                "twitter_post_id": twitter_post_id,
                "ip": ip,
                "user_agent": user_agent,
            },
        )
        self.conn.commit()
