from multiprocessing import Process
from scrapper_mlb.config import CATEGORIES
from scrapper_mlb.para_service import chunk_list, run_scraper_for_categories


def main_parallel():
    categorias = list(CATEGORIES.keys())

    blocos = list(chunk_list(categorias, 3))

    print("🔀 Blocos:", blocos)

    processes = []

    for bloco in blocos:
        p = Process(target=run_scraper_for_categories, args=(bloco,))
        p.start()
        processes.append(p)

    for p in processes:
        p.join()

    print("🏁 Todos os processos finalizaram.")


if __name__ == "__main__":
    main_parallel()
