from bs4 import BeautifulSoup

def parse_html(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")

def find_product_nodes(soup: BeautifulSoup):
    container = soup.find("div", class_="aff-social-lists__container")
    return container.find_all("div", recursive=False) if container else []