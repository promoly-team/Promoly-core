import re


def normalize_buyers(value: str | None) -> int | None:
    """
    Normaliza quantidade de compradores.

    Exemplos:
    - "+500 vendidos" -> 500
    - "+1.200 vendidos" -> 1200
    """

    if not value:
        return None

    match = re.search(r"\+([\d\.]+)", value)
    if not match:
        return None

    return int(match.group(1).replace(".", ""))
