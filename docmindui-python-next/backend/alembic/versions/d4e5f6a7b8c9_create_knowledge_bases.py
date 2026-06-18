"""create knowledge_bases and link documentos

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-06-03 14:00:00.000000

"""

from typing import Sequence, Union
import uuid

import sqlalchemy as sa
from alembic import op

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_BASES = (
    ("Infraestrutura TI", "infraestrutura-ti"),
    ("Geral", "geral"),
)


def upgrade() -> None:
    op.create_table(
        "knowledge_bases",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=200), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("nome"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_knowledge_bases_slug", "knowledge_bases", ["slug"], unique=True)

    op.add_column(
        "documentos",
        sa.Column("knowledge_base_id", sa.Uuid(), nullable=True),
    )
    op.create_foreign_key(
        "fk_documentos_knowledge_base_id",
        "documentos",
        "knowledge_bases",
        ["knowledge_base_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        "ix_documentos_knowledge_base_id",
        "documentos",
        ["knowledge_base_id"],
    )

    bind = op.get_bind()
    infra_id = uuid.uuid4()
    geral_id = uuid.uuid4()
    bind.execute(
        sa.text(
            "INSERT INTO knowledge_bases (id, nome, slug) VALUES "
            "(:infra_id, :infra_nome, :infra_slug), "
            "(:geral_id, :geral_nome, :geral_slug)"
        ),
        {
            "infra_id": str(infra_id),
            "infra_nome": DEFAULT_BASES[0][0],
            "infra_slug": DEFAULT_BASES[0][1],
            "geral_id": str(geral_id),
            "geral_nome": DEFAULT_BASES[1][0],
            "geral_slug": DEFAULT_BASES[1][1],
        },
    )
    bind.execute(
        sa.text(
            "UPDATE documentos SET knowledge_base_id = :base_id WHERE knowledge_base_id IS NULL"
        ),
        {"base_id": str(infra_id)},
    )


def downgrade() -> None:
    op.drop_index("ix_documentos_knowledge_base_id", table_name="documentos")
    op.drop_constraint("fk_documentos_knowledge_base_id", "documentos", type_="foreignkey")
    op.drop_column("documentos", "knowledge_base_id")
    op.drop_index("ix_knowledge_bases_slug", table_name="knowledge_bases")
    op.drop_table("knowledge_bases")
