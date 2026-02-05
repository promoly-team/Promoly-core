from bs4 import BeautifulSoup

def parse_html(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")

def find_product_nodes(soup: BeautifulSoup):
<<<<<<< Updated upstream
    container = soup.find("div", class_="aff-social-lists__container")
    return container.find_all("div", recursive=False) if container else []
=======
    """
    Retorna os nós de produto da página de listagem do Mercado Livre.
    """
    nodes = soup.select("li.ui-search-layout__item")
    if not nodes:
        raise ValueError("Nenhum card encontrado")
    
    return nodes
>>>>>>> Stashed changes
