from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.category_service import CategoryService
from api.schemas.product_card import ProductCardOut
from api.schemas.category_sitemap import CategorySitemapOut


router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/below-average")
def get_categories_sidebar(db: Session = Depends(get_db)):
    service = CategoryService(db)
    return service.get_categories_with_below_average_count()


@router.get(
    "/slug/{slug}/products",
    response_model=list[ProductCardOut],
)
@router.get("/slug/{slug}/products")
def get_products_by_category_slug(
    slug: str,
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
    order: str = "desconto",
    db: Session = Depends(get_db),
):
    service = CategoryService(db)
    return service.get_products_by_category_slug(
        slug, limit, offset, search, order
    )


@router.get(
    "/slug/{slug}/total",
)
def get_category_total(
    slug: str,
    db: Session = Depends(get_db),
):
    service = CategoryService(db)
    return {"total": service.get_category_total(slug)}


@router.get("/sitemap", response_model=list[CategorySitemapOut])
def list_categories_for_sitemap(db: Session = Depends(get_db)):
    service = CategoryService(db)
    return service.list_categories_for_sitemap()


