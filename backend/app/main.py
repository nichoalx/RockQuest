from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from uuid import uuid4
from datetime import datetime
import mimetypes

from app.firebase import db, bucket  # Firebase setup from firebase.py

app = FastAPI()

@app.get("/")
def root():
    return {"message": "RockQuest backend is running"}

@app.post("/upload-rock/")
async def upload_rock(file: UploadFile = File(...), name: str = "Unknown"):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Validate file size (~5MB limit)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    await file.seek(0)

    try:
        # Upload to Firebase Storage
        ext = mimetypes.guess_extension(file.content_type) or ".jpg"
        filename = f"rocks/{uuid4()}{ext}"
        blob = bucket.blob(filename)
        blob.upload_from_file(file.file, content_type=file.content_type)
        blob.make_public()

        # Create Firestore document
        rock_entry = {
            "name": name,
            "imageUrl": blob.public_url,
            "uploadedAt": datetime.utcnow()
        }
        db.collection("rocks").add(rock_entry)

        return {"message": "Rock uploaded successfully", "data": rock_entry}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
