from pydantic import BaseModel
from typing import Optional


class DealOut(BaseModel):
    produto_id: int
    slug: str

    titulo: str
    imagem_url: Optional[str] = None

    preco_atual: float
    preco_anterior: float

    desconto_pct: float

    url_afiliada: str


class AllTimeLowOut(BaseModel):
    produto_id: int
    slug: str

    titulo: str
    imagem_url: Optional[str] = None

    preco_atual: float
    menor_preco_historico: float

    url_afiliada: str
