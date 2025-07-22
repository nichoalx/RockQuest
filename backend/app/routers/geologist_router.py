from fastapi import Depends, APIRouter, HTTPException
from datetime import datetime
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import Fact, UpdateFact

geologist_router = APIRouter(prefix="/geologist", tags=["Geologist"])

# FACT MANAGEMENT
@geologist_router.post("/add-fact")
def add_fact(data: Fact, user=Depends(verify_token)):
    fact_data = data.dict()
    fact_data["createdBy"] = user["uid"]
    fact_data["createdAt"] = firestore.SERVER_TIMESTAMP
    db.collection("fact").add(fact_data)
    return {"message": "Fact added"}

@geologist_router.put("/edit-fact/{fact_id}")
def edit_fact(fact_id: str, data: UpdateFact, user=Depends(verify_token)):
    ref = db.collection("fact").document(fact_id)

    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    fact = ref.get().to_dict()
    if fact.get("createdBy") != user["uid"]:
        raise HTTPException(status_code=403, detail="You are not authorized to edit")
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    ref.update(update_data)
    return {"message": "Fact updated"}

@geologist_router.delete("/delete-fact/{fact_id}")
def delete_fact(fact_id: str, user=Depends(verify_token)):
    ref = db.collection("fact").document(fact_id)
        
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    fact = ref.get().to_dict()
    if fact.get("createdBy") != user["uid"]:
        raise HTTPException(status_code=403, detail="You are not authorized to delete")
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
