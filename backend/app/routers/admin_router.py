from fastapi import Depends, APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional
from firebase_admin import firestore
from app.auth.dependencies import verify_admin_token
from app.firebase import db
from app.models.models import (
    User, Rock, Fact, Announcement, UpdateAnnouncement, Quest, UpdateQuest,
    Post, PostVerificationRequest, ReportDecisionRequest, RockSpawn
)

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# DASHBOARD - combined counts
@admin_router.get("/dashboard")
def get_dashboard_counts(user=Depends(verify_admin_token)):
    return {
        "totalUsers": len(list(db.collection("user").stream())),
        "totalPosts": len(list(db.collection("post").stream())),
        "totalReports": len(list(db.collection("report").where("status", "==", "pending").stream())),
        "totalQuests": len(list(db.collection("quest").stream())),
        "totalRocks": len(list(db.collection("rock").stream())),
        "totalRockDistributions": len(list(db.collection("spawnedRock").stream())),
        "totalAnnouncements": len(list(db.collection("announcement").stream())),
        "totalFacts": len(list(db.collection("fact").stream())),
    }


# USER MANAGEMENT
@admin_router.get("/users")
def get_all_users(role: Optional[str] = None, email: Optional[str] = None, user=Depends(verify_admin_token)):
    query = db.collection("user")
    if role:
        query = query.where("type", "==", role)
    if email:
        query = query.where("email", "==", email)
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.put("/suspend-user/{user_id}")
def suspend_user(user_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("user").document(user_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.update({"isActive": False, "suspendedAt": firestore.SERVER_TIMESTAMP})
    return {"message": f"User {user_id} suspended"}

@admin_router.put("/unsuspend-user/{user_id}")
def unsuspend_user(user_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("user").document(user_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.update({"isActive": True, "unsuspendedAt": firestore.SERVER_TIMESTAMP})
    return {"message": f"User {user_id} unsuspended"}

# ROCK DATABASE MANAGEMENT
@admin_router.get("/rocks")
def get_all_rocks(user=Depends(verify_admin_token)):
    docs = db.collection("rock").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-rock")
def add_rock(data: Rock, user=Depends(verify_admin_token)):
    if not data.rockId:
        raise HTTPException(status_code=400, detail="rockId is required")

    ref = db.collection("rock").document(str(data.rockId))  # this line ensures doc ID = rockId

    if ref.get().exists:
        raise HTTPException(status_code=400, detail="Rock with this rockId already exists")

    ref.set({
        "rockId": data.rockId,
        "rockName": data.rockName,
        "rockType": data.rockType,
        "description": data.description,
        "imageUrl": data.imageUrl,
        "createdAt": firestore.SERVER_TIMESTAMP
    })

    return {"message": f"Rock added with rockId '{data.rockId}'"}

@admin_router.put("/edit-rock/{rock_id}")
def edit_rock(rock_id: str, data: Rock, user=Depends(verify_admin_token)):
    ref = db.collection("rock").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    
    update_data = {
        **data.dict(exclude_unset=True),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "updatedBy": user["uid"]
    }

    ref.update(update_data)
    return {"message": "Rock updated"}

@admin_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("rock").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.delete()
    return {"message": "Rock deleted"}

# POST REVIEW
@admin_router.get("/review")
def review_pending_rocks(user=Depends(verify_admin_token)):
    docs = db.collection("post").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/verify-rock/{post_id}")
def verify_rock(post_id: str, data: PostVerificationRequest, user=Depends(verify_admin_token)):
    review_ref = db.collection("post").document(post_id)
    review_doc = review_ref.get()
    if not review_doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found in review queue")

    if data.action == "approve":
        review_ref.update({
            "postId": post_id,  # ensure consistency
            "verified": True,
            "verifiedBy": user["uid"],
            "verifiedAt": datetime.utcnow()
        })
        return {"message": "Rock approved"}

    elif data.action == "reject":
        if not data.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        review_ref.update({
            "postId": post_id,  # ensure consistency
            "verified": False,
            "rejectedReason": data.reason,
            "rejectedAt": datetime.utcnow()
        })
        return {"message": "Rock rejected and left in review collection"}

    raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'")

# FACT MANAGEMENT
@admin_router.get("/facts")
def get_all_facts(user=Depends(verify_admin_token)):
    docs = db.collection("fact").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-fact/{fact_id}")
def delete_fact(fact_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("fact").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.delete()
    return {"message": "Fact deleted"}

# ANNOUNCEMENTS 
@admin_router.get("/announcements")
def get_announcements(user=Depends(verify_admin_token)):
    docs = db.collection("announcement").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/announcements")
def add_announcement(data: Announcement, user=Depends(verify_admin_token)):
    if not data.announcementId:
        raise HTTPException(status_code=400, detail="announcementId is required")
    ref = db.collection("announcement").document(str(data.announcementId))
    if ref.get().exists:
        raise HTTPException(status_code=400, detail="Announcement with this ID already exists")

    update_data = {
        "announcementId": data.announcementId,
        "title": data.title,
        "description": data.description,
        "type": data.type,
        "publishDate": data.publishDate,
        "createdAt": firestore.SERVER_TIMESTAMP,
        "createdBy": user["uid"],
        "isVisible": data.isVisible,
        "pinned": data.pinned,
        "imageUrl": data.imageUrl,
    }

    ref.set(update_data)
    return {"message": f"Announcement added with ID '{data.announcementId}'"}

@admin_router.put("/announcements/{announcement_id}")
def update_announcement(announcement_id: str, data: UpdateAnnouncement, user=Depends(verify_admin_token)):
    ref = db.collection("announcement").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")

    update_data = {
        **data.dict(exclude_unset=True),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "updatedBy": user["uid"]
    }

    ref.update(update_data)
    return {"message": "Announcement updated"}

@admin_router.delete("/announcements/{announcement_id}")
def delete_announcement(announcement_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("announcement").document(announcement_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Announcement not found")
    ref.delete()
    return {"message": "Announcement deleted"}

# QUEST MANAGEMENT
@admin_router.get("/quests")
def get_quests(user=Depends(verify_admin_token)):
    docs = db.collection("quest").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/add-quest")
def add_quest(data: Quest, user=Depends(verify_admin_token)):
    if not data.questId:
        raise HTTPException(status_code=400, detail="questId is required")

    ref = db.collection("quest").document(data.questId)
    if ref.get().exists:
        raise HTTPException(status_code=400, detail="Quest already exists")

    update_data = {
        **data.dict(exclude={"createdAt", "updatedAt", "updatedBy"}),
        "createdAt": firestore.SERVER_TIMESTAMP,
    }

    ref.set(update_data)
    return {"message": f"Quest '{data.questId}' added."}

@admin_router.put("/edit-quest/{quest_id}")
def edit_quest(quest_id: str, data: UpdateQuest, user=Depends(verify_admin_token)):
    ref = db.collection("quest").document(quest_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Quest not found")

    update_data = {
        **data.dict(exclude_unset=True),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "updatedBy": user["uid"]
    }
    ref.update(update_data)
    return {"message": f"Quest '{quest_id}' updated."}

@admin_router.delete("/delete-quest/{quest_id}")
def delete_quest(quest_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("quest").document(quest_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Quest not found")
    ref.delete()
    return {"message": f"Quest '{quest_id}' deleted."}

# POST MANAGEMENT
@admin_router.get("/posts")
def get_all_posts(user=Depends(verify_admin_token)):
    docs = db.collection("post").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.delete("/delete-post/{post_id}")
def delete_post(post_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("post").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": f"Post '{post_id}' deleted successfully"}

# REPORT MANAGEMENT
@admin_router.get("/reports")
def get_reports(user=Depends(verify_admin_token)):
    docs = db.collection("report").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/review-report/{report_id}")
def review_report(report_id: str, data: ReportDecisionRequest, user=Depends(verify_admin_token)):
    ref = db.collection("report").document(report_id)
    doc = ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Report not found")

    report = doc.to_dict()
    item_id = report.get("reportedId")
    item_type = report.get("reportedItemType")

    if not item_id or not item_type:
        raise HTTPException(status_code=400, detail="Report is missing item reference")

    update_data = {
        "status": data.action,
        "reviewedBy": user["uid"],
        "reviewedAt": firestore.SERVER_TIMESTAMP
    }

    if data.action == "approve":
        # Delete the reported item
        item_ref = db.collection(item_type).document(item_id)
        if item_ref.get().exists:
            item_ref.delete()
            update_data["adminAction"] = f"{item_type} {item_id} deleted"
        else:
            update_data["adminAction"] = f"{item_type} {item_id} not found"

    elif data.action == "reject":
        if not data.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        update_data["rejectedReason"] = data.reason

    # Save updates to the report
    ref.update(update_data)

    return {
        "message": f"Report {data.action}d successfully",
        "itemAction": update_data.get("adminAction", "No action taken"),
        "rejectedReason": update_data.get("rejectedReason")
    }

# SPAWNED ROCK MANAGEMENT
@admin_router.get("/spawns")
def get_all_spawns(user=Depends(verify_admin_token)):
    docs = db.collection("spawnedRock").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@admin_router.post("/spawns")
def create_spawn(data: RockSpawn, user=Depends(verify_admin_token)):
    if not data.rockId:
        raise HTTPException(status_code=400, detail="rockId is required")

    doc_ref = db.collection("spawnedRock").document()
    spawn_data = {
        "rockId": data.rockId,
        "lat": data.lat,
        "lng": data.lng,
        "confidence": data.confidence,
        "spawnedAt": firestore.SERVER_TIMESTAMP,
        "spawnedBy": user["uid"]
    }
    doc_ref.set(spawn_data)
    return {"message": "Spawned rock created", "id": doc_ref.id}

@admin_router.put("/spawns/{spawn_id}")
def update_spawn(spawn_id: str, data: RockSpawn, user=Depends(verify_admin_token)):
    ref = db.collection("spawnedRock").document(spawn_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Spawned rock not found")

    update_data = {
        **data.dict(exclude_unset=True),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "updatedBy": user["uid"]
    }
    ref.update(update_data)
    return {"message": f"Spawned rock '{spawn_id}' updated."}

@admin_router.delete("/spawns/{spawn_id}")
def delete_spawn(spawn_id: str, user=Depends(verify_admin_token)):
    ref = db.collection("spawnedRock").document(spawn_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Spawned rock not found")
    ref.delete()
    return {"message": f"Spawned rock '{spawn_id}' deleted."}