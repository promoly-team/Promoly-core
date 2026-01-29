from dataclasses import dataclass
from decimal import Decimal
from typing import Optional


@dataclass
class Product:
    id_produto: str
    descricao: Optional[str]
    preco: Optional[Decimal]
    avaliacao: Optional[Decimal]
    desconto: Optional[str]
    link: Optional[str]
    imagem_url: Optional[str]
    buyers: Optional[int] 
