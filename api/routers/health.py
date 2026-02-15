from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.deps import get_db
from api.schemas.health import HealthOut

from api.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["health"])


@router.get(
    "/",
    response_model=list[HealthOut],
)
def health(db: Session = Depends(get_db)):
    """
    Retorna as últimas execuções do pipeline.
    """

    service = HealthService(db)
    return service.get_recent_pipeline_runs()