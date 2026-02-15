from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.offer_service import OfferService
from api.schemas.offer import OfferOut


router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("/", response_model=list[OfferOut])
def get_offers(
    limit: int = 20,
    db: Session = Depends(get_db),
):
    service = OfferService(db)
    return service.get_offers(limit)
