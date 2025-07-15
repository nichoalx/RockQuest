from fastapi import Header, HTTPException, Depends
from firebase_admin import auth

# Token verification
async def verify_token(authorization: str = Header(...)):
    try:
        id_token = authorization.split("Bearer ")[-1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # includes uid, email, and custom claims
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")