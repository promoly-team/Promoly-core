import os
from sqlalchemy import create_engine
from sqlalchemy.engine import Connection

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///data/promoly.db")

_engine = None

def get_connection() -> Connection:
    global _engine
    if _engine is None:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            future=True,
        )
    return _engine.connect()
