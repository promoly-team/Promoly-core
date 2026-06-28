import os
import time
import re

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from affiliate.utils.affiliate_link import extrair_link_afiliado


LINK_BUILDER_URL = "https://www.mercadolivre.com.br/afiliados/linkbuilder#hub"


# =========================
# Seletores configuráveis (desacoplados da UI PT-BR do linkbuilder)
# =========================

# ID do textarea onde a URL do produto é colada. Pode mudar conforme a UI
# do Mercado Livre; configurável via env var.
LINKBUILDER_TEXTAREA_ID = os.getenv("LINKBUILDER_TEXTAREA_ID", "url-0")

# Textos do botão "Gerar". A UI é PT-BR por padrão, mas mantemos uma lista
# de fallbacks multilíngues para resiliência. Aceita lista separada por
# vírgula via env var (ex.: "Gerar,Generate,Generar").
LINKBUILDER_GERAR_TEXTS = [
    t.strip()
    for t in os.getenv("LINKBUILDER_GERAR_TEXTS", "Gerar,Generate").split(",")
    if t.strip()
]


def _xpath_botao_gerar(textos) -> str:
    """
    Constrói um XPath que casa um <span> cujo texto normalizado seja igual
    a qualquer um dos textos fornecidos (fallback multilíngue).
    """
    condicoes = " or ".join(
        f"normalize-space()='{texto}'" for texto in textos
    )
    return f"//span[{condicoes}]"


# =========================
# Driver
# =========================

def create_driver():
    options = Options()

    # PROFILE CLONADO (não usar o do snap diretamente)
    options.add_argument(
        "--user-data-dir=/home/leandro/selenium-chromium-profile"
    )
    options.add_argument("--profile-directory=Default")

    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")

    return webdriver.Chrome(options=options)


# =========================
# Affiliate link generation
# =========================

def gerar_link_afiliado(driver, wait, produto_url: str) -> str | None:
    driver.get(LINK_BUILDER_URL)

    textarea_produto = wait.until(
        EC.presence_of_element_located((By.ID, LINKBUILDER_TEXTAREA_ID))
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

    # botão Gerar — tenta cada texto da lista de fallback (multilíngue).
    # Constrói um único XPath cobrindo todos os textos configurados.
    if not LINKBUILDER_GERAR_TEXTS:
        raise ValueError(
            "Nenhum texto configurado para o botão 'Gerar' "
            "(LINKBUILDER_GERAR_TEXTS vazio)."
        )

    xpath_gerar = _xpath_botao_gerar(LINKBUILDER_GERAR_TEXTS)
    try:
        botao_gerar = wait.until(
            EC.presence_of_element_located((By.XPATH, xpath_gerar))
        )
    except Exception as exc:
        raise RuntimeError(
            "Botão 'Gerar' não encontrado no linkbuilder. "
            f"Textos tentados: {LINKBUILDER_GERAR_TEXTS}. "
            "Verifique a env var LINKBUILDER_GERAR_TEXTS ou se a UI mudou."
        ) from exc

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
