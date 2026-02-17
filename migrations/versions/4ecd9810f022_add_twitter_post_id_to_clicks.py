"""add twitter_post_id to clicks

Revision ID: 4ecd9810f022
Revises: b1c55b7ac152
Create Date: 2026-02-17 02:43:13.793846

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ecd9810f022'
down_revision: Union[str, Sequence[str], None] = 'b1c55b7ac152'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "clicks",
        sa.Column("twitter_post_id", sa.Integer(), nullable=True)
    )

    op.create_foreign_key(
        "fk_clicks_twitter_post",
        "clicks",
        "twitter_posts",
        ["twitter_post_id"],
        ["id"],
    )

    op.create_index(
        "idx_clicks_twitter_post",
        "clicks",
        ["twitter_post_id"]
    )


def downgrade():
    op.drop_index("idx_clicks_twitter_post", table_name="clicks")
    op.drop_constraint("fk_clicks_twitter_post", "clicks", type_="foreignkey")
    op.drop_column("clicks", "twitter_post_id")