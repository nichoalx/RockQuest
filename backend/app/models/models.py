from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
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
    type: Literal["player", "geologist", "admin"] = "player" #only allow player or geologist, default player
    createdAt: datetime
    dob: Optional[datetime] = None
    description: Optional[str] = None
    avatarId: int = 1
    isActive: bool = True #True if user is active, False if user is suspended

class announcement(BaseModel):
    title: str
    content: str
    createdAt: datetime

class post(BaseModel):
    content: str
    createdBy: str
    createdAt: datetime
    isApproved: bool = False
    approvedBy: str

class fact(BaseModel):
    content: str
    createdBy: str
    createdAt: datetime

class quest(BaseModel):
    title: str
    description: str

class achivement(BaseModel):
    title: str
    description: str
    badge: int