from sqlalchemy import text
from database.db import get_connection


def associate_products_to_subcategories():
    conn = get_connection()

    print("🔎 Buscando subcategorias...")
    subcategorias = conn.execute(
        text("SELECT id, nome FROM subcategorias")
    ).fetchall()

    total_links = 0

    for sub_id, nome in subcategorias:
        termo = nome.lower()

        print(f"🔗 Associando subcategoria: {nome}")

        produtos = conn.execute(
            text("""
                SELECT id
                FROM produtos
                WHERE LOWER(titulo) LIKE :termo
            """),
            {"termo": f"%{termo}%"}
        ).fetchall()

        for (produto_id,) in produtos:
            conn.execute(
                text("""
                    INSERT INTO produto_subcategoria (produto_id, subcategoria_id)
                    VALUES (:produto_id, :subcategoria_id)
                    ON CONFLICT DO NOTHING
                """),
                {
                    "produto_id": produto_id,
                    "subcategoria_id": sub_id
                }
            )
            total_links += 1

    conn.commit()
    conn.close()

    print(f"✅ Associação finalizada! {total_links} vínculos criados.")


if __name__ == "__main__":
    associate_products_to_subcategories()
