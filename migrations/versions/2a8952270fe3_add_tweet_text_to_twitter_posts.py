from alembic import op
import sqlalchemy as sa

revision = "add_tweet_text"
down_revision = "add_twitter_posts"  # ajuste se necessário
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "twitter_posts",
        sa.Column("tweet_text", sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_column("twitter_posts", "tweet_text")
