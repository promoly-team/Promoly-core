from fastapi import APIRouter, Depends
from sqlalchemy import text
from api.deps import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def health(db=Depends(get_db)):
    result = db.execute(
        text("""
            SELECT
                pipeline,
                status,
                started_at,
                finished_at
            FROM pipeline_runs
            ORDER BY started_at DESC
            LIMIT 5
        """)
    )

    rows = result.mappings().all()

    return [
        {
            "pipeline": row["pipeline"],
            "status": row["status"],
            "started_at": row["started_at"],
            "finished_at": row["finished_at"],
        }
        for row in rows
    ]
