import jwt
from fastapi import HTTPException
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from app.firebase import ADMIN_SECRET_KEY

# Load environment variables
load_dotenv()

# Get secret key from .env
SECRET_KEY = ADMIN_SECRET_KEY
ALGORITHM = "HS256"

if not SECRET_KEY:
    raise ValueError("Missing ADMIN_SECRET_KEY in .env file")

def create_admin_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=12)
    payload = {
        "sub": email,
        "role": "admin",
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_admin_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
