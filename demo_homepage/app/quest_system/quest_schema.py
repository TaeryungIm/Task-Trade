from datetime import datetime
from pydantic import BaseModel, field_validator, EmailStr


# quest model for quest making
class QuestCreate(BaseModel):
    userid:         EmailStr
    questtitle:     str
    questtype:      str
    questcontent:   str

    @field_validator('questtitle', 'questcontent', 'questtype')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v


# quest model for quest update
class QuestUpdate(BaseModel):
    userid:         EmailStr
    questtitleup:   str | None = None
    questtypeup:    str | None = None
    questcontentup: str | None = None
    updatetime:     datetime | None = None

    @field_validator('questtitleup', 'questtypeup', 'questcontentup', mode="before")
    @staticmethod
    def check_not_all_fields_empty(v, values):
        # Ensure at least one of the fields is provided
        if not any([values.get('questtitleup'), values.get('questtypeup'), values.get('questcontentup')]):
            raise ValueError("At least one field must be provided!")
        return v


class QuestRequest(BaseModel):
    id: int


class QuestResponse(BaseModel):
    quest_title:    str
    quest_type:     str
    userid:         EmailStr
    updated_at:     datetime

    class Config:
        from_attributes = True  # Use from_attributes instead of orm_mode
