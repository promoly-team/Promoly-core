import re


def extract_discount(item) -> str | None:
    """
    Extrai desconto do card do produto (ex: '20% OFF').
    """

    # Tentativa principal: percentual OFF
    discount = item.select_one(
        ".andes-money-amount__discount, .ui-search-item__discount"
    )

    if not discount:
        return None

    text = discount.get_text(strip=True)

    # Normaliza algo como "20% OFF"
    match = re.search(r"\d+% OFF", text.upper())
    return match.group(0) if match else None
