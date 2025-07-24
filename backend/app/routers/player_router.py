from fastapi import Depends, APIRouter, HTTPException, Query, UploadFile, File
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
        query = db.collection("rock")
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
    rock_data["createdAt"] = firestore.SERVER_TIMESTAMP
    db.collection("rock").add(rock_data)
    return {"message": "Rock added"}

@player_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_token)):
    doc = db.collection("rock").document(rock_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    db.collection("rock").document(rock_id).delete()
    return {"message": "Rock deleted"}

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

@player_router.post("/complete-quest/{quest_id}")
def complete_quest(quest_id: str, lat: float = Query(...), lng: float = Query(...), user=Depends(verify_token)):
    # Dummy logic, should use geofence comparison in production
    db.collection("quest_completions").add({
        "questId": quest_id,
        "completedBy": user["uid"],
        "lat": lat,
        "lng": lng,
        "completedAt": firestore.SERVER_TIMESTAMP
    })
    return {"message": f"Quest {quest_id} completed"}

# GPS NEARBY ROCKS
@player_router.get("/gps-rocks")
def get_nearby_rocks(lat: float, lng: float, radius: float = 0.01, user=Depends(verify_token)):
    # Simulate basic filtering (no Firestore geoqueries)
    docs = db.collection("rock").stream()
    nearby = []
    for doc in docs:
        rock = doc.to_dict()
        if "lat" in rock and "lng" in rock:
            if abs(rock["lat"] - lat) <= radius and abs(rock["lng"] - lng) <= radius:
                rock["id"] = doc.id
                nearby.append(rock)
    return nearby

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

# ROCK SCANNING (Still Mock)
@player_router.post("/scan-rock")
def scan_rock(file: UploadFile = File(...), user=Depends(verify_token)):
    # Simulate prediction
    return {
        "predictedType": "Granite",
        "confidenceScore": 0.87,
        "details": "Grainy igneous rock with quartz and feldspar."
    }
