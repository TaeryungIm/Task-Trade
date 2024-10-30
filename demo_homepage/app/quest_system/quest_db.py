from sqlalchemy.orm import Session
from app.quest_system.quest_schema import QuestCreate
from app.database.models import QuestTable


def create_quest(db: Session, quest_create: QuestCreate):
    db_quest = QuestTable(
        quest_title=quest_create.questtitle,
        quest_type=quest_create.questtype,
        quest_content=quest_create.questcontent,
        created_at=quest_create.createtime,
        updated_at=quest_create.updatetime
    )
    db.add(db_quest)
    try:
        db.commit()
        return f"New quest, title of {quest_create.questtitle} created..."
    except:
        db.rollback()
        return "Error creating quest"

