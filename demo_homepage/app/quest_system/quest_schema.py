from datetime import datetime
from pydantic import BaseModel, field_validator, EmailStr


# quest model for quest making
class QuestCreate(BaseModel):
    user_id:         EmailStr
    quest_title:     str
    quest_type:      str
    quest_content:   str

    @field_validator('quest_title', 'quest_content', 'quest_type')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v


# quest model for quest update
class QuestUpdate(BaseModel):
    user_id:            EmailStr
    quest_title_upd:    str | None = None
    quest_type_upd:     str | None = None
    quest_content_upd:  str | None = None
    update_time:        datetime | None = None

    @field_validator('quest_title_upd', 'quest_type_upd', 'quest_content_upd', mode="before")
    @staticmethod
    def check_not_all_fields_empty(v, values):
        # Ensure at least one of the fields is provided
        if not any([values.get('quest_title_upd'), values.get('quest_type_upd'), values.get('quest_content_up')]):
            raise ValueError("At least one field must be provided!")
        return v


class QuestRequest(BaseModel):
    quest_index: int


class QuestResponse(BaseModel):
    quest_title:    str
    quest_type:     str
    user_id:        EmailStr
    updated_at:     datetime

    class Config:
        from_attributes = True  # Use from_attributes instead of orm_mode
