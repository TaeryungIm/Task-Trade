from datetime import datetime

from pydantic import BaseModel, field_validator
from pydantic_core.core_schema import FieldValidationInfo


# quest model for quest making
class QuestCreate(BaseModel):
    questtitle:     str
    questtype:      str
    questcontent:   str
    createtime:     datetime
    updatetime:     datetime

    @field_validator('questtitle', 'questcontent', 'questtype')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v
