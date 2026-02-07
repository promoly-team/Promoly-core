import os
from sqlalchemy import create_engine

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL não definido. "
        "Este projeto requer PostgreSQL."
    )

_engine = None

def get_connection():
    global _engine
    if _engine is None:
        _engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            future=True,
        )
    return _engine.connect()
