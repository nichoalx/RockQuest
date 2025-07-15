from fastapi import APIRouter, HTTPException, Depends
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import User  

router = APIRouter(prefix="", tags=["User"])

@router.post("/complete-profile")
def complete_profile(data: User, current_user: dict = Depends(verify_token)):
    uid = current_user["uid"]

    # Ensure unique username
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
