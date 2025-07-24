from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class PostVerificationRequest(BaseModel):
    action: Literal["approve", "reject"]
    reason: Optional[str] = None  # only needed if rejecting

#admin
#rock markers
class Rock(BaseModel):
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    createdAt: Optional[datetime] = None
    confidence: Optional[float] = None

class Announcement(BaseModel):
    title: str
    content: str
    createdAt: Optional[datetime] = None

class UpdateAnnouncement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Quest(BaseModel):
    title: str
    description: str
    createdAt: Optional[datetime] = None

class ReportDecisionRequest(BaseModel):
    action: Literal["approve", "reject"]


#user
class User(BaseModel):
    username: str
    emailAddress: EmailStr
    type: Literal["player", "geologist", "admin"] = "player" #only allow player or geologist, default player
    createdAt: Optional[datetime] = None
    dob: Optional[datetime] = None
    description: Optional[str] = None
    avatarId: int = 1
    isActive: bool = True #True if user is active, False if user is suspended

class Post(BaseModel):
    #post section
    rockname: str
    description: str
    information: str
    image: str
    createdBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    #review section
    verified: bool = False
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[datetime] = None
    rejectedReason: Optional[str] = None
    rejectedAt: Optional[datetime] = None

#geologist
class Fact(BaseModel):
    title: str
    description: str
    createdBy: Optional[str] = None
    createdAt: Optional[datetime] = None

class UpdateFact(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

#player
class Collection(BaseModel):
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: Optional[datetime] = None