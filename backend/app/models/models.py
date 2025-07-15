from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Rock(BaseModel):
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    createdAt: Optional[datetime] = None
    confidence: Optional[float] = None

class User(BaseModel):
    username: str
    emailAddress: EmailStr
    type: Optional[str] = "player"
    createdAt: Optional[datetime] = None
    dob: Optional[datetime] = None
    description: Optional[str] = None
    avatarId: Optional[int] = None
