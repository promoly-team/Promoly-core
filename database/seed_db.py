import os
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não definido")

engine = create_engine(DATABASE_URL)

def seed_categorias(conn):
    categorias = [
        ("Eletrônicos", "eletronicos"),
        ("Casa", "casa"),
        ("Pet", "pet"),
    ]

    for nome, slug in categorias:
        conn.execute(
            text("""
                INSERT INTO categorias (nome, slug)
                VALUES (:nome, :slug)
                ON CONFLICT (slug) DO NOTHING
            """),
            {"nome": nome, "slug": slug}
        )

    print("✅ Categorias seed executado")


def seed_plataformas(conn):
    conn.execute(
        text("""
            INSERT INTO plataformas (
                nome,
                slug,
                dominio_principal,
                suporta_afiliado,
                tipo_afiliado
            )
            VALUES (
                :nome,
                :slug,
                :dominio,
                :suporta_afiliado,
                :tipo_afiliado
            )
            ON CONFLICT (slug) DO NOTHING
        """),
        {
            "nome": "Mercado Livre",
            "slug": "mercado_livre",
            "dominio": "mercadolivre.com.br",
            "suporta_afiliado": True,
            "tipo_afiliado": "link_builder",
        }
    )

    print("✅ Plataforma seed executado")


def main():
    # 🔥 TRANSAÇÃO REAL
    with engine.begin() as conn:
        seed_categorias(conn)
        seed_plataformas(conn)

    print("🚀 Seed finalizado com sucesso")


if __name__ == "__main__":
    main()
