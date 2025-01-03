from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator, EmailStr, Field, root_validator


class QuestCreate(BaseModel):
    user_id: EmailStr
    quest_type: str = Field(..., max_length=50, description="Type of the quest")  # Limit length for safety
    quest_title: str = Field(..., max_length=50, description="Title of the quest")
    quest_specifics: str = Field(..., max_length=500, description="Details of the quest")
    quest_conditions: str = Field(..., max_length=200, description="Conditions for participation")
    quest_budget: int = Field(..., ge=0, description="Budget for the quest, must be >= 0")
    quest_personnel: int = Field(..., ge=1, description="Number of participants, must be >= 1")
    quest_period: int = Field(..., ge=1, le=365, description="Period in days, 1-365 days allowed")

    @field_validator('quest_type', 'quest_title', 'quest_specifics', 'quest_conditions', mode='after')
    def not_empty_string(cls, v):
        if not v.strip():
            raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        return v

    @field_validator('quest_budget', 'quest_personnel', 'quest_period', mode='after')
    def positive_values(cls, v):
        if v is None or v < 0:
            raise ValueError('빈칸을 채워주세요')  # Handle invalid numeric fields as well
        return v


class QuestUpdate(BaseModel):
    user_id: EmailStr
    quest_type_upd: Optional[str] = Field(None, max_length=50, description="Type of the quest")
    quest_title_upd: Optional[str] = Field(None, max_length=50, description="Title of the quest")
    quest_specifics_upd: Optional[str] = Field(None, max_length=500, description="Details of the quest")
    quest_conditions_upd: Optional[str] = Field(None, max_length=200, description="Conditions for participation")
    quest_budget_upd: Optional[int] = Field(None, ge=0, description="Budget for the quest, must be >= 0")
    quest_personnel_upd: Optional[int] = Field(None, ge=1, description="Number of participants, must be >= 1")
    quest_period_upd: Optional[int] = Field(None, ge=1, le=365, description="Period in days, 1-365 days allowed")
    update_time: Optional[datetime] = Field(None, description="Time of the update")

    @root_validator(pre=True)
    def check_not_all_fields_empty(cls, values):
        # Ensure at least one of the update fields is provided
        if not any([
            values.get('quest_type_upd'),
            values.get('quest_title_upd'),
            values.get('quest_specifics_upd'),
            values.get('quest_conditions_upd'),
            values.get('quest_budget_upd'),
            values.get('quest_personnel_upd'),
            values.get('quest_period_upd')
        ]):
            raise ValueError("At least one field must be provided for the update!")
        return values


class QuestRequest(BaseModel):
    quest_index: int


class QuestResponse(BaseModel):
    quest_type:     str
    quest_title:    str
    user_id:        EmailStr
    updated_at:     datetime

    class Config:
        from_attributes = True  # Use from_attributes instead of orm_mode
