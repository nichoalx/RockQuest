# backend/app/main.py

from fastapi import FastAPI
from app.routers import player_router, geologist_router, admin_router  # import your routers

app = FastAPI(
    title="RockQuest API",
    description="API for Player, Geologist, and Admin roles in RockQuest",
    version="1.0.0"
)

# Root welcome route
@app.get("/")
def root():
    return {"message": "Welcome to the RockQuest API"}

# Include role-based routers
app.include_router(player_router.player_router)
app.include_router(geologist_router.geologist_router)
app.include_router(admin_router.admin_router)

# Optional: run directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
