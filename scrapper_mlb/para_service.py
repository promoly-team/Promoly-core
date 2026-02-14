from database.db import get_engine
from database.repositories.categoria_repository import CategoriaRepository
from database.repositories.link_aff_repository import LinkAfiliadoRepository
from database.repositories.plataforma_repository import PlataformaRepository
from database.repositories.produto_preco_repository import ProdutoPrecoRepository
from database.repositories.produto_repository import ProdutoRepository
from scrapper_mlb.config import CATEGORIES
from scrapper_mlb.services.product_service import collect_products_by_query
from scrapper_mlb.pricing.service import resolve_price_range


def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def run_scraper_for_categories(category_slugs):
    print(f"🚀 Processo iniciado para: {category_slugs}")

    total = 0

    # 🔥 Engine criado dentro do processo
    engine = get_engine()

    try:
        # 🔹 Conexão apenas para buscar dados fixos
        with engine.connect() as base_conn:
            plataforma_repo = PlataformaRepository(conn=base_conn)
            categoria_repo = CategoriaRepository(conn=base_conn)

            plataforma = plataforma_repo.get_by_slug("mercado_livre")

        for categoria_slug in category_slugs:
            queries = CATEGORIES[categoria_slug]

            with engine.connect() as conn_categoria:
                categoria_repo = CategoriaRepository(conn=conn_categoria)
                categoria = categoria_repo.get_by_slug(categoria_slug)

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

                # 🔥 Uma única conexão por lote
                with engine.connect() as conn:
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

                            total += 1

                        conn.commit()

                    except Exception as e:
                        conn.rollback()
                        print("⚠️ Erro:", e)

        print(f"✅ Processo finalizado {category_slugs} | Total: {total}")

    finally:
        # 🔥 Fecha o pool corretamente
        engine.dispose()
