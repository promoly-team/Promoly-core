from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from api.services.redirect_service import RedirectService

from api.deps import get_db

router = APIRouter(tags=["redirect"])


@router.get("/redirect/{produto_id}")
def redirect_to_product(
    produto_id: int,
    request: Request,
    tp: int | None = None,
    db: Session = Depends(get_db)
):

    service = RedirectService(db)

    redirect_url = service.process_redirect(
        produto_id=produto_id,
        twitter_post_id=tp,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return RedirectResponse(url=redirect_url, status_code=302)
