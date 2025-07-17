from fastapi import Depends, APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from app.auth.dependencies import verify_token
from app.models.models import Rock
from app.firebase import db

player_router = APIRouter(prefix="/player", tags=["Player"])

# ROCK COLLECTION 
@player_router.get("/rocks", response_model=List[Rock])
def get_player_rocks(type: Optional[str] = Query(None), user=Depends(verify_token)):
    try:
        query = db.collection("rocks")
        if type:
            query = query.where("type", "==", type)
        docs = query.stream()
        rocks = []
        for doc in docs:
            rock = doc.to_dict()
            rock["id"] = doc.id
            rocks.append(rock)
        return rocks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@player_router.post("/add-rock")
def add_rock(rock: Rock, user=Depends(verify_token)):
    rock_data = rock.dict(exclude_unset=True)
    rock_data["createdAt"] = datetime.utcnow()
    doc_ref = db.collection("rocks").document()
    doc_ref.set(rock_data)
    return {"message": "Rock added", "id": doc_ref.id}

@player_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_token)):
    doc = db.collection("rocks").document(rock_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    db.collection("rocks").document(rock_id).delete()
    return {"message": "Rock deleted", "id": rock_id}

# QUESTS
@player_router.get("/daily-quests")
def get_daily_quests(user=Depends(verify_token)):
    return {
        "quests": [
            {"id": "q1", "description": "Find an igneous rock"},
            {"id": "q2", "description": "Scan 3 rocks today"},
        ],
        "completed": False
    }

# ACHIEVEMENTS
@player_router.get("/achievements")
def get_achievements(user=Depends(verify_token)):
    return {
        "badges": [
            {"title": "First Scan", "earned": True},
            {"title": "Explorer Level 1", "earned": True},
            {"title": "Geology Guru", "earned": False}
        ]
    }
