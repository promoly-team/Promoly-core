from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import text

from api.deps import get_db
from database.repositories.click_repository import ClickRepository

router = APIRouter(tags=["redirect"])


@router.get("/go/{produto_id}")
def go_to_affiliate(
    produto_id: int,
    request: Request,
    db=Depends(get_db),
):
    result = db.execute(
        text("""
            SELECT
                la.url_afiliado,
                la.plataforma_id
            FROM links_afiliados la
            WHERE la.produto_id = :produto_id
              AND la.status = 'ok'
            LIMIT 1
        """),
        {"produto_id": produto_id},
    )

    row = result.mappings().first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Link afiliado não encontrado",
        )

    # 🔗 registra clique
    click_repo = ClickRepository()
    click_repo.register(
        produto_id=produto_id,
        plataforma_id=row["plataforma_id"],
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    click_repo.close()

    return RedirectResponse(
        url=row["url_afiliado"],
        status_code=302,
    )
