from pydantic import BaseModel, field_validator, EmailStr
from pydantic_core.core_schema import FieldValidationInfo

class UserCreate(BaseModel):
    userid  : str
    username: str
    gender  : str
    age     : int
    password1: str
    password2: str
    email: EmailStr

    @field_validator('username', 'age', 'gender', 'userid', 'password1', 'password2', 'email')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v

    @field_validator('password2')
    def passwords_match(cls, v, info: FieldValidationInfo):
        if 'password1' in info.data and v != info.data['password1']:
            raise ValueError('비밀번호가 일치하지 않습니다')  # "Passwords do not match" in Korean
        return v

