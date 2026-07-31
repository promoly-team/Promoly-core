"""Aplica o schema base num banco vazio, antes das migrations.

As migrations do Alembic cobrem só o incremento — subcategorias,
twitter_posts, colunas novas. Nenhuma delas cria `categorias`, `produtos` ou
`plataformas`: o schema base mora em `schema_postgres.sql` e nunca foi
versionado como migration. Rodar `alembic upgrade head` num banco vazio
quebra na primeira chave estrangeira:

    UndefinedTable: relation "categorias" does not exist

Este script fecha essa lacuna. É idempotente: se as tabelas já existem, não
faz nada.

Usa SQLAlchemy em vez de `psql` de propósito — a URL do projeto vem no
formato `postgresql+psycopg2://`, que o psql não entende, e a forma de URL
do psql se mostrou frágil com `sslmode` em ambientes diferentes.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, text

RAIZ = Path(__file__).resolve().parent.parent
SCHEMA = RAIZ / "schema_postgres.sql"


def main() -> int:
    url = os.getenv("DATABASE_URL")
    if not url:
        print("DATABASE_URL não definida", file=sys.stderr)
        return 1

    engine = create_engine(url)

    with engine.begin() as conn:
        ja_existe = conn.execute(
            text("select to_regclass('public.categorias') is not null")
        ).scalar()

        if ja_existe:
            print("schema base já aplicado, pulando")
            return 0

        print(f"banco vazio — aplicando {SCHEMA.name}")
        # `exec_driver_sql` entrega o texto direto ao psycopg2, que executa
        # múltiplos comandos numa tacada. Com `text()` o SQLAlchemy tenta
        # interpretar o conteúdo — trata `:` como bind param e erra o limite
        # entre statements.
        conn.exec_driver_sql(SCHEMA.read_text(encoding="utf-8"))

    with engine.connect() as conn:
        total = conn.execute(
            text(
                "select count(*) from information_schema.tables "
                "where table_schema = 'public'"
            )
        ).scalar()

    print(f"schema aplicado: {total} tabelas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
