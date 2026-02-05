from pydantic import BaseModel
from typing import Optional


class ProductOut(BaseModel):
    id: int
    titulo: str
    preco: Optional[float]
    avaliacao: Optional[float]
    vendas: Optional[int]
    imagem_url: Optional[str]
    status: str

    class Config:
        from_attributes = True
