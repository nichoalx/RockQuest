from fastapi import Depends, APIRouter, HTTPException, Query
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import Fact, UpdateFact, PostVerificationRequest, ReportDecisionRequest

geologist_router = APIRouter(prefix="/geologist", tags=["Geologist"])

# ---------------- FACT MANAGEMENT ----------------

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
        "createdAt": firestore.SERVER_TIMESTAMP,
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
        "updatedBy": user["uid"],
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

# ---------------- ROCK VERIFICATION ----------------

@geologist_router.get("/review")
def review_pending_rocks(user=Depends(verify_token)):
    docs = db.collection("post").where("verified", "==", False).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@geologist_router.post("/verify-rock/{post_id}")
def verify_rock(post_id: str, data: PostVerificationRequest, user=Depends(verify_token)):
    review_ref = db.collection("post").document(post_id)
    review_doc = review_ref.get()
    if not review_doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found in review queue")

    if data.action == "approve":
        review_ref.update({
            "verified": True,
            "verifiedBy": user["uid"],
            "verifiedAt": firestore.SERVER_TIMESTAMP,
            "rejectedReason": firestore.DELETE_FIELD,
            "rejectedAt": firestore.DELETE_FIELD,
        })
        return {"message": "Rock approved and verified"}

    if data.action == "reject":
        if not data.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        review_ref.update({
            "verified": False,
            "rejectedReason": data.reason,
            "rejectedAt": firestore.SERVER_TIMESTAMP,
        })
        return {"message": "Rock rejected and left in review collection"}

    raise HTTPException(status_code=400, detail="Invalid action. Must be 'approve' or 'reject'")

# ---------------- REPORTS (simple list by status; used by getReportsByStatus) ----------------

@geologist_router.get("/reports")
def get_reports_by_status(
    status: str = Query("pending", regex="^(pending|approve|reject)$"),
    user=Depends(verify_token),
):
    docs = db.collection("report").where("status", "==", status).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

# ---------------- REPORT MODERATION (USED BY YOUR UI) ----------------

# List reports with embedded post (matches listReportedPosts -> GET /geologist/reported)
@geologist_router.get("/reported")
def list_reported(
    status: str = Query("pending", regex="^(pending|approve|reject)$"),
    user=Depends(verify_token),
):
    # Avoid Firestore composite index: fetch then sort in Python
    items = []
    docs = db.collection("report").where("status", "==", status).stream()
    for d in docs:
        data = d.to_dict() or {}
        post = None
        post_id = data.get("postId")
        if post_id:
            pdoc = db.collection("post").document(post_id).get()
            if pdoc.exists:
                post = {"id": pdoc.id, **(pdoc.to_dict() or {})}
        items.append({"reportId": d.id, **data, "post": post})

    # Sort newest first (reportedAt is a Firestore Timestamp)
    def _ts(x):
        t = x.get("reportedAt")
        try:
            return t.timestamp()  # Firestore Timestamp supports .timestamp()
        except Exception:
            return 0
    items.sort(key=_ts, reverse=True)
    return items

# Decide a report (matches decideReport -> POST /geologist/reports/{id}/decision)
@geologist_router.post("/reports/{report_id}/decision")
def report_decision(report_id: str, body: ReportDecisionRequest, user=Depends(verify_token)):
    if body.action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="action must be 'approve' or 'reject'")

    rep_ref = db.collection("report").document(report_id)
    rep_doc = rep_ref.get()
    if not rep_doc.exists:
        raise HTTPException(status_code=404, detail="Report not found")

    data = rep_doc.to_dict() or {}
    post_id = data.get("postId")

    # Update report first
    rep_ref.update({
        "status": "approve" if body.action == "approve" else "reject",
        "moderatedBy": user["uid"],
        "moderatedAt": firestore.SERVER_TIMESTAMP,
    })

    # If approving and post still exists, flag the post
    if body.action == "approve" and post_id:
        post_ref = db.collection("post").document(post_id)
        pdoc = post_ref.get()
        if pdoc.exists:
            post_ref.update({
                "flagged": True,
                "flaggedAt": firestore.SERVER_TIMESTAMP,   # <- fixed constant
                "flaggedBy": user["uid"],
                "flaggedReason": data.get("reason"),
            })

    return {"message": f"Report {body.action}d"}
