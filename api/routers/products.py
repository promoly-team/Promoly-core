from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text

from api.deps import get_db

router = APIRouter(prefix="/products", tags=["products"])




@router.get("/total")
def count_products(
    category: str | None = None,
    search: str | None = None,
    db=Depends(get_db),
):
    query = """
    SELECT COUNT(DISTINCT p.id) AS total
    FROM produtos p

    JOIN produto_categoria pc
        ON pc.produto_id = p.id
    JOIN categorias c
        ON c.id = pc.categoria_id

    JOIN links_afiliados la
        ON la.produto_id = p.id
        AND la.status = 'ok'
        AND la.url_afiliada IS NOT NULL
        AND la.url_afiliada != ''

    WHERE p.status IN ('ativo', 'novo')
    """

    params = {}

    if category:
        query += " AND c.slug = :category"
        params["category"] = category

    if search:
        query += " AND LOWER(p.titulo) LIKE LOWER(:search)"
        params["search"] = f"%{search}%"

    result = db.execute(text(query), params)
    total = result.scalar()

    return {
        "total": total
    }


@router.get("")
def list_products(
    category: str | None = None,
    search: str | None = None,
    order: str = "desconto",
    limit: int = 20,
    offset: int = 0,
    db=Depends(get_db),
):

    query = """
    WITH precos AS (
        SELECT
            produto_id,
            preco,
            ROW_NUMBER() OVER (
                PARTITION BY produto_id
                ORDER BY created_at DESC
            ) AS rn
        FROM produto_preco_historico
    )
    SELECT
        p.id AS produto_id,
        p.titulo,
        p.imagem_url,

        u.preco AS preco_atual,
        a.preco AS preco_anterior,

        CASE
            WHEN a.preco IS NOT NULL AND a.preco > u.preco
            THEN ROUND(
                ((a.preco - u.preco) * 100.0 / a.preco)::numeric,
                2
            )
            ELSE NULL
        END AS desconto_pct,

        la.url_afiliada
    FROM produtos p

    JOIN produto_categoria pc
        ON pc.produto_id = p.id
    JOIN categorias c
        ON c.id = pc.categoria_id

    JOIN links_afiliados la
        ON la.produto_id = p.id
        AND la.status = 'ok'
        AND la.url_afiliada IS NOT NULL
        AND la.url_afiliada != ''

    JOIN precos u
        ON u.produto_id = p.id AND u.rn = 1
    LEFT JOIN precos a
        ON a.produto_id = p.id AND a.rn = 2

    WHERE p.status IN ('ativo', 'novo')
    """

    params = {
        "limit": limit,
        "offset": offset,
    }

    if category:
        query += " AND c.slug = :category"
        params["category"] = category

    if search:
        query += " AND LOWER(p.titulo) LIKE LOWER(:search)"
        params["search"] = f"%{search}%"


    order_by = """
        ORDER BY desconto_pct DESC NULLS LAST, p.updated_at DESC
    """

    if order == "preco":
        order_by = """
            ORDER BY u.preco ASC NULLS LAST
        """
    elif order == "recentes":
        order_by = """
            ORDER BY p.updated_at DESC
        """

    query += f"""
        {order_by}
        LIMIT :limit OFFSET :offset
    """

    result = db.execute(text(query), params)
    rows = result.mappings().all()

    payload = [
        {
            "produto_id": r["produto_id"],
            "titulo": r["titulo"],
            "imagem_url": r["imagem_url"],
            "preco_atual": float(r["preco_atual"]),
            "preco_anterior": float(r["preco_anterior"])
                if r["preco_anterior"] is not None else None,
            "desconto_pct": float(r["desconto_pct"])
                if r["desconto_pct"] is not None else None,
            "url_afiliada": r["url_afiliada"],
        }
        for r in rows
    ]

    response = JSONResponse(content=payload)
    response.headers["Cache-Control"] = "public, max-age=60"

    return response

