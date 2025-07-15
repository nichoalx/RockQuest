# backend/app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List
from datetime import datetime
from pydantic import BaseModel, EmailStr

import firebase_admin
from firebase_admin import credentials, auth, firestore
from app.auth_utils import verify_token
from app.firebase import db
from app.models import User, Login, Rock
import os
FIREBASE_API_KEY = os.getenv("FIREBASE_API_key")

#initialise firebase admin sdk once
if not firebase_admin._apps:
    cred = credentials.Certificate("./firebase-admin-key.json")
    firebase_admin.initialize_app(cred)

#initialise firestore db
#db = firestore.client()
#initialize fast api
app = FastAPI()

#register user
@app.post("/register")
def register_user(user: User):
    try:
        #check for duplicate email address
        emailExists = db.collection("users").where("emailAddress", "==", user.emailAddress).stream()
        if any(emailExists):
            raise HTTPException(status_code=400, detail="Account exists. Please use another email address")

        #check for duplicate username
        usernameExists = db.collection("users").where("emailAddress", "==", user.emailAddress).stream()
        if any(usernameExists):
            raise HTTPException(status_code=400, detail="Account exists. Please use another email address")

        created_user = auth.create_user(
            email = user.emailAddress,
            password = user.password,
            display_name = user.username
        )
        user_data = {
        "username": user.username,
        "email": user.emailAddress,
        "role": "player",
        "created_at": firestore.SERVER_TIMESTAMP
    }
        db.collection("users").document(created_user.uid).set(user_data)
        return {"message": "User registered successfully", "uid": created_user.uid}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

#login
@app.post("/login")
def login_user(login: Login):
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_API_KEY}"
        payload = {
            "email": login.emailAddress,
            "password": login.password,
            "returnSecureToken": True
        }
        response = requests.post(url, json=payload)
        data = response.json()
        if "idToken" in data:
            resp = JSONResponse({"message":"Login successful",
                "uid" : data["localId"],
                "expiresIn" : data["expiresIn"]})

            resp.set_cookie(key="token", value=data["idToken"],
                httponly=True, secure=True,
                samesite="Lax", max_age=int(data["expiresIn"])
            )
            return resp
            """
            return {
                "message":"Login successful",
                "idToken": data["idToken"],
                "refreshToken": data["refreshToken"],
                "expiresIn": data["expiresIn"]
            }
            """
        else:
            raise HTTPException(status_code=401, detail=data.get("error", {}).get("message", "Login unsuccessful"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#logout
@app.post("/logout")
def logout(current_user: dict = Depends(verify_token)):
    uid = current_user["uid"]
    auth.revoke_refresh_tokens(uid)
    resp = JSONResponse({"message" : "Logged out"})
    resp.delete_cookies("token")
    return resp

#profile
@app.get("/profile")
def get_profile(current_user: dict = Depends(verify_token)):
    return {
        "message" : f"Welcome, {current_user['username']}!",
        "user": current_user
    }

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