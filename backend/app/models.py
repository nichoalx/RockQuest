from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
#Model for data
class Rock(BaseModel):
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    createdAt: Optional[datetime] = None
    uploadedBy: Optional[str] = None
    confidence: Optional[float] = None
#user - xh
class User(BaseModel):
    username: str
    password: str
    emailAddress: EmailStr

class Login(BaseModel):
    username: str
    password: str
    emailAddress: EmailStr
    

