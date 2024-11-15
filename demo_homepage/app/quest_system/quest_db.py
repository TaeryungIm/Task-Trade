from datetime import datetime
from sqlalchemy.orm import scoped_session

from app.quest_system.quest_schema import QuestCreate, QuestUpdate

from app.database.models import QuestTable
from app.database.database import SessionLocal

session = scoped_session(SessionLocal)


def create_quest(db: session, quest_create: QuestCreate):
    db_quest = QuestTable(
        quest_title=quest_create.quest_title,
        quest_type=quest_create.quest_type,
        quest_content=quest_create.quest_content,
        userid=quest_create.user_id,  # use userid as a key
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_quest)
    try:
        db.commit()
        return f"New quest title of {quest_create.quest_title} created..."
    except:
        db.rollback()
        return "Error creating quest!"


def update_quest(db: session, quest_update: QuestUpdate):
    db_quest = db.query(QuestTable).filter(QuestTable.userid == quest_update.user_id).first()
    if db_quest is None:
        return "Quest not found!"

    # update the quest data
    db_quest.quest_title = quest_update.quest_title_upd \
        if quest_update.quest_title_upd else db_quest.quest_title
    db_quest.quest_type = quest_update.quest_type_upd \
        if quest_update.quest_type_upd else db_quest.quest_type
    db_quest.quest_content = quest_update.quest_content_upd \
        if quest_update.quest_content_upd else db_quest.quest_content
    db_quest.updated_at = quest_update.update_time \
        if quest_update.update_time else db_quest.created_at
    try:
        db.commit()
        return f"Quest title of {db_quest.quest_title} updated successfully."
    except:
        db.rollback()
        return "Error updating user!"


def get_quest_by_id(db: session, id: int):
    return db.query(QuestTable).filter(QuestTable.id == id).first()
