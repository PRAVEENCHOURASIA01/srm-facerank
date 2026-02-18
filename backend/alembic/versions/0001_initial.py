"""Initial migration

Revision ID: 0001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_admin", sa.Boolean(), nullable=True, server_default="false"),
        sa.Column("is_banned", sa.Boolean(), nullable=True, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "photos",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cloudinary_public_id", sa.String(255), nullable=False),
        sa.Column("image_url", sa.String(512), nullable=False),
        sa.Column("uploaded_by_user_id", sa.Integer(), nullable=False),
        sa.Column("elo_rating", sa.Float(), nullable=True, server_default="1000.0"),
        sa.Column("wins", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("losses", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("total_votes", sa.Integer(), nullable=True, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["uploaded_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_photos_id"), "photos", ["id"], unique=False)

    op.create_table(
        "votes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("voter_user_id", sa.Integer(), nullable=False),
        sa.Column("winner_photo_id", sa.Integer(), nullable=False),
        sa.Column("loser_photo_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["loser_photo_id"], ["photos.id"]),
        sa.ForeignKeyConstraint(["voter_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["winner_photo_id"], ["photos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_votes_id"), "votes", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_votes_id"), table_name="votes")
    op.drop_table("votes")
    op.drop_index(op.f("ix_photos_id"), table_name="photos")
    op.drop_table("photos")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")