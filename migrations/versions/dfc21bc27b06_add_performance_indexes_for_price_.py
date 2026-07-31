"""add performance indexes for price analytics

Revision ID: dfc21bc27b06
Revises: 96eee3aa7ce5
Create Date: 2026-02-17 20:47:50.557127

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dfc21bc27b06'
down_revision: Union[str, Sequence[str], None] = '96eee3aa7ce5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():

    # Histórico de preço (CRÍTICO)
    op.create_index(
        "idx_preco_produto_created",
        "produto_preco_historico",
        ["produto_id", "created_at"],
        unique=False,
        postgresql_using="btree"
    )

    # Categoria slug lookup
    op.create_index(
        "idx_categoria_slug",
        "categorias",
        ["slug"],
        unique=False
    )

    # Produto-categoria joins
    op.create_index(
        "idx_produto_categoria_produto",
        "produto_categoria",
        ["produto_id"],
        unique=False
    )

    op.create_index(
        "idx_produto_categoria_categoria",
        "produto_categoria",
        ["categoria_id"],
        unique=False
    )

    # `produtos_publicos` é uma VIEW, e PostgreSQL não aceita índice em view
    # comum — só em tabela ou view materializada. Esta migration nunca rodou
    # contra um banco criado do zero; quebrava com:
    #
    #   UndefinedTable: relation "produtos_publicos" does not exist
    #
    # e, com a view já criada, quebraria de novo por tentar indexá-la.
    #
    # O índice também não faria diferença: a view resolve pelos índices das
    # tabelas de base, e `produtos.id` já é chave primária.


def downgrade():

    op.drop_index("idx_preco_produto_created", table_name="produto_preco_historico")
    op.drop_index("idx_categoria_slug", table_name="categorias")
    op.drop_index("idx_produto_categoria_produto", table_name="produto_categoria")
    op.drop_index("idx_produto_categoria_categoria", table_name="produto_categoria")
    op.drop_index("idx_produtos_publicos_id", table_name="produtos_publicos")
