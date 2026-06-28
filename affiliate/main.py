import time
import signal

from selenium.webdriver.support.ui import WebDriverWait

from database.repositories.link_aff_repository import LinkAfiliadoRepository
from database.repositories.pipeline_repository import PipelineRepository
from affiliate.mlb_affiliate import create_driver, gerar_link_afiliado
from database.db import get_connection

# =========================
# Configurações
# =========================

LIMITE_POR_EXECUCAO = 500
SLEEP_SEM_TRABALHO = 30
SLEEP_ENTRE_LINKS = 3
WAIT_TIMEOUT = 40

# Reinicia o driver a cada N links para evitar degradação/vazamento de
# memória do Chrome/Selenium em sessões longas.
RESTART_DRIVER_EVERY = 100



# =========================
# Controle de shutdown
# =========================

shutdown_requested = False


def handle_shutdown(signum, frame):
    global shutdown_requested
    print("🧹 Shutdown solicitado, finalizando após o ciclo atual...")
    shutdown_requested = True


signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)


def restart_driver(driver):
    """Encerra o driver atual e devolve um novo driver + wait."""
    try:
        driver.quit()
    except Exception:
        pass

    novo_driver = create_driver()
    novo_wait = WebDriverWait(novo_driver, WAIT_TIMEOUT)
    return novo_driver, novo_wait


# =========================
# Worker principal
# =========================


def main():
    print("🚀 Iniciando Selenium Worker")

    driver = None
    wait = None
    erro_critico = False

    # conexão SÓ para pipeline
    pipeline_conn = get_connection()
    pipeline_repo = PipelineRepository(conn=pipeline_conn)
    run_id = pipeline_repo.start("selenium")

    try:
        driver = create_driver()
        wait = WebDriverWait(driver, WAIT_TIMEOUT)
        links_processados = 0

        while not shutdown_requested:
            # 🔁 conexão NOVA para cada batch
            conn = get_connection()
            link_repo = LinkAfiliadoRepository(conn=conn)

            try:
                links = link_repo.fetch_for_processing(
                    limite=LIMITE_POR_EXECUCAO
                )

                print(f"[DEBUG] links retornados: {len(links)}")

                if not links:
                    conn.close()
                    time.sleep(SLEEP_SEM_TRABALHO)
                    continue

                for link in links:
                    if shutdown_requested:
                        break

                    link_id = link["id"]
                    url_original = link["url_original"]

                    print(f"🔗 Processando link_id={link_id}")
                    print(f"🌐 URL: {url_original}")

                    try:
                        afiliado = gerar_link_afiliado(
                            driver,
                            wait,
                            url_original,
                        )

                        if not afiliado:
                            raise RuntimeError("Link afiliado não gerado")

                        link_repo.marcar_sucesso(
                            link_id,
                            url_afiliada=afiliado,
                        )
                        conn.commit()

                        print("✅ Link afiliado gerado com sucesso")

                    except Exception as e:
                        print("⚠️ Erro ao gerar link afiliado")
                        print(e)

                        conn.rollback()  # 🔑 ESSENCIAL
                        link_repo.marcar_falha(
                            link_id,
                            str(e)[:500],  # evita erro gigante
                        )
                        conn.commit()

                    time.sleep(SLEEP_ENTRE_LINKS)

                    # 🔄 Reinicia o driver periodicamente (evita degradação
                    # de memória do Selenium em sessões longas).
                    links_processados += 1
                    if links_processados % RESTART_DRIVER_EVERY == 0:
                        print(
                            f"🔄 {links_processados} links processados — "
                            "reiniciando driver..."
                        )
                        driver, wait = restart_driver(driver)

            finally:
                conn.close()

    except Exception:
        erro_critico = True
        pipeline_conn.rollback()
        pipeline_repo.finish(run_id, "erro")
        pipeline_conn.commit()
        raise

    finally:
        if not erro_critico:
            pipeline_conn.rollback()
            pipeline_repo.finish(run_id, "ok")
            pipeline_conn.commit()

        print("🧹 Encerrando driver e conexões")

        try:
            if driver:
                driver.quit()
        except Exception:
            pass

        try:
            pipeline_conn.close()
        except Exception:
            pass

# =========================
# Entry point
# =========================

if __name__ == "__main__":
    main()
