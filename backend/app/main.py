import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import admin_router, player_router, geologist_router, user_router

app = FastAPI(
    title="RockQuest API",
    description="API for Player, Geologist, and Admin roles in RockQuest",
    version="1.0.0"
)

# Enable CORS globally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Or use ["*"] for all (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the RockQuest API"}

# Include role-based routers
app.include_router(admin_router.admin_router)
app.include_router(user_router.router)
app.include_router(player_router.player_router)
app.include_router(geologist_router.geologist_router)

# Run directly
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
