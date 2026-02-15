from pydantic import BaseModel
from typing import Optional


class OfferOut(BaseModel):
    produto_id: int
    titulo: str
    imagem_url: Optional[str]
    preco: Optional[float]
    url_afiliada: Optional[str]
