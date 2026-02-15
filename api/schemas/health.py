from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class HealthOut(BaseModel):
    pipeline: str
    status: str
    started_at: Optional[datetime]
    finished_at: Optional[datetime]
