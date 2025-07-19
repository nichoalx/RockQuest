from fastapi import Depends, APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional

from app.auth.dependencies import verify_token
from app.firebase import db

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# DASHBOARD 
@admin_router.get("/dashboard/users")
def get_user_count(user=Depends(verify_token)):
    count = len(list(db.collection("users").stream()))
    return {"totalUsers": count}

@admin_router.get("/dashboard/rocks")
def get_rock_count(user=Depends(verify_token)):
    count = len(list(db.collection("rocks").stream()))
    return {"totalRocks": count}

@admin_router.get("/dashboard/posts")
def get_post_count(user=Depends(verify_token)):
    count = len(list(db.collection("posts").stream()))
    return {"totalPosts": count}

@admin_router.get("/dashboard/facts")
def get_fact_count(user=Depends(verify_token)):
    count = len(list(db.collection("facts").stream()))
    return {"totalFacts": count}

@admin_router.get("/dashboard/reports")
def get_report_count(user=Depends(verify_token)):
    count = len(list(db.collection("reports").stream()))
    return {"totalReports": count}

# USER MANAGEMENT
@admin_router.get("/users")
def get_all_users(role: Optional[str] = None, email: Optional[str] = None, user=Depends(verify_token)):
    query = db.collection("users")
    if role:
        query = query.where("type", "==", role)
    if email:
        query = query.where("email", "==", email)
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.put("/suspend-user/{user_id}")
def suspend_user(user_id: str, user=Depends(verify_token)):
    ref = db.collection("users").document(user_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.update({"suspended": True, "suspendedAt": datetime.utcnow()})
    return {"message": f"User {user_id} suspended"}

# ROCK DATABASE MANAGEMENT
@admin_router.get("/rocks")
def get_all_rocks(user=Depends(verify_token)):
    docs = db.collection("rocks").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-rock")
def add_rock(data: dict, user=Depends(verify_token)):
    data["createdAt"] = datetime.utcnow()
    db.collection("rocks").add(data)
    return {"message": "Rock added"}

@admin_router.put("/edit-rock/{rock_id}")
def edit_rock(rock_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("rocks").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.update(data)
    return {"message": "Rock updated"}

@admin_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_token)):
    ref = db.collection("rocks").document(rock_id)
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
    ref.update({"status": status, "updatedAt": datetime.utcnow()})
    return {"message": "Report updated"}

# FACT MANAGEMENT
@admin_router.get("/facts")
def get_all_facts(user=Depends(verify_token)):
    docs = db.collection("facts").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-fact/{fact_id}")
def delete_fact(fact_id: str, user=Depends(verify_token)):
    ref = db.collection("facts").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.delete()
    return {"message": "Fact deleted"}

# ANNOUNCEMENTS 
@admin_router.get("/announcements")
def get_announcements(user=Depends(verify_token)):
    docs = db.collection("announcements").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-announcement")
def add_announcement(data: dict, user=Depends(verify_token)):
    data["createdAt"] = datetime.utcnow()
    db.collection("announcements").add(data)
    return {"message": "Announcement added"}

@admin_router.put("/update-announcement/{announcement_id}")
def update_announcement(announcement_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("announcements").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ref.update(data)
    return {"message": "Announcement updated"}

@admin_router.delete("/delete-announcement/{announcement_id}")
def delete_announcement(announcement_id: str, user=Depends(verify_token)):
    ref = db.collection("announcements").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ref.delete()
    return {"message": "Announcement deleted"}

# QUEST MANAGEMENT
@admin_router.get("/quests")
def get_quests(user=Depends(verify_token)):
    docs = db.collection("quests").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-quest")
def add_quest(data: dict, user=Depends(verify_token)):
    data["createdAt"] = datetime.utcnow()
    db.collection("quests").add(data)
    return {"message": "Quest added"}

@admin_router.put("/edit-quest/{quest_id}")
def edit_quest(quest_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("quests").document(quest_id)
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
    data["createdAt"] = datetime.utcnow()
    data["role"] = "admin"
    data["uploadedBy"] = user["uid"]
    db.collection("posts").add(data)
    return {"message": "Post added"}

@admin_router.put("/edit-post/{post_id}")
def edit_post(post_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.update(data)
    return {"message": "Post updated"}

@admin_router.delete("/delete-post/{post_id}")
def delete_post(post_id: str, user=Depends(verify_token)):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": "Post deleted"}