from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.firebase import db

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# DASHBOARD 
@admin_router.get("/dashboard/users")
def get_user_count():
    count = len(list(db.collection("users").stream()))
    return {"totalUsers": count}

@admin_router.get("/dashboard/rocks")
def get_rock_count():
    count = len(list(db.collection("rocks").stream()))
    return {"totalRocks": count}

@admin_router.get("/dashboard/posts")
def get_post_count():
    count = len(list(db.collection("posts").stream()))
    return {"totalPosts": count}

@admin_router.get("/dashboard/facts")
def get_fact_count():
    count = len(list(db.collection("facts").stream()))
    return {"totalFacts": count}

@admin_router.get("/dashboard/reports")
def get_report_count():
    count = len(list(db.collection("reports").stream()))
    return {"totalReports": count}

# USER MANAGEMENT
@admin_router.get("/users")
def get_all_users():
    docs = db.collection("users").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.put("/suspend-user/{user_id}")
def suspend_user(user_id: str):
    ref = db.collection("users").document(user_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.update({"suspended": True, "suspendedAt": datetime.utcnow()})
    return {"message": f"User {user_id} suspended"}

# REPORT MANAGEMENT
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

@admin_router.put("/update-report/{report_id}")
def update_report_status(report_id: str, status: str):
    ref = db.collection("reports").document(report_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Report not found")
    ref.update({"status": status, "updatedAt": datetime.utcnow()})
    return {"message": "Report updated"}

# ANNOUNCEMENTS 
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