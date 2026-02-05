from pathlib import Path
import os
import sqlite3

DB_PATH = Path(
    os.getenv("PROMOLY_DB_PATH", "/app/data/promoly.db")
)


def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")

    return conn
