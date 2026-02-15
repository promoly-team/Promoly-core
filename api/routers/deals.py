from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.deal_service import DealService
from api.schemas.product_card import ProductCardOut


router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("/", response_model=list[ProductCardOut])
def get_deals(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    service = DealService(db)
    return service.get_deals(limit)

