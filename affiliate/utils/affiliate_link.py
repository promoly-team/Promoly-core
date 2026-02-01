import re


def extrair_link_afiliado(texto: str) -> str:
    if not texto:
        return ""

    match = re.search(
        r"https://mercadolivre\.com/sec/[A-Za-z0-9]+",
        texto
    )
    return match.group(0) if match else ""
