from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import text

from api.deps import get_db
from database.repositories.click_repository import ClickRepository

router = APIRouter(tags=["redirect"])

from database.repositories.produto_repository import ProdutoRepository


@router.get("/go/{produto_id}")
def go_to_affiliate(
    produto_id: int,
    request: Request,
    db=Depends(get_db),
):
    produto_repo = ProdutoRepository(db)

    row = produto_repo.get_active_affiliate_link(produto_id)

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Produto inativo ou link afiliado inválido",
        )

    click_repo = ClickRepository(db)
    click_repo.register(
        produto_id=produto_id,
        plataforma_id=row["plataforma_id"],
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return RedirectResponse(
        url=row["url_afiliada"],
        status_code=302,
    )
