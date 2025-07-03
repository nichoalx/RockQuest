# 🪨 RockQuest Backend

This is the FastAPI backend for the RockQuest mobile application. It handles:
- Rock image uploads and metadata saving
- Firebase integration (Firestore, Storage, Authentication)
- API routes for uploading rocks, managing quests, and admin moderation

---

## 📦 Tech Stack

- Python 3.10+
- FastAPI
- Firebase Admin SDK
- Firestore (NoSQL DB)
- Firebase Storage
- Uvicorn (for running the API)
- TensorFlow.js (model runs client-side; backend handles data)

---

## 🚀 Getting Started (for Developers)

### 1. Clone the Project

```bash
git clone https://github.com/your-username/rockquest.git
cd rockquest/backend

### 2. Create and Activate Virtual Environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

### 3. Install Dependencies
pip install -r requirements.txt


