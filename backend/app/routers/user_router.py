from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import User
from datetime import datetime

router = APIRouter(prefix="", tags=["User"])

# COMPLETE PROFILE
@router.post("/complete-profile")
def complete_profile(data: User, current_user: dict = Depends(verify_token)):
    uid = current_user["uid"]

    #ensure unique username
    username_exists = db.collection("users").where("username", "==", data.username).stream()
    if any(username_exists):
        raise HTTPException(status_code=400, detail="Username is already taken")

    user_ref = db.collection("users").document(uid)

    update_data = {
        "username": data.username,
        "type": data.type,
        "description": data.description,
        "createdAt": firestore.SERVER_TIMESTAMP
    }

    user_ref.set(update_data, merge=True)
    doc = user_ref.get()
    return {"message": "Profile completed successfully", "user": doc.to_dict()}

# POSTS
@router.get("/my-posts")
def get_my_posts(user=Depends(verify_token)):
    docs = db.collection("posts").where("uploadedBy", "==", user["uid"]).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.get("/all-posts")
def get_all_posts(user=Depends(verify_token)):
    docs = db.collection("posts").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.post("/add-post")
def add_post(data: dict, user=Depends(verify_token)):
    data.update({
        "createdAt": datetime.utcnow(),
        "uploadedBy": user["uid"]
    })
    db.collection("posts").add(data)
    return {"message": "Post added"}

@router.put("/edit-post/{post_id}")
def edit_post(post_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.update(data)
    return {"message": "Post updated"}

@router.delete("/delete-post/{post_id}")
def delete_post(post_id: str, user=Depends(verify_token)):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": "Post deleted"}

# FACTS
@router.get("/facts")
def get_facts(user=Depends(verify_token)):
    docs = db.collection("facts").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# ANNOUNCEMENTS
@router.get("/announcements")
def get_announcements(user=Depends(verify_token)):
    docs = db.collection("announcements").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# REPORTING
@router.post("/report-post")
def report_post(post_id: str, reason: str, user=Depends(verify_token)):
    db.collection("reports").add({
        "postId": post_id,
        "reason": reason,
        "reportedAt": datetime.utcnow(),
        "reportedBy": user["uid"]
    })
    return {"message": "Post reported"}

# PROFILE
@router.get("/profile")
def get_profile(user=Depends(verify_token)):
    doc = db.collection("users").document(user["uid"]).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()

@router.put("/update-profile")
def update_profile(data: dict, user=Depends(verify_token)):
    db.collection("users").document(user["uid"]).update(data)
    return {"message": "Profile updated"}

@router.delete("/delete-account")
def delete_account(user=Depends(verify_token)):
    db.collection("users").document(user["uid"]).delete()
    return {"message": "Account deleted"}
