import time
import random
from decimal import Decimal

from database.db import get_connection
from database.repositories.produto_repository import ProdutoRepository
from database.repositories.produto_preco_repository import ProdutoPrecoRepository
from scrapper_mlb.product_page.service.update_service import collect_product_by_url


PRIORITY_IDS = []  # ex: [2647, 8190]


BATCH_SIZE = 200
MIN_HOURS_UPDATE = 6

SLEEP_PRODUCT_MIN = 2.5
SLEEP_PRODUCT_MAX = 4.5

BLOCK_STREAK_LIMIT = 5
GLOBAL_COOLDOWN_SECONDS = 120

RETRY_PER_PRODUCT = 1

def process_batch():
    base_conn = get_connection()
    produto_repo_base = ProdutoRepository(conn=base_conn)

    # 🔥 PRIORIDADE
    if PRIORITY_IDS:
        print(f"\n⭐ Atualizando PRIORIDADE: {PRIORITY_IDS}\n")
        produtos_db = produto_repo_base.get_by_ids(PRIORITY_IDS)
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
