# backend/app/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import firebase to initialize it
from app import firebase  # This will run the firebase initialization

from app.routers import admin_router, player_router, geologist_router, user_router
from app.routers.admin_auth import admin_auth_router

# Define app first
app = FastAPI(
    title="RockQuest API",
    description="API for Player, Geologist, and Admin roles in RockQuest",
    version="1.0.0"
)

# Include routers after defining app
app.include_router(admin_auth_router)
app.include_router(admin_router.admin_router)
app.include_router(user_router.router)
app.include_router(player_router.player_router)
app.include_router(geologist_router.geologist_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",   # Expo web preview
        "http://127.0.0.1:19006",
        "exp://*",                  # Expo Go
        "http://localhost:5173",
        "http://192.168.1.0/24",
        "*",                        # Dev only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the RockQuest API"}

# Only run this if called directly
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)