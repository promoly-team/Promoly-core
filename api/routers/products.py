from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from api.deps import get_db

router = APIRouter(prefix="/products", tags=["products"])


# =========================
# LISTAGEM
# =========================
@router.get("/")
def list_products(limit: int = 20, db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT
                id,
                titulo,
                preco,
                avaliacao,
                vendas,
                imagem_url,
                status
            FROM produtos
            WHERE status IN ('ativo', 'novo')
            ORDER BY updated_at DESC
            LIMIT :limit
        """),
        {"limit": limit},
    )

    rows = result.mappings().all()

    return rows


# =========================
# DETALHE COMPLETO
# =========================
@router.get("/{produto_id}")
def get_product(produto_id: int, db=Depends(get_db)):
    # ---------- produto ----------
    result = db.execute(
        text("""
            SELECT
                id,
                titulo,
                descricao,
                preco,
                avaliacao,
                vendas,
                imagem_url,
                status
            FROM produtos
            WHERE id = :produto_id
        """),
        {"produto_id": produto_id},
    )
    produto = result.mappings().first()

    if produto is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # ---------- afiliado ----------
    result = db.execute(
        text("""
            SELECT url_afiliada
            FROM links_afiliados
            WHERE produto_id = :produto_id
              AND status = 'ok'
            LIMIT 1
        """),
        {"produto_id": produto_id},
    )
    affiliate = result.mappings().first()

    # ---------- histórico de preços ----------
    result = db.execute(
        text("""
            SELECT preco, created_at
            FROM produto_preco_historico
            WHERE produto_id = :produto_id
            ORDER BY created_at ASC
        """),
        {"produto_id": produto_id},
    )
    prices = result.mappings().all()

    return {
        "id": produto["id"],
        "titulo": produto["titulo"],
        "descricao": produto["descricao"],
        "preco": produto["preco"],
        "avaliacao": produto["avaliacao"],
        "vendas": produto["vendas"],
        "imagem_url": produto["imagem_url"],
        "status": produto["status"],

        "affiliate": {
            "url": affiliate["url_afiliada"] if affiliate else None
        },

        "prices": [
            {
                "preco": float(row["preco"]),
                "data": row["created_at"],
            }
            for row in prices
        ],
    }
