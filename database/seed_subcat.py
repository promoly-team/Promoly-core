from slugify import slugify
from sqlalchemy import text

from database.db import get_connection
from scrapper_mlb.config import CATEGORIES


def seed_subcategorias():
    conn = get_connection()

    for categoria_slug, termos in CATEGORIES.items():

        categoria = conn.execute(
            text("SELECT id FROM categorias WHERE slug = :slug"),
            {"slug": categoria_slug}
        ).fetchone()

        if not categoria:
            print(f"Categoria não encontrada: {categoria_slug}")
            continue

        categoria_id = categoria[0]

        for termo in termos:
            sub_slug = slugify(termo)

            conn.execute(
                text("""
                    INSERT INTO subcategorias (nome, slug, categoria_id)
                    VALUES (:nome, :slug, :categoria_id)
                    ON CONFLICT (slug) DO NOTHING
                """),
                {
                    "nome": termo,
                    "slug": sub_slug,
                    "categoria_id": categoria_id,
                }
            )

    conn.commit()
    conn.close()

    print("Subcategorias criadas com sucesso!")


if __name__ == "__main__":
    seed_subcategorias()
