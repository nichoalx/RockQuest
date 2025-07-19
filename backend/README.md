🪨 RockQuest Backend

This is the FastAPI backend for the RockQuest mobile application. It handles:

- Rock image uploads and metadata saving
- Firebase integration (Firestore & Storage)
- REST API routes for uploading rocks
- Admin-ready structure for moderation and quest management

------------------------------------------------------------

📦 Tech Stack

- Python 3.10+
- FastAPI
- Firebase Admin SDK
- Firestore (NoSQL DB)
- Firebase Storage
- Uvicorn (ASGI server)
- python-dotenv (for environment variable management)

Note: The machine learning model (TensorFlow.js) runs client-side; this backend manages image storage and metadata.

------------------------------------------------------------

🚀 Getting Started (for Developers)

1. Clone the Project

    git clone https://github.com/your-username/rockquest.git
    cd rockquest/backend

2. Create and Activate Virtual Environment

    python3 -m venv venv
    source venv/bin/activate        # On macOS/Linux
    venv\Scripts\activate           # On Windows

3. Install Dependencies

    pip install -r requirements.txt

4. Set Up Firebase Credentials

    - Download your Firebase Admin SDK service account key (e.g., firebase-admin-key.json)
    - Create a .env file in the backend/ folder:

      GOOGLE_APPLICATION_CREDENTIALS=firebase-admin-key.json
      FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

    Do not commit `.env` or `firebase-admin-key.json` to GitHub — these are secret.

5. Run the FastAPI Server

    uvicorn app.main:app --reload

    Visit http://127.0.0.1:8000 to verify the backend is running.

6. (Optional) Set Python Interpreter in VS Code

    If you're using VS Code, choose the virtual environment interpreter.

    Example path (adjust to your project):

    /Users/mensi/Downloads/RockQuest_FYP/RockQuest/backend/venv/bin/python

    Steps:
    - Open Command Palette (Cmd + Shift + P)
    - Type "Python: Select Interpreter"
    - Browse to or paste the path

------------------------------------------------------------

🧪 API Testing

Use Postman, curl, or any HTTP client to test.

POST /upload-rock/

    form-data:
    - file: image file
    - name: rock name (e.g. "Granite")

    Example Response:

    {
      "message": "Rock uploaded successfully",
      "data": {
        "name": "Granite",
        "imageUrl": "https://..."
      }
    }

------------------------------------------------------------

FireAPI Swagger can be open at http://127.0.0.1:8000/docs

