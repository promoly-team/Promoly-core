from multiprocessing import Process, Manager, Queue
from scrapper_mlb.config import CATEGORIES
from scrapper_mlb.para_service import chunk_list, run_scraper_for_categories

from datetime import datetime
from colorama import Fore, init
from tqdm import tqdm
import time
import os

# ==========================================================
# 🔧 CONFIGURAÇÕES
# ==========================================================

VERBOSE = True  # 🔥 Mude para True para logs detalhados

LOG_FILE = "scraper_execution.log"

LOG_LEVELS = {
    "DEBUG": 10,
    "INFO": 20,
    "START": 25,
    "DONE": 30,
    "ERROR": 40,
}

MIN_LOG_LEVEL = 10 if VERBOSE else 25

init(autoreset=True)


# ==========================================================
# 📝 LOGGING
# ==========================================================

def write_log(message):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(message + "\n")


def format_log(process_id, level, message):
    if LOG_LEVELS[level] < MIN_LOG_LEVEL:
        return None

    timestamp = datetime.now().strftime("%H:%M:%S")
    base = f"[{timestamp}] [P{process_id:02}] [{level:<5}] {message}"

    # Cores no terminal
    if level == "START":
        colored = Fore.CYAN + base
    elif level == "DONE":
        colored = Fore.GREEN + base
    elif level == "ERROR":
        colored = Fore.RED + base
    elif level == "DEBUG":
        colored = Fore.LIGHTBLACK_EX + base
    else:
        colored = base

    # Arquivo sempre recebe log completo
    write_log(base)

    return colored


def log_listener(log_queue):
    while True:
        msg = log_queue.get()
        if msg == "STOP":
            break
        if msg is not None:
            print(msg)


# ==========================================================
# 🚀 RUNNER COM TIMER
# ==========================================================

def timed_runner(bloco, index, results_dict, log_queue):
    inicio_processo = time.time()

    log_queue.put(format_log(index, "START", f"Iniciado | {bloco}"))

    try:
        for categoria in bloco:
            inicio_cat = time.time()

            run_scraper_for_categories([categoria])

            fim_cat = time.time()
            duracao_cat = fim_cat - inicio_cat

            log_queue.put(
                format_log(
                    index,
                    "INFO",
                    f"Categoria '{categoria}' finalizada em {duracao_cat:.2f}s"
                )
            )

        status = "DONE"

    except Exception as e:
        status = "ERROR"
        log_queue.put(format_log(index, "ERROR", str(e)))

    fim_processo = time.time()
    duracao = fim_processo - inicio_processo
    results_dict[index] = duracao

    log_queue.put(format_log(index, status, f"Finalizado em {duracao:.2f}s"))


# ==========================================================
# ⚡ EXECUÇÃO PARALELA
# ==========================================================

def run_parallel(blocos):
    manager = Manager()
    results_dict = manager.dict()
    log_queue = Queue()

    logger = Process(target=log_listener, args=(log_queue,))
    logger.start()

    processes = []
    inicio_total = time.time()

    for i, bloco in enumerate(blocos):
        p = Process(
            target=timed_runner,
            args=(bloco, i, results_dict, log_queue)
        )
        p.start()
        processes.append(p)

    # Barra de progresso simplificada
    with tqdm(total=len(processes), desc="Processos finalizados") as pbar:
        while any(p.is_alive() for p in processes):
            finalizados = sum(not p.is_alive() for p in processes)
            pbar.n = finalizados
            pbar.refresh()
            time.sleep(0.5)

    for p in processes:
        p.join()

    log_queue.put("STOP")
    logger.join()

    tempo_total = time.time() - inicio_total

    return tempo_total, dict(results_dict)


# ==========================================================
# 🏁 MAIN
# ==========================================================

def main():

    # Limpa log antigo
    if os.path.exists(LOG_FILE):
        os.remove(LOG_FILE)

    categorias = list(CATEGORIES.keys())
    blocos = list(chunk_list(categorias, 3))

    print("\n" + "=" * 60)
    print("🚀 EXECUÇÃO PARALELA")
    print("=" * 60)
    print("Modo VERBOSE:", VERBOSE)
    print("=" * 60)

    tempo_paralelo, processos = run_parallel(blocos)

    # ======================================================
    # 📊 RESUMO FINAL
    # ======================================================

    print("\n" + "=" * 60)
    print("📊 RESUMO FINAL")
    print("=" * 60)

    for pid, t in processos.items():
        print(f"🔹 Processo {pid:02} → {t:.2f}s")

    print("-" * 60)
    print(f"🏁 Tempo total geral → {tempo_paralelo:.2f}s")
    print(f"📁 Log completo salvo em → {LOG_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
