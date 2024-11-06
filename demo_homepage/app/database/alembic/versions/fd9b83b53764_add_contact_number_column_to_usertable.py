"""Add contact_number column to UserTable

Revision ID: fd9b83b53764
Revises: 
Create Date: 2024-11-05 14:31:42.147356

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fd9b83b53764'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add contact_number column to demo_users table
    op.add_column('demo_users', sa.Column('contact_number', sa.String(length=15), nullable=True))


def downgrade() -> None:
    # Remove contact_number column from demo_users table
    op.drop_column('demo_users', 'contact_number')
