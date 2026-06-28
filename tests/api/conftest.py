"""
Fixtures de teste da camada API.

Sobe um banco PostgreSQL real (a camada usa SQL bruto com dialeto
Postgres — SQLite não serve) a partir de `tests/sql/schema_test.sql`,
e expõe um `TestClient` com `get_db` sobrescrito.

O banco é controlado por TEST_DATABASE_URL. Default aponta para o
container descartável usado no CI (serviço `postgres`). Se o banco
não estiver acessível, os testes desta pasta são pulados (skip),
para não quebrar a suíte unitária em ambientes sem Postgres.
"""

import os
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5544/promoly_test",
)

SCHEMA_FILE = Path(__file__).resolve().parent.parent / "sql" / "schema_test.sql"

# Tabelas truncadas entre testes (ordem irrelevante por causa do CASCADE).
_TABLES = [
    "pipeline_runs",
    "clicks",
    "twitter_posts",
    "links_afiliados",
    "produto_subcategoria",
    "produto_categoria",
    "produto_preco_historico",
    "produtos",
    "subcategorias",
    "categorias",
    "plataformas",
]


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(TEST_DATABASE_URL, future=True)
    try:
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - depende do ambiente
        pytest.skip(f"PostgreSQL de teste indisponível: {exc}")

    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    with eng.begin() as conn:
        conn.execute(text("DROP VIEW IF EXISTS produtos_publicos CASCADE"))
        conn.exec_driver_sql(schema_sql)

    yield eng
    eng.dispose()


@pytest.fixture
def db_session(engine):
    # Limpa o estado antes de cada teste. Os serviços fazem commit,
    # então não dá pra confiar só em rollback de transação.
    with engine.begin() as conn:
        conn.execute(
            text(f"TRUNCATE {', '.join(_TABLES)} RESTART IDENTITY CASCADE")
        )

    Session = sessionmaker(bind=engine, autoflush=False, future=True)
    session = Session()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db_session, monkeypatch):
    # DATABASE_URL precisa existir antes de importar api.main (db.py monta
    # o engine no import). Apontamos para o banco de teste por garantia.
    monkeypatch.setenv("DATABASE_URL", TEST_DATABASE_URL)

    from api.main import app
    from api.deps import get_db
    from fastapi.testclient import TestClient

    def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    # TestClient sem context manager NÃO dispara o lifespan, evitando o
    # APScheduler de tweets diários durante os testes.
    test_client = TestClient(app)
    try:
        yield test_client
    finally:
        app.dependency_overrides.clear()


# -----------------------------------------------------------------
# Helpers de seed reutilizáveis
# -----------------------------------------------------------------

@pytest.fixture
def seed(db_session):
    """Fábrica de dados mínimos para os testes de API."""
    from tests.api.factories import SeedHelper

    return SeedHelper(db_session)
