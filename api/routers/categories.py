from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.category_service import CategoryService
from api.schemas.product_card import ProductCardOut

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get(
    "/{categoria_id}/products",
    response_model=list[ProductCardOut],
)
def get_products_by_category(
    categoria_id: int,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    Retorna produtos de uma categoria específica,
    ordenados pelo maior desconto.
    """

    service = CategoryService(db)
    return service.get_products_by_category(categoria_id, limit)
