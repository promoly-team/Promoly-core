import random
import time
from decimal import Decimal

from sqlalchemy import text

from database.db import get_connection
from database.repositories.produto_preco_repository import \
    ProdutoPrecoRepository
from database.repositories.produto_repository import ProdutoRepository
from scrapper_mlb.product_page.service.update_service import \
    collect_product_by_url


from sqlalchemy import text
from database.db import get_connection



def get_priority_products(limit=200):
    query = text("""
                    WITH stats AS (
                    SELECT 
                        p.id,
                        COUNT(pph.id) AS total_precos,
                        MAX(pph.created_at) AS ultimo_preco,

                        -- Volatilidade normalizada (coeficiente de variação)
                        STDDEV(pph.preco) / NULLIF(AVG(pph.preco), 0) AS volatilidade_relativa,

                        COUNT(DISTINCT pph.preco) AS alteracoes,
                        COALESCE(p.vendas, 0) AS vendas,
                        COUNT(c.id) AS total_clicks

                    FROM produtos p
                    LEFT JOIN produto_preco_historico pph 
                        ON pph.produto_id = p.id
                    LEFT JOIN clicks c
                        ON c.produto_id = p.id
                    GROUP BY p.id
                )

                SELECT
                    id,
                    (
                        -- 1️⃣ Maturidade
                        (10 - LEAST(total_precos, 10)) * 6

                        +

                        -- 2️⃣ Tempo desde última atualização
                        EXTRACT(EPOCH FROM (
                            NOW() - COALESCE(ultimo_preco, NOW() - INTERVAL '30 days')
                        )) / 3600 * 0.7

                        +

                        -- 3️⃣ Volatilidade relativa (normalizada)
                        COALESCE(volatilidade_relativa, 0) * 10

                        +

                        -- 4️⃣ Frequência de alteração
                        alteracoes * 4

                        +

                        -- 5️⃣ Popularidade
                        LN(total_clicks + 1) * 5

                        +

                        -- 6️⃣ Vendas
                        LN(vendas + 1) * 6

                    ) AS prioridade_score

                FROM stats
                ORDER BY prioridade_score DESC
                LIMIT :limit;

    """)

    with get_connection() as conn:
        result = conn.execute(query, {"limit": limit})
        return [row[0] for row in result]




BATCH_SIZE = 400
MIN_HOURS_UPDATE = 6

SLEEP_PRODUCT_MIN = 1.5
SLEEP_PRODUCT_MAX = 2.5

BLOCK_STREAK_LIMIT = 5
GLOBAL_COOLDOWN_SECONDS = 120

RETRY_PER_PRODUCT = 1

def process_batch():
    base_conn = get_connection()
    produto_repo_base = ProdutoRepository(conn=base_conn)

    priority_ids = get_priority_products(limit=200)

    # 🔥 PRIORIDADE
    if priority_ids:
        total_priority = len(priority_ids)

        preview = priority_ids[:10]
        preview_str = ", ".join(map(str, preview))

        print("\n" + "=" * 60)
        print("🚀 FILA DE PRIORIDADE ATIVADA")
        print(f"📊 Total de produtos prioritários: {total_priority}")

        if total_priority > 10:
            print(f"🔎 Preview (10 primeiros): {preview_str} ...")
        else:
            print(f"🔎 IDs: {preview_str}")

        print("=" * 60 + "\n")

        produtos_db = produto_repo_base.get_by_ids(priority_ids)

    else:
        produtos_db = produto_repo_base.get_batch_for_update(
            limit=BATCH_SIZE,
            hours=MIN_HOURS_UPDATE,
        )

    if not produtos_db:
        print("📭 Nenhum produto para atualizar no momento.")
        base_conn.close()
        return 0

    print(f"\n📦 Processando {len(produtos_db)} produtos\n")

    total = 0
    block_streak = 0
    block_count = 0

    for produto in produtos_db:
        conn = get_connection()

        try:
            produto_repo = ProdutoRepository(conn=conn)
            preco_repo = ProdutoPrecoRepository(conn=conn)

            produto_id = produto["id"]
            url = produto["link_original"]

            print(f"\n🔍 ID={produto_id}")

            page_data = collect_product_by_url(
                url,
                produto_id,
                retries=RETRY_PER_PRODUCT,
            )

            if not page_data:
                block_streak += 1
                block_count += 1

                print(f"⚠️ Falha (streak={block_streak})")

                if block_streak >= BLOCK_STREAK_LIMIT:
                    print(
                        f"\n🛑 {BLOCK_STREAK_LIMIT} bloqueios seguidos."
                        f" Pausando {GLOBAL_COOLDOWN_SECONDS}s...\n"
                    )
                    time.sleep(GLOBAL_COOLDOWN_SECONDS)
                    block_streak = 0

                continue

            block_streak = 0

            produto_repo.update_price_and_rating(
                produto_id=produto_id,
                preco=page_data.preco,
                avaliacao=page_data.avaliacao,
            )

            if page_data.preco is not None:
                ultimo = preco_repo.get_last_price(produto_id)

                if ultimo is None:
                    preco_repo.insert(produto_id, page_data.preco)
                    print("💰 Primeiro preço registrado")

                elif Decimal(str(ultimo)) != Decimal(str(page_data.preco)):
                    preco_repo.insert(produto_id, page_data.preco)
                    print(f"💰 Preço alterado: {ultimo} → {page_data.preco}")

                else:
                    print("⏭️ Preço inalterado")

            conn.commit()
            total += 1

            time.sleep(random.uniform(SLEEP_PRODUCT_MIN, SLEEP_PRODUCT_MAX))

        except Exception as e:
            conn.rollback()
            print(f"❌ Erro ID={produto_id} -> {e}")

        finally:
            conn.close()

    base_conn.close()

    block_rate = (block_count / len(produtos_db)) * 100

    print("\n📊 Estatísticas do lote:")
    print(f"✔ Processados: {total}")
    print(f"🚨 Bloqueios: {block_count}")
    print(f"📈 Taxa bloqueio: {block_rate:.2f}%\n")

    return total


def main():
    print("🚀 Worker contínuo otimizado iniciado...\n")

    while True:
        processed = process_batch()

        print("🔁 Lote finalizado.")
        print("⏳ Aguardando 10 minutos para próximo ciclo...\n")

        time.sleep(600)


if __name__ == "__main__":
    main()
