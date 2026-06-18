"""create documentos and document_chunks

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-03 10:01:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    is_pg = bind.dialect.name == "postgresql"

    op.create_table(
        "documentos",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("titulo", sa.String(length=500), nullable=False),
        sa.Column("palavras_chave", sa.Text(), nullable=False, server_default=""),
        sa.Column("resumo", sa.Text(), nullable=False, server_default=""),
        sa.Column("arquivo_original", sa.String(length=1024), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    if is_pg:
        op.execute(
            """
            CREATE TABLE document_chunks (
                id BIGSERIAL PRIMARY KEY,
                documento_id UUID NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                embedding vector(1536),
                metadata JSONB
            )
            """
        )
        op.execute(
            "CREATE INDEX ix_document_chunks_documento_id ON document_chunks (documento_id)"
        )
        op.execute(
            "CREATE INDEX ix_document_chunks_embedding_hnsw ON document_chunks "
            "USING hnsw (embedding vector_cosine_ops)"
        )
    else:
        op.create_table(
            "document_chunks",
            sa.Column(
                "id",
                sa.BigInteger().with_variant(sa.Integer(), "sqlite"),
                autoincrement=True,
                nullable=False,
            ),
            sa.Column("documento_id", sa.Uuid(), nullable=False),
            sa.Column("chunk_index", sa.Integer(), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("embedding", sa.JSON(), nullable=True),
            sa.Column("metadata", sa.JSON(), nullable=True),
            sa.ForeignKeyConstraint(["documento_id"], ["documentos.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_document_chunks_documento_id",
            "document_chunks",
            ["documento_id"],
        )


def downgrade() -> None:
    op.drop_table("document_chunks")
    op.drop_table("documentos")
