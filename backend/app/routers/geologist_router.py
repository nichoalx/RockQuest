from fastapi import Depends, APIRouter, HTTPException
from datetime import datetime

from app.auth.dependencies import verify_token
from app.firebase import db

geologist_router = APIRouter(prefix="/geologist", tags=["Geologist"])

# FACT MANAGEMENT
@geologist_router.post("/add-fact")
def add_fact(data: dict, user=Depends(verify_token)):
    data["createdAt"] = datetime.utcnow()
    data["addedBy"] = user["uid"]
    db.collection("facts").add(data)
    return {"message": "Fact added"}

@geologist_router.put("/edit-fact/{fact_id}")
def edit_fact(fact_id: str, data: dict, user=Depends(verify_token)):
    ref = db.collection("facts").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.update(data)
    return {"message": "Fact updated"}

@geologist_router.delete("/delete-fact/{fact_id}")
def delete_fact(fact_id: str, user=Depends(verify_token)):
    ref = db.collection("facts").document(fact_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    ref.delete()
    return {"message": "Fact deleted"}

# ROCK VERIFICATION
@geologist_router.get("/review-rocks")
def review_pending_rocks(user=Depends(verify_token)):
    docs = db.collection("rocks").where("verified", "==", False).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@geologist_router.post("/approve-rock/{rock_id}")
def approve_rock(rock_id: str, user=Depends(verify_token)):
    ref = db.collection("rocks").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.update({"verified": True, "verifiedBy": user["uid"], "verifiedAt": datetime.utcnow()})
    return {"message": "Rock approved"}

@geologist_router.post("/reject-rock/{rock_id}")
def reject_rock(rock_id: str, reason: str, user=Depends(verify_token)):
    ref = db.collection("rocks").document(rock_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    ref.update({"verified": False, "rejectedReason": reason, "rejectedAt": datetime.utcnow()})
    return {"message": "Rock rejected"}

# EXPERT COMMENT
@geologist_router.post("/comment")
def add_expert_comment(data: dict, user=Depends(verify_token)):
    data["createdAt"] = datetime.utcnow()
    data["author"] = user["uid"]
    db.collection("comments").add(data)
    return {"message": "Comment added"}
