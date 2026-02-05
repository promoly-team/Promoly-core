from fastapi import APIRouter, Depends, HTTPException
from api.deps import get_db

router = APIRouter(prefix="/products", tags=["products"])


# =========================
# LISTAGEM
# =========================
@router.get("/")
def list_products(limit: int = 20, db=Depends(get_db)):
    cursor = db.execute(
        """
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
        LIMIT ?
        """,
        (limit,),
    )

    rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "titulo": row["titulo"],
            "preco": row["preco"],
            "avaliacao": row["avaliacao"],
            "vendas": row["vendas"],
            "imagem_url": row["imagem_url"],
            "status": row["status"],
        }
        for row in rows
    ]


# =========================
# DETALHE COMPLETO
# =========================
@router.get("/{produto_id}")
def get_product(produto_id: int, db=Depends(get_db)):
    # ---------- produto ----------
    cursor = db.execute(
        """
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
        WHERE id = ?
        """,
        (produto_id,),
    )
    produto = cursor.fetchone()

    if produto is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # ---------- afiliado ----------
    cursor = db.execute(
        """
        SELECT url_afiliado
        FROM links_afiliados
        WHERE produto_id = ?
          AND status = 'ok'
        """,
        (produto_id,),
    )
    affiliate = cursor.fetchone()

    # ---------- histórico de preços ----------
    cursor = db.execute(
        """
        SELECT preco, created_at
        FROM produto_preco_historico
        WHERE produto_id = ?
        ORDER BY created_at ASC
        """,
        (produto_id,),
    )
    prices = cursor.fetchall()

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
            "url": affiliate["url_afiliado"] if affiliate else None
        },

        "prices": [
            {
                "preco": float(row["preco"]),
                "data": row["created_at"],
            }
            for row in prices
        ],
    }
