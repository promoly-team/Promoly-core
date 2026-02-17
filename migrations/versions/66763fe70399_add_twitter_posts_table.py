"""add twitter_posts table

Revision ID: 66763fe70399
Revises: 89bea6ccda31
Create Date: 2026-02-16 19:13:55.047457

"""


import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "add_twitter_posts"
down_revision = "89bea6ccda31"  # ajuste se necessário
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "twitter_posts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("produto_id", sa.Integer(), nullable=False),
        sa.Column("categoria_slug", sa.String(), nullable=True),
        sa.Column("subcategoria_slug", sa.String(), nullable=True),
        sa.Column("tipo_post", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("NOW()")),
    )

    op.create_index(
        "idx_twitter_posts_produto",
        "twitter_posts",
        ["produto_id"],
    )


def downgrade():
    op.drop_index("idx_twitter_posts_produto", table_name="twitter_posts")
    op.drop_table("twitter_posts")
