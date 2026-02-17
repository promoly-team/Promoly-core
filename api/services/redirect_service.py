from sqlalchemy.orm import Session
from fastapi import HTTPException

from database.repositories.produto_repository import ProdutoRepository
from database.repositories.click_repository import ClickRepository
from api.core.logging_config import get_logger

logger = get_logger("redirect")


class RedirectService:

    def __init__(self, db: Session):
        self.db = db
        self.produto_repo = ProdutoRepository(db)
        self.click_repo = ClickRepository(db)

    def process_redirect(
        self,
        produto_id: int,
        twitter_post_id: int | None,
        ip: str | None,
        user_agent: str | None,
    ) -> str:
        """
        Valida produto, registra clique e retorna
        URL interna do produto no frontend.
        """

        produto = self.produto_repo.get_by_ids(produto_id)

        if not produto:
            logger.warning(
                f"Invalid redirect attempt for produto_id={produto_id}"
            )
            raise HTTPException(
                status_code=404,
                detail="Produto não encontrado",
            )

        # Registra clique
        self.click_repo.register(
            produto_id=produto_id,
            twitter_post_id=twitter_post_id,
            ip=ip,
            user_agent=user_agent,
        )

        logger.info(
            f"Redirect | produto_id={produto_id} | "
            f"twitter_post_id={twitter_post_id} | "
            f"ip={ip}"
        )

        # 🔥 AGORA REDIRECIONA PARA O FRONT
        return f"https://promoly-core.vercel.app/produto/{produto_id}"
