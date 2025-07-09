from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access environment variables
GOOGLE_APPLICATION_CREDENTIALS = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET")
