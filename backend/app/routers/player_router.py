from fastapi import Depends, APIRouter, HTTPException, Query, UploadFile, File
from typing import List, Optional
from datetime import datetime

from app.auth.dependencies import verify_token
from app.models.models import Rock, Collection, Quest, DailyQuestStatus
from app.firebase import db

player_router = APIRouter(prefix="/player", tags=["Player"])

# ROCK COLLECTION 
@player_router.get("/rocks")
def get_my_rocks(user=Depends(verify_token)):
    saved_ref = db.collection("collection").document(user["uid"]).collection("saved")
    saved_doc = saved_ref.stream()

    rocks = []
    for doc in saved_doc:
        rock_id = doc.id
        collection_data = doc.to_dict()

        rock_doc = db.collection("rock").document(rock_id).get()
        if rock_doc.exists:
            rock_data = rock_doc.to_dict()

            rock_data.update({
                "savedAt": collection_data.get("savedAt"),
                "name": rock_data.get("rockName"),
                "imageUrl": collection_data.get("imageUrl") or rock_data.get("imageUrl")
            })
            rocks.append(rock_data)
    return {"rocks": rocks}

@player_router.post("/add-rock")
def add_rock(data: Collection, user=Depends(verify_token)):
    #rock
    rock_ref = db.collection("rock").document(data.rockId)
    if not rock_ref.get().exists:
        raise HTTPException(status_code=404, detail="Rock not found")

    #create the path in Collection: /collection/{userId}/saved/{rockId}
    collection_ref = db.collection("collection").document(user["uid"]).collection("saved").document(data.rockId)
    collection_ref.set({
        "savedAt": firestore.SERVER_TIMESTAMP,
        "imageUrl": data.imageUrl, #save uploaded rock image from user
    })
    #count num of rock in collection
    saved_ref = db.collection("collection").document(user["uid"]).collection("saved")
    saved_docs = saved_ref.stream()
    save_count = sum(1 for _ in saved_docs)
    #check achievement
    check_and_award_achievements(user["uid"], "save_rock", save_count)

    return {"message": f"Rock '{data.rockId}' saved to your collection."}

@player_router.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str, user=Depends(verify_token)):
    
    # Path: /collection/{userId}/saved/{rockId}
    collection_ref = db.collection("collection").document(user["uid"]).collection("saved").document(rock_id)
    
    if not collection_ref.get().exists:
        raise HTTPException(status_code=404, detail="Saved rock not found in your collection")

    collection_ref.delete()

    return {"message": "Rock removed from your collection."}

# QUESTS
@player_router.get("/daily-quests")
def get_daily_quests(user=Depends(verify_token)):

    today = datetime.now().strftime("%Y-%m-%d")
    start_of_day = datetime.today().replace(hour=0, minute=0, second=0, microsecond=0)

    quest_ref = db.collection("daily_quest").document(today).collection("quest")
    quests_doc = quest_ref.stream()
    #track whether user has done any activity today
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
    #track user quest completion
    #check whether user has scan and saved a rock into collection today
    saved_ref = db.collection("collection").document(user["uid"]).collection("saved")
    saved_today = list(saved_ref.where("savedAt", ">=", start_of_day).stream())
    if saved_today:
        completed_actions["scan_rock"] = True
        completed_actions["save_rock"] = True
    #check if user created a post today
    post_ref = db.collection("post")
    posts_today = list(post_ref.where("createdBy", "==", user["uid"])
                .where("createdAt", ">=", start_of_day).stream())
    if posts_today:
        completed_actions["submit_post"] = True


    daily_quest = []
    for doc in quests_doc:
        quest = doc.to_dict()
        quest["questId"] = doc.id

        #determine if completed based on action keywords or questId or title
        if "scan 1 sedimentary" in quest["title"].lower():
            quest["completed"] = completed_actions["scan_sedimentary"]
        elif "save" in quest["title"].lower():
            quest["completed"] = completed_actions["scan_igneous"]
        elif "post" in quest["title"].lower():
            quest["completed"] = completed_actions["scan_metamorphic"]
        elif "post" in quest["title"].lower():
            quest["completed"] = completed_actions["scan_3rocks"]
        elif "post" in quest["title"].lower():
            quest["completed"] = completed_actions["save_rock"]
        elif "post" in quest["title"].lower():
            quest["completed"] = completed_actions["save_3rocks"]
        elif "post" in quest["title"].lower():
            quest["completed"] = completed_actions["submit_post"]
        elif "post" in quest["title"].lower():
            quest["completed"] = completed_actions["view_fact"]
        else:
            quest["completed"] = False
        daily_quest.append(quest)

        #if quest is completed, log into DailyQuestStatus
        if completed:
            status_ref = db.collection("user_daily_quests")\
                .document(user["uid"])\
                .collection("dates")\
                .document(today)\
                .collection("quests")\
                .document(doc.id)

            status_ref.set({
                "questId": doc.id,
                "title": quest["title"],
                "description": quest["description"],
                "completed": True,
                "completedAt": firestore.SERVER_TIMESTAMP
            }, merge=True)
    return {
       "date":today, "dailyQuests" : daily_quest
    }

# GPS NEARBY ROCKS
@player_router.get("/gps-rocks")
def get_nearby_rocks(lat: float, lng: float, radius: float = 0.01, user=Depends(verify_token)):
    # Simulate basic filtering (no Firestore geoqueries)
    docs = db.collection("rock").stream()
    nearby = []
    for doc in docs:
        rock = doc.to_dict()
        if "lat" in rock and "lng" in rock:
            if abs(rock["lat"] - lat) <= radius and abs(rock["lng"] - lng) <= radius:
                rock["id"] = doc.id
                nearby.append(rock)
    return nearby

# ACHIEVEMENTS
@player_router.get("/achievements")
#view achievement
def get_achievements(user=Depends(verify_token)):
    achievement_ref = db.collection("players").document(user["uid"]).collection("achievements")
    achievement_docs = achievement_ref.stream()

    earned = []
    for doc in achievement_docs:
        data = doc.to_dict()
        data["achievementId"] = doc.id
        earned.append(data)

    return {
        "earnedAchievements": earned
    }

#check and award achievement
def check_and_award_achievements(user_id: str, action_type: str, current_count: int):
    achievements_ref = db.collection("achievements").where("type", "==", action_type).stream()
    
    for doc in achievements_ref:
        achievement = doc.to_dict()
        achievement_id = doc.id
        milestone = achievement.get("milestone", 0)

        if current_count >= milestone:
            # Check if already awarded
            player_achievement_ref = db.collection("players").document(user_id).collection("achievements").document(achievement_id)
            if not player_achievement_ref.get().exists:
                # Award achievement
                player_achievement_ref.set({
                    **achievement,
                    "unlockedAt": firestore.SERVER_TIMESTAMP
                })

# ROCK SCANNING (Still Mock)
@player_router.post("/scan-rock")
def scan_rock(file: UploadFile = File(...), user=Depends(verify_token)):
    # Simulate prediction




    # After saving scan activity
    scan_count = db.collection("scan").where("userId", "==", user["uid"]).get()
    check_and_award_achievements(user["uid"], "scan_rock", len(scan_count))


    return {
        "predictedType": "Granite",
        "confidenceScore": 0.87,
        "details": "Grainy igneous rock with quartz and feldspar."
    }
