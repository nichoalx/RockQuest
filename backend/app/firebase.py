# backend/app/firebase.py
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, storage
from dotenv import load_dotenv

# Load environment variables for local development
load_dotenv()

def get_secret_from_manager(secret_name, project_id="rockquest-sg"):
    """Get secret from Secret Manager or fall back to environment variable"""
    if os.getenv('GOOGLE_CLOUD_PROJECT'):  # Running on Cloud Run
        try:
            from google.cloud import secretmanager
            client = secretmanager.SecretManagerServiceClient()
            name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
            response = client.access_secret_version(request={"name": name})
            return response.payload.data.decode("UTF-8")
        except ImportError:
            # Secret Manager not available, fall back to environment
            pass
    
    # Local development - get from environment variable
    env_var_name = secret_name.upper().replace('-', '_')
    return os.getenv(env_var_name)

def get_firebase_credentials():
    firebase_key = get_secret_from_manager("firebase-admin-key")
    
    if firebase_key and firebase_key.startswith('{'):
        # JSON string from Secret Manager
        return json.loads(firebase_key)
    else:
        # File path for local development
        return firebase_key or "firebase-admin-key.json"

# Initialize Firebase
firebase_creds = get_firebase_credentials()

if isinstance(firebase_creds, dict):
    # Running on Cloud Run with JSON credentials
    cred = credentials.Certificate(firebase_creds)
else:
    # Local development with file path
    cred = credentials.Certificate(firebase_creds)

firebase_admin.initialize_app(cred)
db = firestore.client()

# Get other secrets and make them available as module-level variables
ADMIN_SECRET_KEY = get_secret_from_manager("admin-secret-key")
ROBOFLOW_API_KEY = get_secret_from_manager("roboflow-api-key")

# Validate required secrets
if not ADMIN_SECRET_KEY:
    raise ValueError("Missing ADMIN_SECRET_KEY")
if not ROBOFLOW_API_KEY:
    raise ValueError("Missing ROBOFLOW_API_KEY")