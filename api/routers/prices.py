from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.deps import get_db
from api.schemas.price import PricePointOut
from api.services.price_service import PriceService

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



# 🔹 NOVA ROTA BATCH
@router.get("")
def get_prices_batch(
    ids: Optional[str] = Query(None, description="Lista de IDs separados por vírgula"),
    db: Session = Depends(get_db),
):
    """
    Retorna histórico de múltiplos produtos.

    Exemplo:
    /prices?ids=1,2,3
    """

    if not ids:
        return {"error": "Informe o parâmetro ids"}

    produto_ids = [int(i) for i in ids.split(",") if i.strip().isdigit()]

    service = PriceService(db)
    return service.get_price_history(produto_ids=produto_ids)