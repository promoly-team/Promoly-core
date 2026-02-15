from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.redirect_service import RedirectService

router = APIRouter(tags=["redirect"])


@router.get("/go/{produto_id}")
def go_to_affiliate(
    produto_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Redireciona para o link afiliado ativo do produto
    e registra o clique.
    """

    service = RedirectService(db)

    url = service.process_redirect(
        produto_id=produto_id,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return RedirectResponse(
        url=url,
        status_code=302,
    )
