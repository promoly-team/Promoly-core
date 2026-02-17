"""add subcategorias and produto_subcategoria

Revision ID: 89bea6ccda31
Revises: 
Create Date: 2026-02-16 18:02:50.277180

"""
import os
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from dotenv import load_dotenv

# revision identifiers, used by Alembic.
revision: str = '89bea6ccda31'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("DATABASE_URL não encontrada")


def upgrade():
    op.create_table(
        "subcategorias",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("nome", sa.String, nullable=False),
        sa.Column("slug", sa.String, nullable=False, unique=True),
        sa.Column("categoria_id", sa.Integer, nullable=False),
        sa.Column("ativa", sa.Boolean, server_default="1"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["categoria_id"], ["categorias.id"]),
    )

    op.create_table(
        "produto_subcategoria",
        sa.Column("produto_id", sa.Integer, nullable=False),
        sa.Column("subcategoria_id", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(
            ["produto_id"], ["produtos.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["subcategoria_id"], ["subcategorias.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("produto_id", "subcategoria_id"),
    )


def downgrade():
    op.drop_table("produto_subcategoria")
    op.drop_table("subcategorias")
