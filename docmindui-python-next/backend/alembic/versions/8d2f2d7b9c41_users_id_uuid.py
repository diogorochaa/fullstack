"""users id uuid

Revision ID: 8d2f2d7b9c41
Revises: 3343f8aebd7e
Create Date: 2026-05-11 22:30:00.000000

"""

import uuid
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8d2f2d7b9c41"
down_revision: str | Sequence[str] | None = "3343f8aebd7e"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("users", sa.Column("id_uuid", sa.Uuid(), nullable=True))

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id FROM users ORDER BY id")).scalars().all()
    for old_id in rows:
        bind.execute(
            sa.text("UPDATE users SET id_uuid = :new_id WHERE id = :old_id"),
            {"new_id": str(uuid.uuid4()), "old_id": old_id},
        )

    op.drop_constraint("users_pkey", "users", type_="primary")
    op.drop_column("users", "id")
    op.alter_column("users", "id_uuid", new_column_name="id", nullable=False)
    op.create_primary_key("users_pkey", "users", ["id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("users", sa.Column("id_int", sa.Integer(), autoincrement=True, nullable=True))

    bind = op.get_bind()
    rows = bind.execute(sa.text("SELECT id FROM users ORDER BY created_at, id")).scalars().all()
    for index, current_id in enumerate(rows, start=1):
        bind.execute(
            sa.text("UPDATE users SET id_int = :id_int WHERE id = :current_id"),
            {"id_int": index, "current_id": current_id},
        )

    op.drop_constraint("users_pkey", "users", type_="primary")
    op.drop_column("users", "id")
    op.alter_column("users", "id_int", new_column_name="id", nullable=False)
    op.create_primary_key("users_pkey", "users", ["id"])
