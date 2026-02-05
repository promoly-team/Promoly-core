from typing import Optional
from pydantic import BaseModel


class AffiliateLinkOut(BaseModel):
    produto_id: int
    url_afiliado: Optional[str]
    status: str
