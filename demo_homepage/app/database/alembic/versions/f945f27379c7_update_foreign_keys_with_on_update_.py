"""Update foreign keys with ON UPDATE CASCADE

Revision ID: f945f27379c7
Revises: 719f88a0a896
Create Date: 2024-11-21 02:52:29.871189

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f945f27379c7'
down_revision: Union[str, None] = '719f88a0a896'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Drop and recreate foreign key for InquiryTable
    op.drop_constraint(
        "demo_inquiries_ibfk_1", "demo_inquiries", type_="foreignkey"
    )
    op.create_foreign_key(
        "demo_inquiries_ibfk_1",
        "demo_inquiries",
        "demo_users",
        ["userid"],
        ["userid"],
        ondelete="CASCADE",
        onupdate="CASCADE"
    )

    # Drop and recreate foreign key for QuestTable
    op.drop_constraint(
        "demo_quests_ibfk_1", "demo_quests", type_="foreignkey"
    )
    op.create_foreign_key(
        "demo_quests_ibfk_1",
        "demo_quests",
        "demo_users",
        ["userid"],
        ["userid"],
        ondelete="CASCADE",
        onupdate="CASCADE"
    )

    # Drop and recreate foreign key for TransactionLogTable
    op.drop_constraint(
        "demo_transaction_log_ibfk_1", "demo_transaction_log", type_="foreignkey"
    )
    op.create_foreign_key(
        "demo_transaction_log_ibfk_1",
        "demo_transaction_log",
        "demo_users",
        ["userid"],
        ["userid"],
        ondelete="CASCADE",
        onupdate="CASCADE"
    )

    # Update TransactionLogTable: make userid nullable
    op.alter_column(
        "demo_transaction_log",
        "userid",
        existing_type=sa.String(50),
        nullable=True
    )


def downgrade():
    # Revert TransactionLogTable: make userid non-nullable
    op.alter_column(
        "demo_transaction_log",
        "userid",
        existing_type=sa.String(50),
        nullable=False
    )

    # Drop and recreate foreign key for TransactionLogTable
    op.drop_constraint(
        "demo_transaction_log_ibfk_1", "demo_transaction_log", type_="foreignkey"
    )
    op.create_foreign_key(
        "demo_transaction_log_ibfk_1",
        "demo_transaction_log",
        "demo_users",
        ["userid"],
        ["userid"],
        ondelete="CASCADE"
    )

    # Drop and recreate foreign key for QuestTable
    op.drop_constraint(
        "demo_quests_ibfk_1", "demo_quests", type_="foreignkey"
    )
    op.create_foreign_key(
        "demo_quests_ibfk_1",
        "demo_quests",
        "demo_users",
        ["userid"],
        ["userid"],
        ondelete="CASCADE"
    )

    # Drop and recreate foreign key for InquiryTable
    op.drop_constraint(
        "demo_inquiries_ibfk_1", "demo_inquiries", type_="foreignkey"
    )
    op.create_foreign_key(
        "demo_inquiries_ibfk_1",
        "demo_inquiries",
        "demo_users",
        ["userid"],
        ["userid"],
        ondelete="CASCADE"
    )
