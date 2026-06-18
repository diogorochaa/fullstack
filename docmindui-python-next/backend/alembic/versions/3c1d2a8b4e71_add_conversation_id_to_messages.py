"""add conversation id to messages

Revision ID: 3c1d2a8b4e71
Revises: 8d2f2d7b9c41
Create Date: 2026-05-11 23:10:00.000000

"""

import uuid
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3c1d2a8b4e71"
down_revision: str | Sequence[str] | None = "b7e8f1d2940a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(sa.text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID"))

    bind = op.get_bind()
    user_ids = (
        bind.execute(
            sa.text(
                "SELECT DISTINCT user_id FROM messages WHERE conversation_id IS NULL AND user_id IS NOT NULL"
            )
        )
        .scalars()
        .all()
    )
    for user_id in user_ids:
        bind.execute(
            sa.text(
                "UPDATE messages SET conversation_id = :conversation_id WHERE user_id = :user_id AND conversation_id IS NULL"
            ),
            {"conversation_id": str(uuid.uuid4()), "user_id": user_id},
        )

    op.alter_column("messages", "conversation_id", nullable=False)
    op.execute(
        sa.text(
            "CREATE INDEX IF NOT EXISTS ix_messages_user_conv_created_id ON messages (user_id, conversation_id, created_at, id)"
        )
    )


def downgrade() -> None:
    op.drop_index("ix_messages_user_conv_created_id", table_name="messages")
    op.drop_column("messages", "conversation_id")
