from scrapper_mlb.services.product_service import collect_products_by_query
from scrapper_mlb.config import CATEGORIES

from database.repositories.produto_repository import ProdutoRepository
from database.repositories.categoria_repository import CategoriaRepository
from database.repositories.plataforma_repository import PlataformaRepository
from database.repositories.link_aff_repository import LinkAfiliadoRepository
from database.repositories.produto_preco_repository import ProdutoPrecoRepository


def main():
    produto_repo = ProdutoRepository()
    categoria_repo = CategoriaRepository()
    plataforma_repo = PlataformaRepository()
    link_repo = LinkAfiliadoRepository()

    # histórico de preço usa a MESMA conexão
    preco_repo = ProdutoPrecoRepository(produto_repo.conn)

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
                # 🔎 busca produto get_id_by_externalexistente (Row ou None)
                produto_db = produto_repo.get_by_external_id(
                    external_id=p.id_produto,
                    plataforma_id=plataforma["id"],
                )

                # 🟡 produto existe e não mudou
                if produto_db and produto_db["card_hash"] == p.card_hash:
                    produto_id = produto_db["id"]
                else:
                    # 🟢 produto novo ou alterado
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

                # 🔒 garantia de tipo
                
                assert isinstance(produto_id, int), f"produto_id inválido: {type(produto_id)}"

                # status simples baseado na presença
                if p.preco is None:
                    status = "fora_de_estoque"
                else:
                    status = "ativo"

                produto_repo.update_status(
                    produto_id=produto_id,
                    status=status,
                )


                # 🔗 vínculo N:N produto ↔ categoria
                produto_repo.link_categoria(
                    produto_id=produto_id,
                    categoria_id=categoria["id"],
                )

                # 🔗 link afiliado (idempotente)
                link_repo.create_or_get(
                    produto_id=produto_id,
                    plataforma_id=plataforma["id"],
                    url_original=p.link,
                )

                # 💰 HISTÓRICO DE PREÇO (só quando muda)
                if p.preco is not None:
                    ultimo_preco = preco_repo.get_last_price(produto_id)

                    if ultimo_preco is None or float(p.preco) != float(ultimo_preco):
                        preco_repo.insert(
                            produto_id=produto_id,
                            preco=p.preco,
                        )

                total += 1

            print(f"✅ {len(produtos)} produtos processados")

    print(f"\n🚀 Total geral (bruto): {total}")

    produto_repo.close()
    categoria_repo.close()
    plataforma_repo.close()
    link_repo.close()


if __name__ == "__main__":
    main()