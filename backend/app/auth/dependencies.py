from fastapi import Header, HTTPException, Depends
from firebase_admin import auth
from app.utils.jwt import decode_admin_token

def verify_admin_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token format")

    token = authorization.replace("Bearer ", "")
    payload = decode_admin_token(token)

    if payload.get("sub") != "admin@rockquest.com" or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden: Not an admin")

    return payload

# Token verification
async def verify_token(authorization: str = Header(...)):
    try:
        id_token = authorization.split("Bearer ")[-1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # includes uid, email, and custom claims
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

