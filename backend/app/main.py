# backend/app/main.py

from fastapi import FastAPI, HTTPException
from typing import List
from datetime import datetime

from app.firebase import db
from app.models import Rock

app = FastAPI()

# Root route
@app.get("/")
def root():
    return {"message": "Welcome to the RockQuest API 🎉"}


# Get all rocks
@app.get("/get-rocks/", response_model=List[Rock])
def get_rocks():
    try:
        docs = db.collection("rocks").stream()
        rocks = []
        for doc in docs:
            rock = doc.to_dict()
            rock["id"] = doc.id
            rocks.append(rock)
        return rocks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get a single rock by ID
@app.get("/get-rock/{rock_id}")
def get_rock(rock_id: str):
    doc_ref = db.collection("rocks").document(rock_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found")
    return {**doc.to_dict(), "id": doc.id}


# Create a new rock
@app.post("/create-rock/")
def create_rock(rock: Rock):
    rock_data = rock.dict(exclude_unset=True)

    # Auto-fill createdAt if not provided
    if "createdAt" not in rock_data:
        rock_data["createdAt"] = datetime.utcnow()

    doc_ref = db.collection("rocks").document()
    doc_ref.set(rock_data)
    return {"message": "Rock created", "id": doc_ref.id}


# Update rock by ID
@app.put("/update-rock/{rock_id}")
def update_rock(rock_id: str, rock: Rock):
    doc_ref = db.collection("rocks").document(rock_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found")

    update_data = rock.dict(exclude_unset=True)
    doc_ref.update(update_data)
    return {"message": "Rock updated successfully", "id": rock_id}


# Delete rock by ID
@app.delete("/delete-rock/{rock_id}")
def delete_rock(rock_id: str):
    doc_ref = db.collection("rocks").document(rock_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Rock not found")

    doc_ref.delete()
    return {"message": "Rock deleted successfully", "id": rock_id}

# Optional: run directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)