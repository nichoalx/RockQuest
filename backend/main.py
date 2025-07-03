from fastapi import FastAPI, UploadFile, File
import firebase_admin
from firebase_admin import credentials, firestore, storage
import uuid

app = FastAPI()

# Firebase initialization
cred = credentials.Certificate("firebase-admin-key.json")
firebase_admin.initialize_app(cred, {
    "storageBucket": "your-firebase-bucket-name.appspot.com"
})

db = firestore.client()
bucket = storage.bucket()

@app.get("/")
def root():
    return {"message": "RockQuest backend is running"}

@app.post("/upload-rock/")
async def upload_rock(file: UploadFile = File(...), name: str = "Unknown"):
    blob = bucket.blob(f"rocks/{uuid.uuid4()}.jpg")
    blob.upload_from_file(file.file, content_type=file.content_type)
    image_url = blob.public_url

    rock_entry = {
        "name": name,
        "imageUrl": image_url
    }
    db.collection("rocks").add(rock_entry)
    return {"message": "Rock uploaded successfully", "data": rock_entry}
