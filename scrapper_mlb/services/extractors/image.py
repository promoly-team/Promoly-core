import re
from bs4 import Tag
from typing import Optional


def extract_image(item: Tag) -> Optional[str]:
    """
    Extrai a imagem principal do produto.

    Estratégia:
    1. DOM-first (src / data-src)
    2. Fallback via regex (mlstatic)
    """

    img = item.find("img", class_="poly-component__picture")

    if img:
        src = img.get("src") or img.get("data-src")
        if src and not src.startswith("data:image"):
            return src

    match = re.search(
        r"https://http2\.mlstatic\.com/[^\"\s]+\.webp",
        str(item)
    )
    return match.group(0) if match else None
