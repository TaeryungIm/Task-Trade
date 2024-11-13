from pydantic import BaseModel, field_validator, EmailStr


# database model for inquiry being made
class InquiryCreate(BaseModel):
    user_id:         EmailStr
    inquiry_title:   str
    inquiry_content: str
    contact_method:  str

    @field_validator('inquiry_title', 'inquiry_content', 'contact_method')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v


# email model for inquiry being made
class InquiryEmail(BaseModel):
    userid:         EmailStr  # Which can work as email account
    inquiry_title:   str
    inquiry_content: str
    contact_method:  str
