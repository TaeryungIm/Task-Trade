from pydantic import BaseModel, field_validator, EmailStr
from pydantic_core.core_schema import FieldValidationInfo


# account making 에 사용하는 model
class UserCreate(BaseModel):
    userid:         EmailStr
    username:       str
    gender:         str
    age:            int
    contact:        str
    password:       str
    conf_password:  str
    balance:        int

    @field_validator('username', 'age', 'gender', 'contact', 'userid', 'password', 'conf_password')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v

    @field_validator('conf_password')
    def passwords_match(cls, v, info: FieldValidationInfo):
        if 'password' in info.data and v != info.data['password']:
            raise ValueError('비밀번호가 일치하지 않습니다')  # "Passwords do not match" in Korean
        return v


# account_modifying 에 사용하는 model
class UserUpdate(BaseModel):
    curid:      EmailStr
    updid:      EmailStr
    updpw:      str
    conf_updpw: str

    @field_validator('updpw', 'conf_updpw')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v

    @field_validator('conf_updpw')
    def passwords_match(cls, v, info: FieldValidationInfo):
        if 'updpw' in info.data and v != info.data['updpw']:
            raise ValueError('비밀번호가 일치하지 않습니다')  # "Passwords do not match" in Korean
        return v
