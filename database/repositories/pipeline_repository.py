from database.db import get_connection


class PipelineRepository:
    def __init__(self):
        self.conn = get_connection()

    def start(self, pipeline: str) -> int:
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO pipeline_runs (pipeline, status)
            VALUES (?, 'running')
            """,
            (pipeline,),
        )
        self.conn.commit()
        return cursor.lastrowid

    def finish(self, run_id: int, status: str):
        self.conn.execute(
            """
            UPDATE pipeline_runs
            SET status = ?, finished_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (status, run_id),
        )
        self.conn.commit()

    def close(self):
        self.conn.close()
