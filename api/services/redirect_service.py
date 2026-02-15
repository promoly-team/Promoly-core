from sqlalchemy.orm import Session
from fastapi import HTTPException

from database.repositories.produto_repository import ProdutoRepository
from database.repositories.click_repository import ClickRepository


class RedirectService:
    """
    Serviço responsável por:

    - Validar se produto possui link afiliado ativo
    - Registrar clique
    - Retornar URL de redirecionamento
    """

    def __init__(self, db: Session):
        self.db = db
        self.produto_repo = ProdutoRepository(db)
        self.click_repo = ClickRepository(db)

    def process_redirect(
        self,
        produto_id: int,
        ip: str | None,
        user_agent: str | None,
    ) -> str:
        """
        Valida produto e registra clique.
        Retorna a URL de redirecionamento.
        """

        row = self.produto_repo.get_active_affiliate_link(produto_id)

        if not row:
            raise HTTPException(
                status_code=404,
                detail="Produto inativo ou link afiliado inválido",
            )

        self.click_repo.register(
            produto_id=produto_id,
            plataforma_id=row["plataforma_id"],
            ip=ip,
            user_agent=user_agent,
        )

        return row["url_afiliada"]
