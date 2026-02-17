"""add publicado fields to twitter_posts

Revision ID: a83bc4e95809
Revises: add_tweet_text
Create Date: 2026-02-16 20:53:51.613062

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a83bc4e95809'
down_revision: Union[str, Sequence[str], None] = 'add_tweet_text'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade():
    op.add_column(
        "twitter_posts",
        sa.Column("publicado", sa.Boolean(), nullable=False, server_default=sa.text("false"))
    )

    op.add_column(
        "twitter_posts",
        sa.Column("publicado_em", sa.DateTime(), nullable=True)
    )


def downgrade():
    op.drop_column("twitter_posts", "publicado_em")
    op.drop_column("twitter_posts", "publicado")
