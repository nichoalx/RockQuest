import os
import tempfile
import pytz
from fastapi import Depends, APIRouter, HTTPException, UploadFile, File
from typing import Optional, List, Dict, Any
from datetime import date, datetime, time, timedelta, timezone
from app.auth.dependencies import verify_token
from app.models.models import Rock, Collection, Quest, DailyQuestStatus
from app.firebase import db
from firebase_admin import firestore  # SERVER_TIMESTAMP + Increment
from inference_sdk import InferenceHTTPClient
from zoneinfo import ZoneInfo

player_router = APIRouter(prefix="/player", tags=["Player"])

# -------------------- config / constants --------------------
ROBOFLOW_API_URL = "https://serverless.roboflow.com"
ROBOFLOW_WORKSPACE = "test-yn6mq"
ROBOFLOW_WORKFLOW_ID = "rockquest-scan"
ROBOFLOW_API_KEY = "nNJQi1OfQ04HDaRcjJjs"
MIN_CONFIDENCE = 0.20

COLL_SPAWNED = "spawnedRock"   # <-- as per your DB
COLL_ROCK    = "rock"
COLL_USER    = "user"

rf_client = InferenceHTTPClient(api_url=ROBOFLOW_API_URL, api_key=ROBOFLOW_API_KEY)

# -------------------- helpers --------------------
LOCAL_TZ = pytz.timezone("Asia/Singapore")

def _local_day_bounds(d: date):
    start_local = LOCAL_TZ.localize(datetime.combine(d, time.min))
    end_local   = start_local + timedelta(days=1)
    return start_local.astimezone(timezone.utc), end_local.astimezone(timezone.utc)


def _utc_day_bounds(d: date):
    start = datetime.combine(d, time.min).replace(tzinfo=timezone.utc)
    end   = start + timedelta(days=1)
    return start, end

def _today_key_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def _normalize_rock_type(label: str) -> str:
    lab = (label or "").strip().lower()
    mapping = {
        # Igneous
        "basalt": "igneous", "dolerite": "igneous", "granite": "igneous",
        "norite": "igneous", "tuff": "igneous",
        # Sedimentary
        "conglomerate": "sedimentary", "limestone": "sedimentary",
        "mudstone": "sedimentary", "sandstone": "sedimentary", "shale": "sedimentary",
        # Metamorphic
        "gneiss": "metamorphic", "schist": "metamorphic", "quartzite": "metamorphic",
    }
    return mapping.get(lab, "igneous")

def _top_class_and_conf(predictions):
    if not isinstance(predictions, list) or not predictions:
        return {"label": None, "class_id": None, "confidence": None}
    best = max(predictions, key=lambda p: p.get("confidence", 0) or 0)
    return {
        "label": best.get("class"),
        "class_id": best.get("class_id"),
        "confidence": best.get("confidence"),
    }

# -------------------- ROCK COLLECTION --------------------
@player_router.get("/rocks")
def get_my_rocks(user=Depends(verify_token)):
    saved_ref = db.collection("collection").document(user["uid"]).collection("saved")
    saved_doc = saved_ref.stream()

    rocks = []
    for doc in saved_doc:
        saved = doc.to_dict() or {}
        rid = saved.get("rockId") or doc.id

        # join with rock meta (optional)
        rock_doc = db.collection(COLL_ROCK).document(rid).get()
        meta = rock_doc.to_dict() if rock_doc.exists else {}

        rocks.append({
            "rockId": rid,
            "name": saved.get("rockName") or meta.get("rockName") or rid,
            "type": meta.get("rockType") or meta.get("type"),
            "imageUrl": saved.get("imageUrl") or meta.get("imageUrl"),
            "count": int(saved.get("count", 0)),
            "savedAt": saved.get("savedAt"),
            "lastSavedAt": saved.get("lastSavedAt"),
        })
    return {"rocks": rocks}

@player_router.post("/add-rock")
def add_rock(data: Collection, user=Depends(verify_token)):
    """Save a rock to a user's collection, incrementing a per-rock 'count' up to 99."""
    rock_ref = db.collection(COLL_ROCK).document(data.rockId)
    rock_snap = rock_ref.get()
    if not rock_snap.exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    rock = rock_snap.to_dict() or {}
    rock_name = rock.get("rockName") or data.rockId

    doc_ref = db.collection("collection").document(user["uid"]).collection("saved").document(data.rockId)

    @firestore.transactional
    def _tx_inc(tx: firestore.Transaction):
        snap = doc_ref.get(transaction=tx)
        prev = int((snap.to_dict() or {}).get("count", 0))
        new_count = min(99, prev + 1)
        tx.set(
            doc_ref,
            {
                "rockId": data.rockId,
                "rockName": rock_name,
                "imageUrl": data.imageUrl or rock.get("imageUrl"),
                "count": new_count,
                "savedAt": firestore.SERVER_TIMESTAMP if prev == 0 else snap.to_dict().get("savedAt"),
                "lastSavedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
        return new_count

    tx = db.transaction()
    new_count = _tx_inc(tx)

    # optional: achievements on first save of this rock or total saves
    return {"message": "saved", "rockId": data.rockId, "count": new_count}

@player_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_token)):
    collection_ref = db.collection("collection").document(user["uid"]).collection("saved").document(rock_id)
    if not collection_ref.get().exists:
        raise HTTPException(status_code=404, detail="Saved rock not found in your collection")
    collection_ref.delete()
    return {"message": "Rock removed from your collection."}

# -------------------- QUESTS --------------------
@player_router.get("/daily-quests")
def get_daily_quests(user=Depends(verify_token)):
    today = _today_key_utc()
    start_of_day_utc = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    quest_ref = db.collection("daily_quest").document(today).collection("quest")
    quests_doc = quest_ref.stream()

    completed_actions = {
        "scan_sedimentary": False,
        "scan_igneous": False,
        "scan_metamorphic": False,
        "scan_3rocks": False,
        "save_rock": False,
        "save_3rocks": False,
        "submit_post": False,
        "view_fact": False
    }

    # O(1) read of today's scan counters
    day_ref = db.collection("player_scan_stats").document(user["uid"]).collection("days").document(today)
    day_doc = day_ref.get()
    day = day_doc.to_dict() if day_doc.exists else {}
    byType = (day or {}).get("byType", {}) if isinstance(day, dict) else {}

    rock_scan_counts = {
        "sedimentary": int(byType.get("sedimentary", 0) or 0),
        "igneous": int(byType.get("igneous", 0) or 0),
        "metamorphic": int(byType.get("metamorphic", 0) or 0),
    }
    scans_today_count = int((day or {}).get("count", 0) or 0)

    if rock_scan_counts["sedimentary"] >= 1:
        completed_actions["scan_sedimentary"] = True
    if rock_scan_counts["igneous"] >= 1:
        completed_actions["scan_igneous"] = True
    if rock_scan_counts["metamorphic"] >= 1:
        completed_actions["scan_metamorphic"] = True
    if scans_today_count >= 3:
        completed_actions["scan_3rocks"] = True

    # save-related checks (still streaming; make counters later if needed)
    saved_ref = db.collection("collection").document(user["uid"]).collection("saved")
    saved_today = list(saved_ref.where("savedAt", ">=", start_of_day_utc).stream())
    if len(saved_today) >= 1:
        completed_actions["save_rock"] = True
    if len(saved_today) >= 3:
        completed_actions["save_3rocks"] = True

    # post check (uploadedBy)
    posts_today = list(
        db.collection("post")
        .where("uploadedBy", "==", user["uid"])
        .where("createdAt", ">=", start_of_day_utc)
        .stream()
    )
    if len(posts_today) >= 1:
        completed_actions["submit_post"] = True

    # fact view check
    factView_ref = db.collection("fact_viewed").document(user["uid"]).collection("views").document(today)
    if factView_ref.get().exists:
        completed_actions["view_fact"] = True

    daily_quest = []
    for doc in quests_doc:
        q = doc.to_dict() or {}
        q["questId"] = doc.id
        title = (q.get("title") or "").lower()

        if "scan 1 sedimentary" in title:
            q["completed"] = completed_actions["scan_sedimentary"]
        elif "scan 1 igneous rock" in title:
            q["completed"] = completed_actions["scan_igneous"]
        elif "scan 1 metamorphic" in title:
            q["completed"] = completed_actions["scan_metamorphic"]
        elif "scan any 3 rocks" in title:
            q["completed"] = completed_actions["scan_3rocks"]
        elif "save 1 rock to collection" in title:
            q["completed"] = completed_actions["save_rock"]
        elif "save 3 rocks to collection" in title:
            q["completed"] = completed_actions["save_3rocks"]
        elif "create a post" in title:
            q["completed"] = completed_actions["submit_post"]
        elif "view fact" in title:
            q["completed"] = completed_actions["view_fact"]
        else:
            q["completed"] = False

        daily_quest.append(q)

        if q["completed"]:
            status_ref = (
                db.collection("user_daily_quests")
                .document(user["uid"])
                .collection("dates")
                .document(today)
                .collection("quests")
                .document(doc.id)
            )
            status_ref.set(
                {
                    "questId": doc.id,
                    "title": q.get("title"),
                    "description": q.get("description"),
                    "completed": True,
                    "completedAt": firestore.SERVER_TIMESTAMP,
                },
                merge=True,
            )

    return {"date": today, "dailyQuests": daily_quest}

# -------------------- GPS NEARBY ROCKS --------------------
@player_router.get("/gps-rocks")
def get_nearby_rocks(
    lat: float,
    lng: float,
    radius: float = 0.01,         # ~1.1km per 0.01° at equator
    include_meta: bool = True,
    user=Depends(verify_token),
):
    docs = db.collection(COLL_SPAWNED).stream()
    nearby: List[Dict[str, Any]] = []
    to_fetch_meta_ids = set()

    for doc in docs:
        s = doc.to_dict() or {}
        rlat, rlng = s.get("lat"), s.get("lng")
        if isinstance(rlat, (int, float)) and isinstance(rlng, (int, float)):
            if abs(rlat - lat) <= radius and abs(rlng - lng) <= radius:
                item = {
                    "id": doc.id,
                    "rockId": s.get("rockId"),
                    "lat": rlat,
                    "lng": rlng,
                    "confidence": s.get("confidence"),
                    "spawnedAt": s.get("spawnedAt"),
                    "spawnedBy": s.get("spawnedBy"),
                }
                nearby.append(item)
                if include_meta and s.get("rockId"):
                    to_fetch_meta_ids.add(s["rockId"])

    if include_meta and to_fetch_meta_ids:
        for item in nearby:
            rid = item.get("rockId")
            if not rid:
                continue
            rock_snap = db.collection(COLL_ROCK).document(rid).get()
            if rock_snap.exists:
                meta = rock_snap.to_dict() or {}
                item["rockMeta"] = {
                    "name": meta.get("rockName"),
                    "imageUrl": meta.get("imageUrl"),
                    "type": meta.get("type"),
                }

    return nearby

# -------------------- ACHIEVEMENTS --------------------
@player_router.get("/achievements")
def get_achievements(user=Depends(verify_token)):
    achievement_ref = db.collection("players").document(user["uid"]).collection("achievements")
    earned = []
    for doc in achievement_ref.stream():
        data = doc.to_dict() or {}
        data["achievementId"] = doc.id
        earned.append(data)
    return {"earnedAchievements": earned}

def check_and_award_achievements(user_id: str, action_type: str, current_count: int):
    for doc in db.collection("achievements").where("type", "==", action_type).stream():
        achievement = doc.to_dict() or {}
        achievement_id = doc.id
        milestone = achievement.get("milestone", 0)
        if current_count >= milestone:
            pa_ref = db.collection("players").document(user_id).collection("achievements").document(achievement_id)
            if not pa_ref.get().exists:
                pa_ref.set({**achievement, "unlockedAt": firestore.SERVER_TIMESTAMP})

@player_router.post("/scan-rock")
async def scan_rock(file: UploadFile = File(...), user=Depends(verify_token)):
    """
    Run the Roboflow workflow, log the scan, update counters:
      - user/{uid}.scanCount           (lifetime)
      - player_scan_stats/{uid}/days/{YYYY-MM-DD} (count + byType)
    Return prediction + scanCount.
    """
    # --- Save upload to temp path for SDK ---
    tmp_path = None
    try:
        suffix = os.path.splitext(file.filename or "upload")[1] or ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            tmp.write(await file.read())

        result = rf_client.run_workflow(
            workspace_name=ROBOFLOW_WORKSPACE,
            workflow_id=ROBOFLOW_WORKFLOW_ID,
            images={"image": tmp_path},
            use_cache=True,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roboflow inference failed: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass

    # --- Extract predictions (handles list & dict like Claude's fix) ---
    predictions = None

    if isinstance(result, list) and len(result) > 0:
        result_dict = result[0]  # first (and only) result
        if isinstance(result_dict, dict) and "predictions" in result_dict:
            # common: {"predictions":{"predictions":[...]}}
            preds_block = result_dict["predictions"]
            predictions = (
                preds_block.get("predictions", [])
                if isinstance(preds_block, dict)
                else preds_block
            )
        # extra safety: look under outputs/steps if present
        if not predictions:
            outputs = result_dict.get("outputs") if isinstance(result_dict, dict) else None
            if isinstance(outputs, dict):
                pp = outputs.get("predictions")
                if isinstance(pp, list):
                    predictions = pp
            steps = result_dict.get("steps") if isinstance(result_dict, dict) else None
            if isinstance(steps, dict):
                for _, step_val in steps.items():
                    if isinstance(step_val, dict):
                        if isinstance(step_val.get("predictions"), list):
                            predictions = step_val["predictions"]
                            break
                        if isinstance(step_val.get("predictions"), dict):
                            pp = step_val["predictions"].get("predictions")
                            if isinstance(pp, list):
                                predictions = pp
                                break

    elif isinstance(result, dict):
        predictions = result.get("predictions")
        if predictions is None:
            outputs = result.get("outputs") or {}
            predictions = outputs.get("predictions")
        if predictions is None:
            steps = result.get("steps") or {}
            for _, step_val in steps.items():
                if isinstance(step_val, dict):
                    if isinstance(step_val.get("predictions"), list):
                        predictions = step_val["predictions"]
                        break
                    if isinstance(step_val.get("predictions"), dict):
                        pp = step_val["predictions"].get("predictions")
                        if isinstance(pp, list):
                            predictions = pp
                            break

    # normalize predictions to list
    if predictions is None:
        predictions = []

    top = _top_class_and_conf(predictions)
    top_label = top["label"] or "unknown"
    # coerce confidence safely
    try:
        top_conf = float(top["confidence"]) if top["confidence"] is not None else None
    except (TypeError, ValueError):
        top_conf = None
    top_id = top["class_id"]

    # explicit "no predictions" guard (clearer than low-confidence)
    if not predictions:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "No predictions returned by workflow",
                "workflowResult": result,
            },
        )

    # min-confidence guard
    if not isinstance(top_conf, (int, float)) or top_conf < MIN_CONFIDENCE:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Low-confidence prediction",
                "min_confidence": MIN_CONFIDENCE,
                "rawLabel": top_label,
                "confidence": top_conf,
                "workflowResult": result,
            },
        )

    normalized_type = _normalize_rock_type(top_label)
    uid = user["uid"]
    today_key = _today_key_utc()  # make sure this helper exists

    # (1) raw scan log (audit/history)
    db.collection("rock_scans").document(uid).collection("scans").add({
        "rockType": normalized_type,
        "rawLabel": top_label,
        "classId": top_id,
        "confidence": float(top_conf),
        "scannedAt": firestore.SERVER_TIMESTAMP,
    })

    # (2) increment counters atomically (lifetime + today's byType)
    batch = db.batch()

    # ensure these constants/helpers exist:
    #   COLL_USER = "user"
    user_ref = db.collection(COLL_USER).document(uid)
    batch.set(user_ref, {"scanCount": firestore.Increment(1)}, merge=True)

    day_ref = db.collection("player_scan_stats").document(uid).collection("days").document(today_key)
    batch.set(day_ref, {
        "count": firestore.Increment(1),
        f"byType.{normalized_type}": firestore.Increment(1),
        "date": today_key,
        "updatedAt": firestore.SERVER_TIMESTAMP,
    }, merge=True)

    batch.commit()

    # (3) award achievements using updated total
    total_doc = user_ref.get()
    total_scans = int((total_doc.to_dict() or {}).get("scanCount", 0)) if total_doc.exists else 0
    check_and_award_achievements(uid, "scan_rock", total_scans)

    return {
        "predictedType": normalized_type,
        "rawLabel": top_label,
        "classId": top_id,
        "confidenceScore": float(top_conf),
        "scanCount": total_scans,        # <-- include current total
        "workflowResult": result,        # keep during bring-up
    }

@player_router.get("/scan-stats")
def get_scan_stats(date: Optional[str] = None, user=Depends(verify_token)):
    uid = user["uid"]
    # default to today's key in UTC
    key = date or _today_key_utc()

    # day doc
    day_ref = db.collection("player_scan_stats").document(uid).collection("days").document(key)
    day_snap = day_ref.get()
    day_data = day_snap.to_dict() or {}
    day = {"date": key, "count": int(day_data.get("count", 0)), "byType": day_data.get("byType", {})}

    # lifetime total on user doc
    user_ref = db.collection(COLL_USER).document(uid)
    user_snap = user_ref.get()
    total = int((user_snap.to_dict() or {}).get("scanCount", 0)) if user_snap.exists else 0

    return {"day": day, "total": total}

@player_router.get("/quests-summary")
def get_quests_summary(user=Depends(verify_token)):
    today_local_date = datetime.now(LOCAL_TZ).date()
    start_utc, end_utc = _local_day_bounds(today_local_date)
    today_key_local = today_local_date.strftime("%Y-%m-%d")

    quests_col = db.collection("quest")

    # ---- TODAY (Timestamp) ----
    todays = list(
        quests_col
        .where("date", ">=", start_utc)
        .where("date", "<",  end_utc)
        .limit(1)
        .stream()
    )

    # ---- Fallback if you stored ISO strings ----
    if not todays:
        todays = list(
            quests_col
            .where("date", "==", today_key_local)
            .limit(1)
            .stream()
        )

    today_obj = None
    if todays:
        tdoc = todays[0].to_dict() or {}
        # Normalized for client: always return local date string
        today_obj = {
            "date": today_key_local,
            "title": tdoc.get("title") or "Today's Quest",
            "description": tdoc.get("description"),
        }

    # ---- UPCOMING (next 10; Timestamp path first) ----
    upcoming = []
    ups = list(
        quests_col
        .where("date", ">=", end_utc)      # strictly after today (local) window
        .order_by("date")
        .limit(10)
        .stream()
    )

    # Fallback for ISO strings
    if not ups:
        ups = list(
            quests_col
            .where("date", ">", today_key_local)
            .order_by("date")
            .limit(10)
            .stream()
        )

    for doc in ups:
        q = doc.to_dict() or {}
        qd = q.get("date")
        if isinstance(qd, datetime):
            # show local date to users
            q_date_str = qd.astimezone(LOCAL_TZ).date().strftime("%Y-%m-%d")
        else:
            q_date_str = str(qd)
        upcoming.append({"date": q_date_str, "title": q.get("title") or "Quest"})

    return {"today": today_obj, "upcoming": upcoming}