from fastapi import APIRouter, Depends, HTTPException
from api.schemas.affiliate import AffiliateLinkOut
from api.deps import get_db

router = APIRouter(prefix="/affiliates", tags=["affiliates"])


@router.get("/{produto_id}", response_model=AffiliateLinkOut)
def get_affiliate(produto_id: int, db=Depends(get_db)):
    cursor = db.execute(
        """
        SELECT produto_id, url_afiliado, status
        FROM links_afiliados
        WHERE produto_id = ?
        """,
        (produto_id,),
    )
    row = cursor.fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Affiliate link not found")

    return {
        "produto_id": int(row["produto_id"]),
        "url_afiliado": row["url_afiliado"],
        "status": row["status"],
    }
