import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")

def get_engine():
    return create_engine(
        DB_URL,
        pool_pre_ping=True,
        pool_recycle=1800,
    )

def get_connection():
    engine = get_engine()
    return engine.connect()
