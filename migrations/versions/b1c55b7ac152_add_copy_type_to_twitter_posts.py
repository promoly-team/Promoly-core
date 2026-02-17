"""add copy_type to twitter_posts

Revision ID: b1c55b7ac152
Revises: a83bc4e95809
Create Date: 2026-02-17 02:27:21.191391

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1c55b7ac152'
down_revision: Union[str, Sequence[str], None] = 'a83bc4e95809'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade():
    op.add_column(
        "twitter_posts",
        sa.Column("copy_type", sa.String(), nullable=True)
    )


def downgrade():
    op.drop_column("twitter_posts", "copy_type")