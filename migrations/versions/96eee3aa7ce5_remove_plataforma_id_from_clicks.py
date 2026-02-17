"""remove plataforma_id from clicks

Revision ID: 96eee3aa7ce5
Revises: 4ecd9810f022
Create Date: 2026-02-17 03:21:13.605983

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '96eee3aa7ce5'
down_revision: Union[str, Sequence[str], None] = '4ecd9810f022'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade():
    op.drop_column('clicks', 'plataforma_id')

def downgrade():
    op.add_column(
        'clicks',
        sa.Column('plataforma_id', sa.Integer(), nullable=False)
    )
