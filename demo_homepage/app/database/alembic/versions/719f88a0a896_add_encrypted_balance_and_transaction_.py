"""Add encrypted balance and transaction log, update created_at in Quest and Inquiry tables

Revision ID: 719f88a0a896
Revises: 2f21670ba70c
Create Date: 2024-11-07 20:49:49.715118

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGBLOB


# revision identifiers, used by Alembic.
revision: str = '719f88a0a896'
down_revision: Union[str, None] = '2f21670ba70c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Check if the `_balance_encrypted` column already exists in `demo_users`
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('demo_users')]

    # 1. Add encrypted balance field and relationship to UserTable, if not exists
    if '_balance_encrypted' not in columns:
        op.add_column('demo_users', sa.Column('_balance_encrypted', LONGBLOB, nullable=False))

    # 2. Update `created_at` to be non-nullable in QuestTable and InquiryTable
    op.alter_column('demo_quests', 'created_at', existing_type=sa.DateTime, nullable=False)
    op.alter_column('demo_inquiries', 'created_at', existing_type=sa.DateTime, nullable=False)

    # 3. Create TransactionLogTable with encrypted amount field
    op.create_table(
        'demo_transaction_log',
        sa.Column('transaction_id', sa.Integer, primary_key=True, index=True),
        sa.Column('userid', sa.String(50), sa.ForeignKey('demo_users.userid'), nullable=False),
        sa.Column('transaction_type', sa.String(20), nullable=False),
        sa.Column('_amount_encrypted', LONGBLOB, nullable=False),
        sa.Column('balance_after', sa.Integer, nullable=False),
        sa.Column('created_at', sa.DateTime, default=datetime.utcnow, nullable=False),
        sa.Column('notes', sa.Text, nullable=True)
    )


def downgrade():
    # 1. Remove TransactionLogTable
    op.drop_table('demo_transaction_log')

    # 2. Revert `created_at` columns to nullable in QuestTable and InquiryTable
    op.alter_column('demo_quests', 'created_at', existing_type=sa.DateTime, nullable=True)
    op.alter_column('demo_inquiries', 'created_at', existing_type=sa.DateTime, nullable=True)

    # 3. Remove encrypted balance field from UserTable, if exists
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('demo_users')]

    if '_balance_encrypted' in columns:
        op.drop_column('demo_users', '_balance_encrypted')
