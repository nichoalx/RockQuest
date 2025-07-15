from fastapi import Request, HTTPException
import firebase_admin
from firebase_admin import auth, credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate("./firebase-admin-key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

def verify_token(request: Request):

    token: str | None = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    
    elif "token" in request.cookies:
        token = request.cookies["token"]

    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        decoded = auth.verify_id_token(token, checkRevoked=True)
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token revoked")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    uid = decoded["uid"]

    snap = db.collection("users").document(uid).get()
    if not snap.exists:
        raise HTTPException(status_code=403, detail="User not found")
    
    return {"uid": uid, **snap.to.dict()}
    """
    try:
        if not authorization.startswith("Bearer"):
            raise HTTPException(status_code=401, detail="Invalid Token format")
            
            idToken= authorization.split(" ")[1]
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token["uid"]

            user_doc = db.collection("users").document(uid).get()
            if not user_doc.exists:
                raise HTTPException(status_code=401, detail = "User not found")
            
            user_data = user_doc.to_dict()
            return {"uid": uid, **user_data}
        
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    """