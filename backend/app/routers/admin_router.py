from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.firebase import db

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

#DASHBOARD
@admin_router.get("/dashboard")
def get_dashboard_stats():
    users = len(list(db.collection("users").stream()))
    rocks = len(list(db.collection("rocks").stream()))
    posts = len(list(db.collection("posts").stream()))
    facts = len(list(db.collection("facts").stream()))
    reports = len(list(db.collection("reports").stream()))
    return {
        "totalUsers": users,
        "totalRocks": rocks,
        "totalPosts": posts,
        "totalFacts": facts,
        "totalReports": reports
    }

#USER MANAGEMENT
@admin_router.get("/users")
def get_all_users():
    docs = db.collection("users").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-user/{user_id}")
def delete_user(user_id: str):
    ref = db.collection("users").document(user_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.delete()
    return {"message": f"User {user_id} deleted"}

#REPORT MANAGEMENT
@admin_router.get("/reports")
def get_reports():
    docs = db.collection("reports").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-report/{report_id}")
def delete_report(report_id: str):
    ref = db.collection("reports").document(report_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Report not found")
    ref.delete()
    return {"message": "Report deleted"}

#ANNOUNCEMENTS
@admin_router.get("/announcements")
def get_announcements():
    docs = db.collection("announcements").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-announcement")
def add_announcement(data: dict):
    data["createdAt"] = datetime.utcnow()
    db.collection("announcements").add(data)
    return {"message": "Announcement added"}

@admin_router.delete("/delete-announcement/{announcement_id}")
def delete_announcement(announcement_id: str):
    ref = db.collection("announcements").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ref.delete()
    return {"message": "Announcement deleted"}
