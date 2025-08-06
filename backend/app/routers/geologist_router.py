from fastapi import Depends, APIRouter, HTTPException, Query
from datetime import datetime
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import Fact, UpdateFact, PostVerificationRequest

geologist_router = APIRouter(prefix="/geologist", tags=["Geologist"])

# FACT MANAGEMENT
@geologist_router.post("/add-fact")
def add_fact(data: Fact, user=Depends(verify_token)):
    if not data.factId:
        raise HTTPException(status_code=400, detail="factId is required")
    ref = db.collection("fact").document(str(data.factId))
    if ref.get().exists:
        raise HTTPException(status_code=400, detail="Fact with this factId already exists")

    update_data = {
        "factId": data.factId,
        "title": data.title,
        "description": data.description,
        "createdBy": user["uid"],
        "createdAt": firestore.SERVER_TIMESTAMP
    }

    ref.set(update_data)
    return {"message": f"Fact added with factId '{data.factId}' as document ID"}

@geologist_router.put("/edit-fact/{fact_id}")
def edit_fact(fact_id: str, data: UpdateFact, user=Depends(verify_token)):
    ref = db.collection("fact").document(fact_id)

    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Fact not found")
    
    update_data = {
        **data.dict(exclude_unset=True),
        "updatedAt": firestore.SERVER_TIMESTAMP,
        "updatedBy": user["uid"]
    }
    
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

# ROCK VERIFICATION (review Post)
@geologist_router.get("/review")
def review_pending_rocks(user=Depends(verify_token)):
    docs = db.collection("post").where("verified", "==", False).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# Approve or reject rock post
@geologist_router.post("/verify-rock/{post_id}")
def verify_rock(post_id: str, data: PostVerificationRequest, user=Depends(verify_token)):
    review_ref = db.collection("post").document(post_id)
    review_doc = review_ref.get()
    if not review_doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found in review queue")

    rock_data = review_doc.to_dict()

    if data.action == "approve":
        rock_data.update({
            "verified": True,
            "verifiedBy": user["uid"],
            "verifiedAt": firestore.SERVER_TIMESTAMP,
            "rejectedReason": firestore.DELETE_FIELD,  # remove rejectedReason if previously rejected
            "rejectedAt": firestore.DELETE_FIELD
        })
        review_ref.update(rock_data)
        return {"message": "Rock approved and verified"}
        
    elif data.action == "reject":
        if not data.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        review_ref.update({
            "verified": False,
            "rejectedReason": data.reason,
            "rejectedAt": firestore.SERVER_TIMESTAMP
        })
        return {"message": "Rock rejected and left in review collection"}
    
    raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'")


# REPORT FILTERING (with query param)
@geologist_router.get("/reports")
def get_reports_by_status(
    status: str = Query("pending", regex="^(pending|approve|reject)$"),
    user=Depends(verify_token)
):
    docs = db.collection("report").where("status", "==", status).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]
