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
from scrapper_mlb.pricing.service import resolve_price_range
from scrapper_mlb.services.product_service import collect_products_by_query


def main():
    total = 0

    base_conn = get_connection()
    plataforma_repo = PlataformaRepository(conn=base_conn)
    categoria_repo = CategoriaRepository(conn=base_conn)

    plataforma = plataforma_repo.get_by_slug("mercado_livre")
    enabled_categories = get_enabled_categories()

    try:
        for categoria_slug, queries in CATEGORIES.items():

            # 🔥 FEATURE FLAG
            if enabled_categories is not None and categoria_slug not in enabled_categories:
                print(f"⏭️ Pulando categoria (feature flag): {categoria_slug}")
                continue

            categoria = categoria_repo.get_by_slug(categoria_slug)

            if not categoria:
                print(f"⚠️ Categoria não encontrada no banco: {categoria_slug}")
                continue

            print(f"\n📦 Categoria: {categoria['nome']}")

            for query in queries:
                print(f"🔍 Buscando: {query}")

                min_price, max_price = resolve_price_range(categoria_slug, query)

                price_filter = f"{min_price}-{max_price}"

                produtos = collect_products_by_query(
                    query=query,
                    max_pages=1,
                    filters={"PriceRange": price_filter},
                )


                for p in produtos:
                    conn = get_connection()

                    try:
                        produto_repo = ProdutoRepository(conn=conn)
                        link_repo = LinkAfiliadoRepository(conn=conn)
                        preco_repo = ProdutoPrecoRepository(conn=conn)

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
                            })

                        status = "ativo" if p.preco is not None else "fora_de_estoque"
                        produto_repo.update_status(produto_id, status)

                        produto_repo.link_categoria(produto_id, categoria["id"])

                        link_repo.create_or_get(
                            produto_id=produto_id,
                            plataforma_id=plataforma["id"],
                            url_original=p.link,
                        )

                        if p.preco is not None:
                            ultimo = preco_repo.get_last_price(produto_id)
                            if ultimo is None or float(ultimo) != float(p.preco):
                                preco_repo.insert(produto_id, p.preco)

                        conn.commit()
                        total += 1

                    except Exception as e:
                        conn.rollback()
                        print("⚠️ Erro ao processar produto:")
                        print(e)

                    finally:
                        conn.close()

                print(f"✅ {len(produtos)} produtos processados")

        print(f"\n🚀 Total geral (bruto): {total}")

    finally:
        base_conn.close()


if __name__ == "__main__":
    main()
