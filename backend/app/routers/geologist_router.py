from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.firebase import db

geologist_router = APIRouter(prefix="/geologist", tags=["Geologist"])

#POSTS & FACTS
@geologist_router.get("/posts")
def get_geologist_posts():
    docs = db.collection("posts").where("role", "==", "geologist").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@geologist_router.get("/facts")
def get_geologist_facts():
    docs = db.collection("facts").where("addedBy", "==", "geologist_01").stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@geologist_router.post("/add-post")
def add_geologist_post(data: dict):
    data["createdAt"] = datetime.utcnow()
    data["role"] = "geologist"
    data["addedBy"] = "geologist_01"
    db.collection("posts").add(data)
    return {"message": "Geologist post added"}

@geologist_router.post("/add-fact")
def add_fact(data: dict):
    data["createdAt"] = datetime.utcnow()
    data["addedBy"] = "geologist_01"
    db.collection("facts").add(data)
    return {"message": "Fact added"}

@geologist_router.put("/edit-post/{post_id}")
def edit_post(post_id: str, data: dict):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.update(data)
    return {"message": "Post updated"}

@geologist_router.put("/edit-fact/{fact_id}")
def edit_fact(fact_id: str, data: dict):
    ref = db.collection("facts").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.update(data)
    return {"message": "Fact updated"}

@geologist_router.delete("/delete-post/{post_id}")
def delete_post(post_id: str):
    ref = db.collection("posts").document(post_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Post not found")
    ref.delete()
    return {"message": "Post deleted"}

@geologist_router.delete("/delete-fact/{fact_id}")
def delete_fact(fact_id: str):
    ref = db.collection("facts").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.delete()
    return {"message": "Fact deleted"}

#VERIFICATION
@geologist_router.get("/review-rocks")
def review_pending_rocks():
    docs = db.collection("rocks").where("verified", "==", False).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@geologist_router.post("/approve-rock/{rock_id}")
def approve_rock(rock_id: str):
    ref = db.collection("rocks").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.update({"verified": True, "verifiedBy": "geologist_01", "verifiedAt": datetime.utcnow()})
    return {"message": "Rock approved"}

@geologist_router.post("/reject-rock/{rock_id}")
def reject_rock(rock_id: str, reason: str):
    ref = db.collection("rocks").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.update({"verified": False, "rejectedReason": reason, "rejectedAt": datetime.utcnow()})
    return {"message": "Rock rejected"}

@geologist_router.post("/comment")
def add_expert_comment(data: dict):
    data["createdAt"] = datetime.utcnow()
    data["author"] = "geologist_01"
    db.collection("comments").add(data)
    return {"message": "Comment added"}

#PROFILE
@geologist_router.get("/profile")
def get_profile():
    return {
        "username": "geologist_01",
        "email": "geo@example.com",
        "role": "Geologist",
        "contributions": 12
    }

@geologist_router.delete("/delete-account")
def delete_account():
    return {"message": "Geologist account deleted (placeholder)"}
