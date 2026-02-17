from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_db
from api.schemas.product_card import ProductCardOut
from api.schemas.product_detail import ProductTotalOut, ProductWithSimilarsOut
from api.schemas.product_sitemap import ProductSitemapOut
from api.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/total", response_model=ProductTotalOut)
def count_products(
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    total = service.count_products(category, search)
    return {"total": total}


@router.get("", response_model=list[ProductCardOut])
def list_products(
    category: str | None = None,
    search: str | None = None,
    order: str = "desconto",
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    service = ProductService(db)

    return service.list_products(
        category=category,
        search=search,
        order=order,
        limit=limit,
        offset=offset,
    )

@router.get("/slug/{slug}", response_model=ProductWithSimilarsOut)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    service = ProductService(db)

    result = service.get_product_by_slug(slug)

    if result is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return result


@router.get("/sitemap", response_model=list[ProductSitemapOut])
def list_products_for_sitemap(db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.list_products_for_sitemap()


@router.get("/{product_id}", response_model=ProductWithSimilarsOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)

    result = service.get_product_detail(product_id)

    if result is None:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return result


