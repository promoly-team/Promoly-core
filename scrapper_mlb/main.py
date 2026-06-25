import time

from database.db import get_connection
from database.repositories.categoria_repository import CategoriaRepository
from database.repositories.link_aff_repository import LinkAfiliadoRepository
from database.repositories.plataforma_repository import PlataformaRepository
from database.repositories.produto_preco_repository import \
    ProdutoPrecoRepository
from database.repositories.produto_repository import ProdutoRepository
from scrapper_mlb.config import CATEGORIES
from scrapper_mlb.config_flags import get_enabled_categories
from scrapper_mlb.services.product_service import collect_products_by_query

def main():
    total = 0

    base_conn = get_connection()
    plataforma_repo = PlataformaRepository(conn=base_conn)
    categoria_repo = CategoriaRepository(conn=base_conn)

    plataforma = plataforma_repo.get_by_slug("mercado_livre")
    enabled_categories = get_enabled_categories()

    try:
        for categoria_slug, subcats in CATEGORIES.items():

            # 🔥 Feature flag
            if enabled_categories and categoria_slug not in enabled_categories:
                print(f"⏭️ Pulando categoria: {categoria_slug}")
                continue

            categoria = categoria_repo.get_by_slug(categoria_slug)
            if not categoria:
                print(f"⚠️ Categoria não encontrada: {categoria_slug}")
                continue

            print(f"\n📦 Categoria: {categoria['nome']}")

            for subcat_slug, termos in subcats.items():
                print(f"  📂 Subcategoria: {subcat_slug}")

                for termo_slug, config in termos.items():

                    query = config["query"]
                    min_price = config["min_price"]
                    max_price = config["max_price"]
                    max_pages = config.get("max_pages", 1)

                    print(f"    🔍 Buscando: {query}")

                    price_filter = f"{min_price}-{max_price}"

                    produtos = collect_products_by_query(
                        query=query,
                        max_pages=max_pages,
                        filters={"PriceRange": price_filter},
                    )

                    if not produtos:
                        continue

                    # 🔥 UMA conexão por termo
                    conn = get_connection()

                    try:
                        produto_repo = ProdutoRepository(conn=conn)
                        link_repo = LinkAfiliadoRepository(conn=conn)
                        preco_repo = ProdutoPrecoRepository(conn=conn)

                        for p in produtos:

                            produto_db = produto_repo.get_by_external_id(
                                external_id=p.id_produto,
                                plataforma_id=plataforma["id"],
                            )

                            if produto_db and produto_db["card_hash"] == p.card_hash:
                                produto_id = produto_db["id"]
                            else:
                                produto_id = produto_repo.upsert({
                                    "external_id": p.id_produto,
                                    "plataforma_id": plataforma["id"],
                                    "titulo": p.descricao,
                                    "descricao": None,
                                    "preco": p.preco,
                                    "avaliacao": p.avaliacao,
                                    "vendas": p.buyers,
                                    "imagem_url": p.imagem_url,
                                    "link_original": p.link,
                                    "status": "novo",
                                    "card_hash": p.card_hash,
                                    "source_term": termo_slug,  # 🔥 opcional (se criar coluna)
                                })

                            status = "ativo" if p.preco else "fora_de_estoque"
                            produto_repo.update_status(produto_id, status)

                            produto_repo.link_categoria(produto_id, categoria["id"])

                            link_repo.create_or_get(
                                produto_id=produto_id,
                                plataforma_id=plataforma["id"],
                                url_original=p.link,
                            )

                            if p.preco:
                                ultimo = preco_repo.get_last_price(produto_id)
                                if ultimo is None or float(ultimo) != float(p.preco):
                                    preco_repo.insert(produto_id, p.preco)

                            total += 1

                        conn.commit()  # 🔥 Commit por termo (muito mais rápido)

                    except Exception as e:
                        conn.rollback()
                        print("⚠️ Erro no lote:")
                        print(e)

                    finally:
                        conn.close()

                    print(f"    ✅ {len(produtos)} produtos processados")

        print(f"\n🚀 Total geral: {total}")

    finally:
        base_conn.close()
if __name__ == "__main__":
    main()
