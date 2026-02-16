from pydantic import BaseModel
from datetime import datetime


class CategorySitemapOut(BaseModel):
    slug: str
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
