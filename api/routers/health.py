from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.deps import get_db
from api.schemas.health import HealthOut

from api.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
def liveness() -> dict:
    """Prova de vida do processo. Nao toca no banco, de proposito.

    O healthcheck do orquestrador precisa responder "o processo esta de pe",
    nao "o banco esta acordado". Apontar o Render para `/health/` — que
    consulta o pipeline — faria o servico ser marcado como nao saudavel toda
    vez que o Neon suspendesse por inatividade, entrando em loop de restart
    justamente quando ninguem esta usando.
    """
    return {"status": "ok"}


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