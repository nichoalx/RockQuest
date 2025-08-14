from fastapi import APIRouter, HTTPException, Depends, Query
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import User
from datetime import datetime, timezone
from typing import Dict, Any

router = APIRouter(prefix="", tags=["User"])

# ---------- helpers ----------

# ---- Badges config ----
BADGES = [
    {"id": "scan_1",  "name": "Scan 1 Rock",  "kind": "scan", "threshold": 1,  "imageKey": "Scan1"},
    {"id": "scan_5",  "name": "Scan 5 Rocks", "kind": "scan", "threshold": 5,  "imageKey": "Scan2"},
    {"id": "scan_10", "name": "Scan 10 Rocks","kind": "scan", "threshold": 10, "imageKey": "Scan3"},
    {"id": "post_1",  "name": "Make 1 Post",  "kind": "post", "threshold": 1,  "imageKey": "Post1"},
    {"id": "post_5",  "name": "Make 5 Posts", "kind": "post", "threshold": 5,  "imageKey": "Post2"},
    {"id": "post_10", "name": "Make 10 Posts","kind": "post", "threshold": 10, "imageKey": "Post3"},  # <— use Post3.png
]


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

def _count_my_posts(uid: str) -> int:
    return sum(1 for _ in db.collection("post").where("uploadedBy", "==", uid).stream())

@router.get("/badges")
def get_badges(user=Depends(verify_token)):
    """Compute badge progress and persist newly-earned ones."""
    uid = user["uid"]

    # totals
    user_doc = _user_ref(uid).get()
    scan_count = int((user_doc.to_dict() or {}).get("scanCount", 0)) if user_doc.exists else 0
    post_count = _count_my_posts(uid)

    # what we've already recorded as earned (optional persistence)
    earned_coll = db.collection("players").document(uid).collection("badges")
    already = {d.id for d in earned_coll.stream()}

    badges = []
    batch = db.batch()

    for b in BADGES:
        progress = scan_count if b["kind"] == "scan" else post_count
        earned = progress >= b["threshold"]

        badges.append({
            "id": b["id"],
            "name": b["name"],
            "imageKey": b["imageKey"],  # client maps to require(...)
            "kind": b["kind"],
            "threshold": b["threshold"],
            "progress": progress,
            "earned": earned,
        })

        # write once when newly earned
        if earned and b["id"] not in already:
            ref = earned_coll.document(b["id"])
            batch.set(ref, {
                "badgeId": b["id"],
                "name": b["name"],
                "unlockedAt": firestore.SERVER_TIMESTAMP,
                "threshold": b["threshold"],
                "kind": b["kind"],
            })

    if len(batch._write_pbs):  # commit only if there are writes
        batch.commit()

    return {
        "scanCount": scan_count,
        "postCount": post_count,
        "badges": badges,
    }

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
    # copy so we don't mutate the Pydantic/body dict
    payload = {**data}

    # set safe defaults if not provided by client
    payload.setdefault("flagged", False)
    payload.setdefault("verified", False)

    payload.update({
        "createdAt": firestore.SERVER_TIMESTAMP,
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "uploadedBy": user["uid"],
    })

    db.collection("post").add(payload)
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
def report_post(
    post_id: str = Query(..., alias="post_id"),
    reason: str = Query(...),
    user=Depends(verify_token),
):
    # ensure post exists
    post_ref = db.collection("post").document(post_id)
    post_doc = post_ref.get()
    if not post_doc.exists:
        raise HTTPException(status_code=404, detail="Post not found")

    # disallow reporting your own post (optional)
    post = post_doc.to_dict()
    if post.get("uploadedBy") == user["uid"]:
        raise HTTPException(status_code=400, detail="Cannot report your own post")

    # check existing pending report by same user for same post (idempotent)
    dup = list(
        db.collection("report")
        .where("postId", "==", post_id)
        .where("reportedBy", "==", user["uid"])
        .where("status", "==", "pending")
        .limit(1)
        .stream()
    )
    if dup:
        return {"message": "Report already submitted", "status": "pending"}

    payload = {
        "postId": post_id,
        "reason": reason,
        "reportedBy": user["uid"],
        "reportedAt": firestore.SERVER_TIMESTAMP,
        "status": "pending",  # pending | approve | reject
    }
    doc_ref = db.collection("report").document()  # auto id
    doc_ref.set(payload)
    return {"message": "Report submitted", "reportId": doc_ref.id}

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

