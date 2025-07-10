from pydantic import BaseModel
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
    uploadedBy: Optional[str] = None
    confidence: Optional[float] = None
