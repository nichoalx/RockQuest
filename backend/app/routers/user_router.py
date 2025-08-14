from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import User
from datetime import datetime, timezone
from typing import Dict, Any

router = APIRouter(prefix="", tags=["User"])

# ---------- helpers ----------

def _today_key_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def _user_ref(uid: str):
    return db.collection("user").document(uid)

def _assert_unique_username(username: str, my_uid: str):
    qs = db.collection("user").where("username", "==", username).stream()
    for doc in qs:
        if doc.id != my_uid:
            raise HTTPException(status_code=400, detail="Username is already taken")

# ---------- endpoints ----------

# COMPLETE PROFILE
@router.post("/complete-profile")
def complete_profile(data: User, current_user: dict = Depends(verify_token)):
    uid = current_user["uid"]
    _assert_unique_username(data.username, uid)

    user_ref = _user_ref(uid)
    existing = user_ref.get()
    existing_created_at = None
    if existing.exists:
        existing_created_at = (existing.to_dict() or {}).get("createdAt")

    update_data: Dict[str, Any] = {
        "uid": uid,
        "username": data.username,
        "type": data.type,
        "description": data.description,
        "dob": data.dob,
        "avatarId": data.avatarId,
        "isActive": True,
        "email": data.emailAddress,
        "createdAt": existing_created_at if existing_created_at else firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }

    user_ref.set(update_data, merge=True)
    return {"message": "Profile completed successfully", "user": user_ref.get().to_dict()}

# POSTS
@router.get("/my-posts")
def get_my_posts(user=Depends(verify_token)):
    docs = db.collection("post").where("uploadedBy", "==", user["uid"]).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.get("/all-posts")
def get_all_posts(user=Depends(verify_token)):
    docs = db.collection("post").order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.post("/add-post")
def add_post(data: dict, user=Depends(verify_token)):
    data.update({
        "createdAt": firestore.SERVER_TIMESTAMP,
        "uploadedBy": user["uid"]
    })
    db.collection("post").add(data)
    return {"message": "Post added"}

@router.put("/edit-post/{post_id}")
def edit_post(post_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("post").document(post_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Post not found")
    if snap.to_dict().get("uploadedBy") != user["uid"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    ref.update({**data, "updatedAt": firestore.SERVER_TIMESTAMP})
    return {"message": "Post updated"}

@router.delete("/delete-post/{post_id}")
def delete_post(post_id: str, user=Depends(verify_token)):
    ref = db.collection("post").document(post_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Post not found")
    if snap.to_dict().get("uploadedBy") != user["uid"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    ref.delete()
    return {"message": "Post deleted"}

# FACTS
@router.get("/facts")
def get_facts(user=Depends(verify_token)):
    today = _today_key_utc()
    view_doc_ref = db.collection("fact_viewed").document(user["uid"]).collection("views").document(today)
    if not view_doc_ref.get().exists:
        view_doc_ref.set({"viewedAt": firestore.SERVER_TIMESTAMP})

    docs = db.collection("fact").order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# ANNOUNCEMENTS
@router.get("/announcements")
def get_announcements(user=Depends(verify_token)):
    docs = db.collection("announcement").order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# REPORTING
@router.post("/report-post")
def report_post(post_id: str, reason: str, user=Depends(verify_token)):
    db.collection("report").add({
        "postId": post_id,
        "reason": reason,
        "reportedAt": firestore.SERVER_TIMESTAMP,
        "reportedBy": user["uid"]
    })
    return {"message": "Post reported"}

# PROFILE
@router.get("/profile")
def get_profile(user=Depends(verify_token)):
    ref = _user_ref(user["uid"])
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return snap.to_dict()

@router.put("/update-profile")
def update_profile(data: dict, user=Depends(verify_token)):
    uid = user["uid"]
    ref = _user_ref(uid)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    if "username" in data:
        _assert_unique_username(data["username"], uid)
    data["updatedAt"] = firestore.SERVER_TIMESTAMP
    ref.update(data)
    return {"message": "Profile updated"}

@router.delete("/delete-account")
def delete_account(user=Depends(verify_token)):
    ref = _user_ref(user["uid"])
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.delete()
    return {"message": "Account deleted"}

# --------- STATS (total + today) ---------
@router.get("/my-stats")
def get_my_stats(user=Depends(verify_token)):
    uid = user["uid"]
    today_key = _today_key_utc()

    total_doc = _user_ref(uid).get()
    total_scans = int((total_doc.to_dict() or {}).get("scanCount", 0)) if total_doc.exists else 0

    day_ref = db.collection("player_scan_stats").document(uid).collection("days").document(today_key)
    day_doc = day_ref.get()
    day_data = day_doc.to_dict() if day_doc.exists else {}

    by_type = day_data.get("byType", {}) if isinstance(day_data, dict) else {}
    return {
        "totalScans": total_scans,
        "today": {
            "date": today_key,
            "count": int(day_data.get("count", 0)) if day_data else 0,
            "byType": {
                "igneous": int(by_type.get("igneous", 0) or 0),
                "sedimentary": int(by_type.get("sedimentary", 0) or 0),
                "metamorphic": int(by_type.get("metamorphic", 0) or 0),
            }
        }
    }
