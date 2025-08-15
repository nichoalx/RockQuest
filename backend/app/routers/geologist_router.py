from fastapi import Depends, APIRouter, HTTPException, Query
from datetime import datetime
from firebase_admin import firestore
from app.auth.dependencies import verify_token
from app.firebase import db
from app.models.models import Fact, UpdateFact, PostVerificationRequest, ReportDecisionRequest

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

# ----- Report Moderation -----

@geologist_router.get("/reported-posts")
def get_reported_posts(
    status: str = Query("pending", pattern="^(pending|approve|reject)$"),
    user=Depends(verify_token)
):
    # fetch reports by status
    reports = list(db.collection("report").where("status", "==", status).stream())
    items = []
    for r in reports:
        rv = r.to_dict()
        post_id = rv.get("postId")
        post_doc = db.collection("post").document(post_id).get()
        post = post_doc.to_dict() if post_doc.exists else None
        items.append({
            "reportId": r.id,
            **rv,
            "post": {"id": post_doc.id, **post} if post else None
        })
    return items

@geologist_router.post("/reports/{report_id}/decide")
def decide_report(
    report_id: str,
    action: str = Query(..., pattern="^(approve|reject)$"),
    user=Depends(verify_token)
):
    report_ref = db.collection("report").document(report_id)
    report_doc = report_ref.get()
    if not report_doc.exists:
        raise HTTPException(status_code=404, detail="Report not found")
    report = report_doc.to_dict()
    post_id = report.get("postId")
    post_ref = db.collection("post").document(post_id)
    post_doc = post_ref.get()
    if not post_doc.exists:
        raise HTTPException(status_code=404, detail="Post not found")

    # transaction to keep report + post in sync
    @firestore.transactional
    def run(tx):
        if action == "approve":
            tx.update(report_ref, {
                "status": "approve",
                "moderatedBy": user["uid"],
                "moderatedAt": firestore.SERVER_TIMESTAMP,
            })
            tx.update(post_ref, {
                "flagged": True,
                "flaggedBy": user["uid"],
                "flaggedAt": firestore.SERVER_TIMESTAMP,
            })
        else:
            tx.update(report_ref, {
                "status": "reject",
                "moderatedBy": user["uid"],
                "moderatedAt": firestore.SERVER_TIMESTAMP,
            })
            # optional: clear flagged if previously flagged
            # tx.update(post_ref, {"flagged": False})
    tx = db.transaction()
    run(tx)
    return {"message": f"Report {action}d"}

# --- list with embedded post document ---
@geologist_router.get("/reported")
def list_reported(status: str = Query("pending", regex="^(pending|approve|reject)$"), user=Depends(verify_token)):
    qs = db.collection("report").where("status", "==", status).order_by(
        "reportedAt", direction=firestore.Query.DESCENDING
    ).stream()

    out = []
    for doc in qs:
        item = {"reportId": doc.id, **doc.to_dict()}
        post_ref = db.collection("post").document(item["postId"])
        post_doc = post_ref.get()
        if post_doc.exists:
            item["post"] = {"id": post_doc.id, **post_doc.to_dict()}
        out.append(item)
    return out

# --- approve flags the post; reject just closes the report ---
@geologist_router.post("/reports/{report_id}/decision")
def decide_report(report_id: str, body: ReportDecisionRequest, user=Depends(verify_token)):
    rep_ref = db.collection("report").document(report_id)
    rep_doc = rep_ref.get()
    if not rep_doc.exists:
        raise HTTPException(status_code=404, detail="Report not found")

    data = rep_doc.to_dict() or {}
    post_id = data.get("postId")
    if not post_id:
        raise HTTPException(status_code=400, detail="Invalid report payload")

    post_ref = db.collection("post").document(post_id)
    if not post_ref.get().exists:
        # mark report as approved anyway (post might have been deleted)
        rep_ref.update({"status": body.action, "moderatedBy": user["uid"], "moderatedAt": firestore.SERVER_TIMESTAMP})
        return {"message": "Report closed (post missing)"}

    if body.action == "approve":
        post_ref.update({
            "flagged": True,
            "flaggedAt": firestore.ServerTimestamp,
            "flaggedBy": user["uid"]
        })
        rep_ref.update({
            "status": "approve",
            "moderatedBy": user["uid"],
            "moderatedAt": firestore.SERVER_TIMESTAMP
        })
        return {"message": "Post flagged"}
    else:
        rep_ref.update({
            "status": "reject",
            "moderatedBy": user["uid"],
            "moderatedAt": firestore.SERVER_TIMESTAMP
        })
        return {"message": "Report rejected"}