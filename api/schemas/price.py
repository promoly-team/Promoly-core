from pydantic import BaseModel
from datetime import datetime


class PricePointOut(BaseModel):
    preco: float
    created_at: datetime
