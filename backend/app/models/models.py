from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class PostVerificationRequest(BaseModel):
    action: Literal["approve", "reject"]
    reason: Optional[str] = None  # only needed if rejecting

class ReportDecisionRequest(BaseModel):
    action: Literal["approve", "reject"]

class UpdateAnnouncement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publishDate: Optional[datetime] = None
    type: Optional[str] = None

#----------------------------------------------------------------------------------------------------------------------
#rock markers
class Rock(BaseModel):
    rockId: str
    rockName: str
    rockType: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    createdAt: Optional[datetime] = None
    confidence: Optional[float] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

class Announcement(BaseModel):
    announcementId: str
    title: str
    description: str
    type: str
    publishDate: Optional[datetime] = None 
    createdBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    isVisible: Optional[bool] = None
    pinned: Optional[bool] = None
    imageUrl: Optional[str] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

class Quest(BaseModel):
    questId: str
    title: str
    description: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

class DailyQuest(BaseModel):
    questId: str
    title: str
    description: str
    createdAt: Optional[datetime] = None

class Report(BaseModel):
    reportedId: str
    reportedItemType: Literal["post", "fact"]
    reason: str
    status: Literal["pending", "approve", "reject"] = "pending"
    reportedBy: Optional[str] = None
    reportedAt: Optional[datetime] = None
    reviewedBy: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    adminAction: Optional[str] = None

#all three
class Post(BaseModel):
    #post section
    postId: Optional[str] = None 
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
    #update section
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

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

#geologist
class Fact(BaseModel):
    factId: Optional[str] = None
    title: str
    description: str
    createdBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

class UpdateFact(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

#player
class Collection(BaseModel):
    rockId: str #must match to an existing rockId in Rock
    imageUrl: Optional[str] = None #hold the image from user
    savedAt: Optional[datetime] = None
    name: Optional[str] = None

class DailyQuestStatus(BaseModel):
    questId: str
    title: str
    description: str
    completed: bool
    completedAt: Optional[datetime] = None

class Achievement(BaseModel):
    achievementId: str
    title: str
    description: str
    milestone: int  # e.g., 1, 5, 10
    type: str  # e.g., "scan_rock", "save_rock"
    badgeUrl: Optional[str] = None

class PlayerAchievement(BaseModel):
    achievementId: str
    title: str
    description: str
    milestone: int
    type: str
    badgeUrl: Optional[str] = None
    unlockedAt: Optional[datetime] = None
