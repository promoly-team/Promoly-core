import time
from selenium.webdriver.support.ui import WebDriverWait

from affiliate.driver import create_driver
from affiliate.mlb_affiliate import gerar_link_afiliado

from database.repositories.link_aff_repository import LinkAfiliadoRepository


def main():
    driver = create_driver()
    wait = WebDriverWait(driver, 40)

    link_repo = LinkAfiliadoRepository()

    try:
        links = link_repo.list_pendentes(limite=20)

        for link in links:
            print(f"🔗 Gerando afiliado para link_id={link['id']}")

            try:
                afiliado = gerar_link_afiliado(
                    driver,
                    wait,
                    link["url_original"],
                )

                if not afiliado:
                    print("🗑️ Link inválido")
                    link_repo.invalidar(link["id"])
                else:
                    print("✅ Link afiliado gerado")
                    link_repo.marcar_sucesso(
                        link["id"],
                        afiliado,
                    )

            except Exception as e:
                print(f"⚠️ Erro: {e}")
                link_repo.marcar_falha(link["id"], str(e))

            time.sleep(5)

    finally:
        driver.quit()
        link_repo.close()


if __name__ == "__main__":
    main()
