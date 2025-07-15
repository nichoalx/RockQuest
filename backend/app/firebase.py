# backend/app/firebase.py
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv
load_dotenv()
cred = credentials.Certificate(os.getenv("FIREBASE_ADMIN_KEY"))
firebase_admin.initialize_app(cred)

db = firestore.client()
