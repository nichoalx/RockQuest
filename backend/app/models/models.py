from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

# admin n geo – DO NOT DELETE 
# This model is required for admin and geologist to review posts.
# ensuring consistent and minimal payloads for admin decision input.
class PostVerificationRequest(BaseModel):
    action: Literal["approve", "reject"]
    reason: Optional[str] = None  # only needed if rejecting

# admin – DO NOT DELETE 
# This model handles admin decisions on user reports,
# Keeping it separate ensures clarity and prevents misuse of the full Report model when only an action is needed.
#admin
class ReportDecisionRequest(BaseModel):
    action: Literal["approve", "reject"]
# This model is used specifically for updating announcements.
# It allows partial updates without requiring all fields.
class UpdateAnnouncement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

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
    createdBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    isVisible: Optional[bool] = None
    pinned: Optional[bool] = None
    imageUrl: Optional[str] = None
    tags: Optional[str] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

class Quest(BaseModel):
    questId: str
    title: str
    description: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

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


class ReportRequest(BaseModel):
    postId: str
    reason: str

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
    userID: str
    username: str
    email: EmailStr
    type: Literal["player", "geologist", "admin"] = "player" #only allow player or geologist, default player
    createdAt: Optional[datetime] = None
    dob: Optional[datetime] = None
    description: Optional[str] = None
    avatarId: int = 1
    isActive: bool = True #True if user is active, False if user is suspended

#geologist
class Fact(BaseModel):
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
    name: str
    type: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: Optional[datetime] = None