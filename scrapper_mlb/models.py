from dataclasses import dataclass
from typing import Optional

@dataclass
class Product:
    id_produto: str
    descricao: Optional[str]
    preco: Optional[str]
    avaliacao: Optional[str]
    desconto: Optional[str]
    link: Optional[str]
    imagem_url: Optional[str]
