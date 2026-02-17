from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from api.deps import get_db

router = APIRouter(tags=["redirect"])


@router.get("/redirect/{produto_id}")
def redirect_to_product(
    produto_id: int,
    request: Request,
    tp: int | None = None,
    db: Session = Depends(get_db)
):

    # Define plataforma
    # 1 = Twitter (ajuste conforme sua tabela plataformas)
    plataforma_id = 1 if tp else 0

    db.execute(
        text("""
            INSERT INTO clicks (
                produto_id,
                plataforma_id,
                twitter_post_id,
                ip,
                user_agent
            )
            VALUES (
                :produto_id,
                :plataforma_id,
                :twitter_post_id,
                :ip,
                :user_agent
            )
        """),
        {
            "produto_id": produto_id,
            "plataforma_id": plataforma_id,
            "twitter_post_id": tp,
            "ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        }
    )

    db.commit()

    return RedirectResponse(
        url=f"https://promoly-core.vercel.app/produto/{produto_id}",
        status_code=302
    )
