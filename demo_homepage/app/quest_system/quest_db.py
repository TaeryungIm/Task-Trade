from django.utils.datetime_safe import datetime
from sqlalchemy.orm import Session
from app.quest_system.quest_schema import QuestCreate, QuestUpdate
from app.database.models import QuestTable


def create_quest(db: Session, quest_create: QuestCreate):
    db_quest = QuestTable(
        quest_title=quest_create.questtitle,
        quest_type=quest_create.questtype,
        quest_content=quest_create.questcontent,
        userid=quest_create.userid,  # use userid as a key
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_quest)
    try:
        db.commit()
        return f"New quest title of {quest_create.questtitle} created..."
    except:
        db.rollback()
        return "Error creating quest!"


def update_quest(db: Session, quest_update: QuestUpdate):
    db_quest = db.query(QuestTable).filter(QuestTable.userid == quest_update.userid).first()
    if db_quest is None:
        return "Quest not found!"

    # update the quest data
    db_quest.quest_title = quest_update.questtitleup if quest_update.questtitleup else db_quest.quest_title
    db_quest.quest_type = quest_update.questtypeup if quest_update.questtypeup else db_quest.quest_type
    db_quest.quest_content = quest_update.questcontentup if quest_update.questcontentup else db_quest.quest_content
    db_quest.updated_at = quest_update.updatetime if quest_update.updatetime else db_quest.created_at
    try:
        db.commit()
        return f"Quest title of {db_quest.quest_title} updated successfully."
    except:
        db.rollback()
        return "Error updating user!"


def get_quest_by_id(db: Session, id: int):
    return db.query(QuestTable).filter(QuestTable.id == id).first()
