from fastapi import Depends, APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import User, Rock, Fact, Announcement, UpdateAnnouncement

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# DASHBOARD 
@admin_router.get("/dashboard/users")
def get_user_count(user=Depends(verify_token)):
    count = len(list(db.collection("user").stream()))
    return {"totalUsers": count}

@admin_router.get("/dashboard/rocks")
def get_rock_count(user=Depends(verify_token)):
    count = len(list(db.collection("rock").stream()))
    return {"totalRocks": count}

@admin_router.get("/dashboard/posts")
def get_post_count(user=Depends(verify_token)):
    count = len(list(db.collection("post").stream()))
    return {"totalPosts": count}

@admin_router.get("/dashboard/facts")
def get_fact_count(user=Depends(verify_token)):
    count = len(list(db.collection("fact").stream()))
    return {"totalFacts": count}

@admin_router.get("/dashboard/reports")
def get_report_count(user=Depends(verify_token)):
    count = len(list(db.collection("reports").stream()))
    return {"totalReports": count}

# USER MANAGEMENT
@admin_router.get("/users")
def get_all_users(role: Optional[str] = None, email: Optional[str] = None, user=Depends(verify_token)):
    query = db.collection("user")
    if role:
        query = query.where("type", "==", role)
    if email:
        query = query.where("email", "==", email)
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.put("/suspend-user/{user_id}")
def suspend_user(user_id: str, user=Depends(verify_token)):
    ref = db.collection("user").document(user_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.update({"suspended": True, "suspendedAt": firestore.SERVER_TIMESTAMP})
    return {"message": f"User {user_id} suspended"}

# ROCK DATABASE MANAGEMENT
@admin_router.get("/rocks")
def get_all_rocks(user=Depends(verify_token)):
    docs = db.collection("rock").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-rock")
def add_rock(data: dict, user=Depends(verify_token)):
    data["createdAt"] = firestore.SERVER_TIMESTAMP
    db.collection("rock").add(data)
    return {"message": "Rock added"}

@admin_router.put("/edit-rock/{rock_id}")
def edit_rock(rock_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("rock").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.update(data)
    return {"message": "Rock updated"}

@admin_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_token)):
    ref = db.collection("rock").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.delete()
    return {"message": "Rock deleted"}

# REPORT MANAGEMENT
@admin_router.get("/reports")
def get_reports(user=Depends(verify_token)):
    docs = db.collection("reports").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-report/{report_id}")
def delete_report(report_id: str, user=Depends(verify_token)):
    ref = db.collection("reports").document(report_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Report not found")
    ref.delete()
    return {"message": "Report deleted"}

@admin_router.put("/update-report/{report_id}")
def update_report_status(report_id: str, status: str, user=Depends(verify_token)):
    ref = db.collection("reports").document(report_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Report not found")
    ref.update({"status": status, "updatedAt": firestore.SERVER_TIMESTAMP})
    return {"message": "Report updated"}

# FACT MANAGEMENT
@admin_router.get("/facts")
def get_all_facts(user=Depends(verify_token)):
    docs = db.collection("fact").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-fact/{fact_id}")
def delete_fact(fact_id: str, user=Depends(verify_token)):
    ref = db.collection("fact").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.delete()
    return {"message": "Fact deleted"}

# ANNOUNCEMENTS 
@admin_router.get("/announcements")
def get_announcements(user=Depends(verify_token)):
    docs = db.collection("announcement").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-announcement")
def add_announcement(data: Announcement, user=Depends(verify_token)):
    a_data = data.dict()
    a_data["createdAt"] = firestore.SERVER_TIMESTAMP
    db.collection("announcement").add(a_data)
    return {"message": "Announcement added"}

@admin_router.put("/update-announcement/{announcement_id}")
def update_announcement(announcement_id: str, data: UpdateAnnouncement, user=Depends(verify_token)):
    ref = db.collection("announcement").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ref.update(data)
    return {"message": "Announcement updated"}

@admin_router.delete("/delete-announcement/{announcement_id}")
def delete_announcement(announcement_id: str, user=Depends(verify_token)):
    ref = db.collection("announcement").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ref.delete()
    return {"message": "Announcement deleted"}

# QUEST MANAGEMENT
@admin_router.get("/quests")
def get_quests(user=Depends(verify_token)):
    docs = db.collection("quest").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-quest")
def add_quest(data: dict, user=Depends(verify_token)):
    data["createdAt"] = firestore.SERVER_TIMESTAMP
    db.collection("quest").add(data)
    return {"message": "Quest added"}

@admin_router.put("/edit-quest/{quest_id}")
def edit_quest(quest_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("quest").document(quest_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Quest not found")
    ref.update(data)
    return {"message": "Quest updated"}

@admin_router.delete("/delete-quest/{quest_id}")
def delete_quest(quest_id: str, user=Depends(verify_token)):
    ref = db.collection("quests").document(quest_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Quest not found")
    ref.delete()
    return {"message": "Quest deleted"}

# POST MANAGEMENT
@admin_router.post("/add-post")
def add_post(data: dict, user=Depends(verify_token)):
    data["createdAt"] = firestore.SERVER_TIMESTAMP
    data["role"] = "admin"
    data["uploadedBy"] = user["uid"]
    db.collection("post").add(data)
    return {"message": "Post added"}

@admin_router.put("/edit-post/{post_id}")
def edit_post(post_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("post").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.update(data)
    return {"message": "Post updated"}

@admin_router.delete("/delete-post/{post_id}")
def delete_post(post_id: str, user=Depends(verify_token)):
    ref = db.collection("post").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": "Post deleted"}