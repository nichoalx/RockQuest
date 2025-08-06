from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

# ⬇️ Moved up for clarity, no change in logic
class PostVerificationRequest(BaseModel):
    action: Literal["approve", "reject"]
    reason: Optional[str] = None  # only needed if rejecting

# ✅ Fully compatible with FastAPI validation
class ReportDecisionRequest(BaseModel):
    action: Literal["approve", "reject"]

# ----------------------------------------------------------------------------------------------------------------------
# Rock markers (Database Reference)
class Rock(BaseModel):
    rockId: str
    rockName: str
    rockType: Optional[str] = None
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

# Rock Distribution (Spawned Rock Marker)
class RockSpawn(BaseModel):
    rockId: str  # must match to an existing rockId in Rock
    lat: float
    lng: float
    confidence: Optional[float] = None
    spawnedAt: Optional[datetime] = None
    spawnedBy: Optional[str] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

# ----------------------------------------------------------------------------------------------------------------------
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

class UpdateAnnouncement(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publishDate: Optional[datetime] = None
    type: Optional[str] = None

class Quest(BaseModel):
    questId: str
    title: str
    description: str
    type: Literal["GPS-based", "Collection", "Identification"]
    difficulty: Literal["Easy", "Medium", "Hard"]
    location: str
    reward: str
    status: Literal["Draft", "Active", "Past"] = "Active"
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

class UpdateQuest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[Literal["GPS-based", "Collection", "Identification"]] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    location: Optional[str] = None
    reward: Optional[str] = None
    status: Optional[Literal["Draft", "Active", "Past"]] = None

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

class Post(BaseModel):
    postId: Optional[str] = None 
    rockname: str
    description: str
    information: str
    image: str
    createdBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    verified: bool = False
    verifiedBy: Optional[str] = None
    verifiedAt: Optional[datetime] = None
    rejectedReason: Optional[str] = None
    rejectedAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    updatedBy: Optional[str] = None

# User
class User(BaseModel):
    username: str
    emailAddress: EmailStr
    type: Literal["player", "geologist", "admin"] = "player"
    createdAt: Optional[datetime] = None
    dob: Optional[datetime] = None
    description: Optional[str] = None
    avatarId: int = 1
    isActive: bool = True

# Geologist
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

# Player
class Collection(BaseModel):
    rockId: str
    imageUrl: Optional[str] = None
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
    milestone: int
    type: str
    badgeUrl: Optional[str] = None

class PlayerAchievement(BaseModel):
    achievementId: str
    title: str
    description: str
    milestone: int
    type: str
    badgeUrl: Optional[str] = None
    unlockedAt: Optional[datetime] = None
