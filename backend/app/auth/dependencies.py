from fastapi import Header, HTTPException, Depends
from firebase_admin import auth
from app.firebase import db

# Token verification
async def verify_token(authorization: str = Header(...)):
    try:
        id_token = authorization.split("Bearer ")[-1]
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token  # includes uid, email, etc.
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# Require specific user type  (player, geologist, admin)
def require_type(expected_type: str):
    def dependency(user=Depends(verify_token)):
        doc = db.collection("user").document(user["uid"]).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = doc.to_dict()
        if user_data.get("type") != expected_type:
            raise HTTPException(status_code=403, detail=f"Access restricted to {expected_type}s only.")

        return {**user, **user_data}
    return dependency


# Shortcut wrappers (optional)
require_player = require_type("player")
require_geologist = require_type("geologist")
require_admin = require_type("admin")
