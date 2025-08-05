import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# CORS middleware (optional: adjust domain for production)
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://LOCALHOST:3000",  # in case browser uppercases it
],
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, PUT, DELETE, etc
    allow_headers=["*"],  # allow Authorization, Content-Type, etc
)


@app.get("/")
def root():
    return {"message": "Welcome to the RockQuest API"}

# Only run this if called directly
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
