from sqlalchemy import text
from sqlalchemy.orm import Session


class HealthService:
    """
    Serviço responsável por consultar o status
    das últimas execuções do pipeline.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_recent_pipeline_runs(self, limit: int = 5):
        """
        Retorna as últimas execuções do pipeline,
        ordenadas pela data de início.
        """

        result = self.db.execute(
            text("""
                SELECT
                    pipeline,
                    status,
                    started_at,
                    finished_at
                FROM pipeline_runs
                ORDER BY started_at DESC
                LIMIT :limit
            """),
            {"limit": limit},
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
