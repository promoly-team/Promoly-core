from pydantic import BaseModel
from typing import Optional


class ProductCardOut(BaseModel):
    produto_id: int
    slug: str
    titulo: str
    imagem_url: Optional[str]
    preco_atual: Optional[float]
    preco_anterior: Optional[float]
    desconto_pct: Optional[float]
    url_afiliada: Optional[str]
    categoria_id: int | None = None
    categoria_slug: str | None = None
    categoria_nome: str | None = None


