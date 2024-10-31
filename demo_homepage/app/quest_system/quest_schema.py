from datetime import datetime

from pydantic import BaseModel, field_validator
from pydantic_core.core_schema import FieldValidationInfo


# quest model for quest making
class QuestCreate(BaseModel):
    userid:         str
    questtitle:     str
    questtype:      str
    questcontent:   str

    @field_validator('userid', 'questtitle', 'questcontent', 'questtype')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v


# quest model for quest update
class QuestUpdate(BaseModel):
    userid:         str
    questtitleup: str | None = None
    questtypeup: str | None = None
    questcontentup: str | None = None
    updatetime: datetime | None = None

    @field_validator('questtitleup', 'questtypeup', 'questcontentup', mode="before")
    @staticmethod
    def check_not_all_fields_empty(v, values):
        # Ensure at least one of the fields is provided
        if not any([values.get('questtitleup'), values.get('questtypeup'), values.get('questcontentup')]):
            raise ValueError("At least one field must be provided!")
        return v
