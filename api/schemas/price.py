from pydantic import BaseModel
from datetime import datetime


class PricePoint(BaseModel):
    preco: float
    created_at: datetime
