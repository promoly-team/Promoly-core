import time

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from affiliate.driver import create_driver
from affiliate.utils.affiliate_link import extrair_link_afiliado


LINK_BUILDER_URL = "https://www.mercadolivre.com.br/afiliados/linkbuilder#hub"


# create_driver é reexportado de affiliate.driver (fonte única) para manter
# compatibilidade com quem importa de affiliate.mlb_affiliate.
__all__ = ["create_driver", "gerar_link_afiliado"]


# =========================
# Affiliate link generation
# =========================

def gerar_link_afiliado(driver, wait, produto_url: str) -> str | None:
    driver.get(LINK_BUILDER_URL)

    textarea_produto = wait.until(
        EC.presence_of_element_located((By.ID, "url-0"))
    )

    # 🔥 remove tooltips do Andes UI (causa do click interceptado)
    driver.execute_script("""
        document.querySelectorAll(
            '.andes-tooltip, [data-testid="popper"]'
        ).forEach(e => e.remove());
    """)

    # 🔑 seta valor via JS (não clicar)
    driver.execute_script("""
        const textarea = arguments[0];
        textarea.focus();
        textarea.value = arguments[1];
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    """, textarea_produto, produto_url)

    textarea_produto.send_keys(Keys.ENTER)
    driver.find_element(By.TAG_NAME, "body").click()

    # botão Gerar
    botao_gerar = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//span[normalize-space()='Gerar']")
        )
    )

    driver.execute_script(
        "arguments[0].scrollIntoView({block: 'center'});",
        botao_gerar
    )
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", botao_gerar)

    # espera curta
    time.sleep(2)

    # 🔍 captura por regex (robusto)
    html = driver.page_source
    link = extrair_link_afiliado(html)

    return link  # pode ser None se inválido


# =========================
# Teste manual
# =========================

if __name__ == "__main__":
    driver = create_driver()
    wait = WebDriverWait(driver, 40)

    try:
        url_produto = "https://www.mercadolivre.com.br/MLB123456789"
        link = gerar_link_afiliado(driver, wait, url_produto)

        print("🔥 LINK AFILIADO GERADO:")
        print(link or "❌ Link inválido")

        input("ENTER para sair")

    finally:
        driver.quit()
