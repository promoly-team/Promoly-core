from sqlalchemy import text


class PipelineRepository:
    def __init__(self, conn=None):
        # permite injetar conexão (recomendado)
        self.conn = conn

    def start(self, pipeline: str) -> int:
        result = self.conn.execute(
            text("""
                INSERT INTO pipeline_runs (pipeline, status)
                VALUES (:pipeline, 'running')
                RETURNING id
            """),
            {
                "pipeline": pipeline,
            },
        )

        row = result.first()
        assert row is not None, "Falha ao criar pipeline_run"

        return row[0]

    def finish(self, run_id: int, status: str):
        self.conn.execute(
            text("""
                UPDATE pipeline_runs
                SET status = :status,
                    finished_at = CURRENT_TIMESTAMP
                WHERE id = :id
            """),
            {
                "status": status,
                "id": run_id,
            },
        )

    def close(self):
        self.conn.close()
