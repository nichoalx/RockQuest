from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from app.models import Rock
from app.firebase import db

player_router = APIRouter(prefix="/player", tags=["Player"])

#ROCK COLLECTION 
@player_router.get("/rocks", response_model=List[Rock])
def get_player_rocks(type: Optional[str] = Query(None)):
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
def add_rock(rock: Rock):
    rock_data = rock.dict(exclude_unset=True)
    rock_data["createdAt"] = datetime.utcnow()
    doc_ref = db.collection("rocks").document()
    doc_ref.set(rock_data)
    return {"message": "Rock added", "id": doc_ref.id}

@player_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str):
    doc = db.collection("rocks").document(rock_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    db.collection("rocks").document(rock_id).delete()
    return {"message": "Rock deleted", "id": rock_id}

#POSTS
@player_router.post("/add-post")
def add_post(data: dict):
    data["createdAt"] = datetime.utcnow()
    doc_ref = db.collection("posts").document()
    doc_ref.set(data)
    return {"message": "Post added", "id": doc_ref.id}

@player_router.put("/edit-post/{post_id}")
def edit_post(post_id: str, data: dict):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.update(data)
    return {"message": "Post updated"}

@player_router.delete("/delete-post/{post_id}")
def delete_post(post_id: str):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": "Post deleted"}

@player_router.get("/my-posts")
def get_my_posts():
    # Replace with Firebase Auth UID
    docs = db.collection("posts").where("uploadedBy", "==", "rock_hunter_01").stream()
    posts = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    return posts

@player_router.post("/report-post")
def report_post(post_id: str, reason: str):
    ref = db.collection("reports").document()
    ref.set({"postId": post_id, "reason": reason, "reportedAt": datetime.utcnow()})
    return {"message": "Post reported"}

#QUESTS
@player_router.get("/daily-quests")
def get_daily_quests():
    return {
        "quests": [
            {"id": "q1", "description": "Find an igneous rock"},
            {"id": "q2", "description": "Scan 3 rocks today"},
        ],
        "completed": False
    }

#FACTS & ANNOUNCEMENTS
@player_router.get("/facts")
def get_facts():
    docs = db.collection("facts").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@player_router.get("/announcements")
def get_announcements():
    docs = db.collection("announcements").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

#PROFILE
@player_router.get("/profile")
def get_profile():
    return {
        "username": "rock_hunter_01",
        "email": "user@example.com",
        "badges": ["First Scan", "Explorer Level 1"],
        "totalRocksScanned": 15
    }

@player_router.put("/update-profile")
def update_profile(data: dict):
    # Replace with actual user update logic
    return {"message": "Profile updated", "data": data}

@player_router.delete("/delete-account")
def delete_account():
    # Add Firebase Auth delete + Firestore cleanup
    return {"message": "Account deleted"}

@player_router.get("/achievements")
def get_achievements():
    return {
        "badges": [
            {"title": "First Scan", "earned": True},
            {"title": "Explorer Level 1", "earned": True},
            {"title": "Geology Guru", "earned": False}
        ]
    }
