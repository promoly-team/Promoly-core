from dataclasses import dataclass
from decimal import Decimal


@dataclass
class ProductPageData:
    preco: Decimal | None
    avaliacao: Decimal | None
    status: str
