from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import User
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="", tags=["User"])

# ---------- helpers ----------

def _get_user_ref(uid: str):
    """
    Always return the user doc ref at 'user/{uid}'.
    If a legacy doc exists with a random ID but uid field == uid,
    migrate it into 'user/{uid}' (copy then delete old).
    """
    target_ref = db.collection("user").document(uid)
    snap = target_ref.get()
    if snap.exists:
        return target_ref

    # legacy: search by field
    matches = list(db.collection("user").where("uid", "==", uid).stream())
    if matches:
        legacy = matches[0]
        data = legacy.to_dict() or {}
        # write into canonical doc id
        target_ref.set(data, merge=True)
        # remove legacy doc to avoid duplicates
        try:
            db.collection("user").document(legacy.id).delete()
        except Exception:
            # best effort; ignore if already gone
            pass
        return target_ref

    # nothing found
    return target_ref  # non-existing ref; caller should check .get().exists


def _assert_unique_username(username: str, my_uid: str):
    # Ensure no other doc has this username (case-sensitive; adjust if you want case-insensitive)
    qs = db.collection("user").where("username", "==", username).stream()
    for doc in qs:
        if doc.id != my_uid:  # allow keeping your own username
            raise HTTPException(status_code=400, detail="Username is already taken")


# ---------- endpoints ----------

# COMPLETE PROFILE
@router.post("/complete-profile")
def complete_profile(data: User, current_user: dict = Depends(verify_token)):
    uid = current_user["uid"]

    _assert_unique_username(data.username, uid)

    user_ref = _get_user_ref(uid)

    update_data = {
        # canonical identifiers
        "uid": uid,
        "userId": uid,  # keep for backward compatibility with existing reads
        # profile fields
        "username": data.username,
        "type": data.type,
        "description": data.description,
        "dob": data.dob,
        "avatarId": data.avatarId,
        "isActive": True,
        "email": data.emailAddress,
        # timestamps
        "createdAt": firestore.SERVER_TIMESTAMP if not user_ref.get().exists else user_ref.get().to_dict().get("createdAt", firestore.SERVER_TIMESTAMP),
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }

    user_ref.set(update_data, merge=True)
    doc = user_ref.get()
    return {"message": "Profile completed successfully", "user": doc.to_dict()}


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
    # (Optional) enforce ownership:
    # if snap.to_dict().get("uploadedBy") != user["uid"]:
    #     raise HTTPException(status_code=403, detail="Forbidden")
    ref.update({**data, "updatedAt": firestore.SERVER_TIMESTAMP})
    return {"message": "Post updated"}

@router.delete("/delete-post/{post_id}")
def delete_post(post_id: str, user=Depends(verify_token)):
    ref = db.collection("post").document(post_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="Post not found")
    # (Optional) enforce ownership (see above)
    ref.delete()
    return {"message": "Post deleted"}


# FACTS
@router.get("/facts")
def get_facts(user=Depends(verify_token)):
    # Log that user accessed facts today (no duplicates per day)
    today = datetime.now().strftime("%Y-%m-%d")
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
    uid = user["uid"]
    ref = _get_user_ref(uid)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return snap.to_dict()

@router.put("/update-profile")
def update_profile(data: dict, user=Depends(verify_token)):
    uid = user["uid"]
    ref = _get_user_ref(uid)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    # protect username uniqueness if it's being changed
    if "username" in data:
        _assert_unique_username(data["username"], uid)
    data["updatedAt"] = firestore.SERVER_TIMESTAMP
    ref.update(data)
    return {"message": "Profile updated"}

@router.delete("/delete-account")
def delete_account(user=Depends(verify_token)):
    uid = user["uid"]
    ref = _get_user_ref(uid)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
    ref.delete()
    return {"message": "Account deleted"}
