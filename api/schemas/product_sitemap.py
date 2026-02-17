from pydantic import BaseModel
from datetime import datetime


class ProductSitemapOut(BaseModel):
    produto_id: int
    slug: str
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
