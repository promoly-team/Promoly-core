from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.deal_service import DealService


router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("/")
def get_deals(
    limit: int = Query(20, ge=1, le=100),
    categoria: str | None = None,
    subcategoria: str | None = None,
    db: Session = Depends(get_db),
):
    service = DealService(db)

    deals = service.get_deals(
        limit=limit,
        categoria_slug=categoria,
        subcategoria_slug=subcategoria,
    )

    return deals


@router.get("/all-time-low")
def get_all_time_low(
    limit: int = Query(20, ge=1, le=100),
    categoria: str | None = None,
    subcategoria: str | None = None,
    db: Session = Depends(get_db),
):
    service = DealService(db)

    products = service.get_all_time_low(
        limit=limit,
        categoria_slug=categoria,
        subcategoria_slug=subcategoria,
    )

    return products
