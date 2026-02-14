import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from api.deps import get_db

router = APIRouter(prefix="/products", tags=["products"])


# =====================================================
# TOTAL
# =====================================================

@router.get("/total")
def count_products(
    category: str | None = None,
    search: str | None = None,
    db=Depends(get_db),
):
    query = """
        SELECT COUNT(DISTINCT p.id) AS total
        FROM produtos_publicos p
        JOIN produto_categoria pc ON pc.produto_id = p.id
        JOIN categorias c ON c.id = pc.categoria_id
    """

    params = {}
    conditions = []

    if category:
        conditions.append("c.slug = :category")
        params["category"] = category

    if search:
        conditions.append("LOWER(p.titulo) LIKE LOWER(:search)")
        params["search"] = f"%{search}%"

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    total = db.execute(text(query), params).scalar()

    return {"total": total}


# =====================================================
# LISTAGEM
# =====================================================

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
            p.url_afiliada,
            u.preco AS preco_atual,
            a.preco AS preco_anterior,
            CASE
                WHEN a.preco IS NOT NULL AND a.preco > u.preco
                THEN ROUND(
                    ((a.preco - u.preco) * 100.0 / a.preco)::numeric,
                    2
                )
                ELSE NULL
            END AS desconto_pct
        FROM produtos_publicos p
        JOIN produto_categoria pc ON pc.produto_id = p.id
        JOIN categorias c ON c.id = pc.categoria_id
        JOIN precos u ON u.produto_id = p.id AND u.rn = 1
        LEFT JOIN precos a ON a.produto_id = p.id AND a.rn = 2
    """

    params = {"limit": limit, "offset": offset}
    conditions = []

    if category:
        conditions.append("c.slug = :category")
        params["category"] = category

    if search:
        conditions.append("LOWER(p.titulo) LIKE LOWER(:search)")
        params["search"] = f"%{search}%"

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    order_by = "ORDER BY desconto_pct DESC NULLS LAST, p.updated_at DESC"

    if order == "preco":
        order_by = "ORDER BY u.preco ASC NULLS LAST"
    elif order == "recentes":
        order_by = "ORDER BY p.updated_at DESC"

    query += f"""
        {order_by}
        LIMIT :limit OFFSET :offset
    """

    rows = db.execute(text(query), params).mappings().all()

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

    return JSONResponse(content=payload)


# =====================================================
# DETALHE
# =====================================================
@router.get("/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):

    result = db.execute(
        text("""
            SELECT
                p.id AS produto_id,
                p.slug,
                p.titulo,
                p.descricao,
                p.imagem_url,
                p.preco,
                p.avaliacao,
                p.url_afiliada,
                COALESCE(
                    ARRAY_REMOVE(ARRAY_AGG(c.nome), NULL),
                    '{}'
                ) AS categorias
            FROM produtos_publicos p
            LEFT JOIN produto_categoria pc ON pc.produto_id = p.id
            LEFT JOIN categorias c ON c.id = pc.categoria_id
            WHERE p.id = :product_id
            GROUP BY
                p.id,
                p.slug,
                p.titulo,
                p.descricao,
                p.imagem_url,
                p.preco,
                p.avaliacao,
                p.url_afiliada
        """),
        {"product_id": product_id}
    )

    produto = result.mappings().first()

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    produto_dict = dict(produto)

    similares = similares_por_categoria(db, product_id)
    similares_list = [dict(s) for s in similares]

    return {
        "produto": produto_dict,
        "similares": similares_list
    }


# =====================================================
# SIMILARES
# =====================================================

def similares_por_categoria(db, produto_id: int, limit=4):
    result = db.execute(
        text("""
            SELECT DISTINCT p.*
            FROM produtos_publicos p
            JOIN produto_categoria pc ON pc.produto_id = p.id
            WHERE pc.categoria_id IN (
                SELECT categoria_id
                FROM produto_categoria
                WHERE produto_id = :produto_id
            )
            AND p.id != :produto_id
            LIMIT :limit
        """),
        {"produto_id": produto_id, "limit": limit}
    )

    return result.mappings().all()


@router.get("/{produto_id}/similares")
def produtos_similares(produto_id: int, db=Depends(get_db)):

    produto = db.execute(
        text("""
            SELECT id
            FROM produtos_publicos
            WHERE id = :id
        """),
        {"id": produto_id}
    ).mappings().first()

    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    similares = similares_por_categoria(db, produto_id, limit=6)

    return similares
