from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.schemas.affiliate import AffiliateLinkOut
from api.deps import get_db
from api.services.affiliate_service import AffiliateService
from api.schemas.affiliate import AffiliateLinkOut

router = APIRouter(prefix="/affiliates", tags=["affiliates"])


@router.get(
    "/{produto_id}",
    response_model=AffiliateLinkOut,
)
def get_affiliate(produto_id: int, db: Session = Depends(get_db)):
    """
    Retorna o link afiliado de um produto.
    """

    service = AffiliateService(db)
    result = service.get_affiliate_link(produto_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Affiliate link not found",
        )

    return result
