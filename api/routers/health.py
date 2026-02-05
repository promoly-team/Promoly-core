from fastapi import APIRouter, Depends
from api.deps import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def health(db=Depends(get_db)):
    cursor = db.execute(
        """
        SELECT pipeline, status, started_at, finished_at
        FROM pipeline_runs
        ORDER BY started_at DESC
        LIMIT 5
        """
    )
    return cursor.fetchall()
