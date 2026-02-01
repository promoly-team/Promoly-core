import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "promoly.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())

    conn.commit()
    conn.close()

    print("✅ Banco promoly.db criado com sucesso")

if __name__ == "__main__":
    init_db()
