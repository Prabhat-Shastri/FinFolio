from pydantic import BaseModel

# Schema for user login
class LoginRequest(BaseModel):
    username: str
    password: str

# Schema for storing access token
class AccessTokenRequest(BaseModel):
    username: str
    public_token: str

class ExchangePublicTokenRequest(BaseModel):
    username: str
    public_token: str

class SetGoalRequest(BaseModel):
    username: str
    amount: int
    time_months: int
