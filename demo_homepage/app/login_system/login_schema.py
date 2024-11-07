from pydantic import BaseModel


# 로그인 시 필요한 토큰을 위해 사용하는 model
class Token(BaseModel):
    access_token:   str
    token_type:     str
