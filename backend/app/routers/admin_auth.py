from fastapi import APIRouter, Body, HTTPException
from app.utils.jwt import create_admin_token

admin_auth_router = APIRouter(prefix="/admin-auth", tags=["AdminAuth"])

@admin_auth_router.post("/login")
def admin_login(email: str = Body(...), password: str = Body(...)):
    if email == "admin@rockquest.com" and password == "admin123":
        token = create_admin_token(email)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")
