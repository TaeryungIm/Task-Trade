from pydantic import BaseModel, field_validator, EmailStr
from pydantic_core.core_schema import FieldValidationInfo


# account making 에 사용하는 model
class UserCreate(BaseModel):
    user_id:         EmailStr
    user_name:       str
    gender:         str
    age:            int
    contact:        str
    password:       str
    conf_password:  str
    balance:        int

    @field_validator('user_name', 'age', 'gender', 'contact', 'user_id', 'password', 'conf_password')
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
    cur_id:      EmailStr
    upd_pw:      str
    conf_upd_pw: str

    @field_validator('upd_pw', 'conf_upd_pw')
    def not_empty(cls, v):
        if isinstance(v, str):  # Only strip if the value is a string
            if not v or not v.strip():
                raise ValueError('빈칸을 채워주세요')  # "Please fill in the blank" in Korean
        elif v is None:  # Handle the case where the field is None
            raise ValueError('빈칸을 채워주세요')
        return v

    @field_validator('conf_upd_pw')
    def passwords_match(cls, v, info: FieldValidationInfo):
        if 'upd_pw' in info.data and v != info.data['upd_pw']:
            raise ValueError('비밀번호가 일치하지 않습니다')  # "Passwords do not match" in Korean
        return v
