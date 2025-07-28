from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from app.auth.dependencies import require_player  
from app.firebase import db
from app.models.models import User, Post, ReportRequest
from datetime import datetime
from firebase_admin import auth as firebase_auth 

router = APIRouter(prefix="", tags=["User"])

# POSTS
@router.get("/my-posts")
def get_my_posts(user=Depends(require_player)):
    docs = db.collection("post").where("uploadedBy", "==", user["uid"]).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.get("/all-posts")
def get_all_posts(user=Depends(require_player)):
    docs = db.collection("post").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@router.post("/add-post")
def add_post(data: dict, user=Depends(require_player)):
    data.update({
        "createdAt": firestore.SERVER_TIMESTAMP,
        "uploadedBy": user["uid"]
    })
    db.collection("post").add(data)
    return {"message": "Post added"}

@router.put("/edit-post/{postId}")
def edit_post(postId: str, data: dict, user=Depends(require_player)):
    ref = db.collection("post").document(postId)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.update(data)
    return {"message": "Post updated"}

@router.delete("/delete-post/{postId}")
def delete_post(postId: str, user=Depends(require_player)):
    ref = db.collection("post").document(postId)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": "Post deleted"}

# FACTS
@router.get("/facts")
def get_facts(user=Depends(require_player)):
    docs = db.collection("fact").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# ANNOUNCEMENTS
@router.get("/announcements")
def get_announcements(user=Depends(require_player)):
    docs = db.collection("announcement").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# REPORTING
@router.post("/report-post")
def report_post(data: ReportRequest, user=Depends(require_player)):
    db.collection("report").add({
        "postId": data.postId,
        "reason": data.reason,
        "reportedAt": firestore.SERVER_TIMESTAMP,
        "reportedBy": user["uid"]
    })
    return {"message": "Post reported"}

# PROFILE
@router.get("/profile")
def get_profile(user=Depends(require_player)):
    doc = db.collection("user").document(user["uid"]).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()

@router.put("/update-profile")
def update_profile(data: dict, user=Depends(require_player)):
    db.collection("user").document(user["uid"]).update(data)
    return {"message": "Profile updated"}

@router.delete("/delete-account")
def delete_account(user=Depends(require_player)):
    uid = user["uid"]

    # Delete from Firestore
    db.collection("user").document(uid).delete()

    # Delete from Firebase Auth
    try:
        firebase_auth.delete_user(uid)
    except firebase_auth.AuthError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete from Firebase Auth: {str(e)}")

    return {"message": "Account deleted from Firestore and Firebase Auth"}
