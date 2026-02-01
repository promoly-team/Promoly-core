from scrapper_mlb.services.product_service import collect_products_by_query
from scrapper_mlb.config import CATEGORIES

from database.repositories.produto_repository import ProdutoRepository
from database.repositories.categoria_repository import CategoriaRepository
from database.repositories.plataforma_repository import PlataformaRepository
from database.repositories.link_aff_repository import LinkAfiliadoRepository


def main():
    produto_repo = ProdutoRepository()
    categoria_repo = CategoriaRepository()
    plataforma_repo = PlataformaRepository()
    link_repo = LinkAfiliadoRepository()

    plataforma = plataforma_repo.get_by_slug("mercado_livre")

    total = 0

    for categoria_slug, queries in CATEGORIES.items():
        categoria = categoria_repo.get_by_slug(categoria_slug)

        print(f"\n📦 Categoria: {categoria['nome']}")

        for query in queries:
            print(f"🔍 Buscando: {query}")

            produtos = collect_products_by_query(
                query=query,
                max_pages=1,
                filters={"PriceRange": "100-500"},
            )

            for p in produtos:
                produto_id = produto_repo.upsert({
                    "external_id": p.id_produto,
                    "plataforma_id": plataforma["id"],
                    "categoria_id": categoria["id"],
                    "titulo": p.descricao,
                    "descricao": None,
                    "preco": p.preco,
                    "avaliacao": p.avaliacao,
                    "vendas": p.buyers,
                    "imagem_url": p.imagem_url,
                    "link_original": p.link,
                })

                # 🔗 cria link afiliado pendente
                link_repo.create_or_get(
                    produto_id=produto_id,
                    plataforma_id=plataforma["id"],
                    url_original=p.link,
                )

            total += len(produtos)
            print(f"✅ {len(produtos)} produtos salvos")

    print(f"\n🚀 Total geral: {total} produtos")

    produto_repo.close()
    categoria_repo.close()
    plataforma_repo.close()
    link_repo.close()


if __name__ == "__main__":
    main()
