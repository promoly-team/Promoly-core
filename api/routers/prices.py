from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.price_service import PriceService
from api.schemas.price import PricePointOut

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get(
    "/{produto_id}",
    response_model=list[PricePointOut],
)
def get_prices(produto_id: int, db: Session = Depends(get_db)):
    """
    Retorna o histórico de preços de um produto específico.
    """

    service = PriceService(db)
    return service.get_price_history(produto_id)
