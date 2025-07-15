# backend/app/firebase.py
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv

load_dotenv()
#initialise firebase
if not firebase_admin._apps:
    cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
    firebase_admin.initialize_app(cred, {
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET")
    })

db = firestore.client()
bucket = storage.bucket()

print("KEY PATH:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))

