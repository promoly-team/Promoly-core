from pydantic import BaseModel
from typing import Optional, List


class ProductDetailOut(BaseModel):
    produto_id: int
    slug: Optional[str]
    titulo: str
    descricao: Optional[str]
    imagem_url: Optional[str]
    preco: Optional[float]
    avaliacao: Optional[float]
    url_afiliada: Optional[str]
    categorias: List[str]


class ProductWithSimilarsOut(BaseModel):
    produto: ProductDetailOut
    similares: List[dict]  # depois podemos tipar melhor


class ProductTotalOut(BaseModel):
    total: int
