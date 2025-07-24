from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

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
    description: str
    createdAt: datetime

class UpdateAnnouncement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Quest(BaseModel):
    title: str
    description: str

class Achivement(BaseModel):
    title: str
    description: str
    badge: int

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
    isApproved: bool = False
    approvedBy: Optional[str] = None
    rejectedBy: Optional[str] = None
    #report section
    validReport: bool = False #False if not reported, True if reported
    reportType: Optional[str] = None
    reportedBy: Optional[str] = None
    reportedIssue: Optional[str] = None

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