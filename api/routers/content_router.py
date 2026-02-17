from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.content_service import ContentService


router = APIRouter(prefix="/content", tags=["content"])


@router.get("/top-deal")
def top_deal(db: Session = Depends(get_db)):
    service = ContentService(db)
    return {"post": service.generate_top_deal_post()}


@router.get("/all-time-low")
def all_time_low(db: Session = Depends(get_db)):
    service = ContentService(db)
    return {"post": service.generate_all_time_low_post()}


@router.get("/top5")
def top5(db: Session = Depends(get_db)):
    service = ContentService(db)
    return {"post": service.generate_top5_post()}
