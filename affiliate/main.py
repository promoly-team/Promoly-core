import time
import signal

from selenium.webdriver.support.ui import WebDriverWait

from database.repositories.link_aff_repository import LinkAfiliadoRepository
from database.repositories.pipeline_repository import PipelineRepository
from affiliate.mlb_affiliate import create_driver, gerar_link_afiliado


# =========================
# Configurações
# =========================

LIMITE_POR_EXECUCAO = 500
SLEEP_SEM_TRABALHO = 30
SLEEP_ENTRE_LINKS = 3
WAIT_TIMEOUT = 40


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


# =========================
# Worker principal
# =========================

def main():
    print("🚀 Iniciando Selenium Worker")

    link_repo = LinkAfiliadoRepository()
    pipeline_repo = PipelineRepository()

    run_id = pipeline_repo.start("selenium")

    driver = None
    wait = None
    erro_critico = False

    try:
        driver = create_driver()
        wait = WebDriverWait(driver, WAIT_TIMEOUT)

        while not shutdown_requested:
            links = link_repo.fetch_for_processing(
                limite=LIMITE_POR_EXECUCAO
            )

            print(f"[DEBUG] links retornados: {len(links)}")

            if not links:
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

                    print("✅ Link afiliado gerado com sucesso")

                except Exception as e:
                    print("⚠️ Erro ao gerar link afiliado")
                    print(e)

                    link_repo.marcar_falha(
                        link_id,
                        str(e),
                    )

                time.sleep(SLEEP_ENTRE_LINKS)

    except Exception:
        erro_critico = True
        pipeline_repo.finish(run_id, "erro")
        raise

    finally:
        if not erro_critico:
            pipeline_repo.finish(run_id, "ok")

        print("🧹 Encerrando driver e conexão com banco")

        try:
            if driver:
                driver.quit()
        except Exception:
            pass

        try:
            link_repo.close()
            pipeline_repo.close()
        except Exception:
            pass


# =========================
# Entry point
# =========================

if __name__ == "__main__":
    main()
