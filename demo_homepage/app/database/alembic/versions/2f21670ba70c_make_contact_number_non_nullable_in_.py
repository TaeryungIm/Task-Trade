"""Make contact_number non-nullable in UserTable

Revision ID: 2f21670ba70c
Revises: fd9b83b53764
Create Date: 2024-11-05 14:38:51.761809

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f21670ba70c'
down_revision: Union[str, None] = 'fd9b83b53764'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Alter contact_number to be non-nullable
    op.alter_column('demo_users', 'contact_number', existing_type=sa.String(length=15), nullable=False)


def downgrade() -> None:
    # Revert contact_number to be nullable
    op.alter_column('demo_users', 'contact_number', existing_type=sa.String(length=15), nullable=True)
