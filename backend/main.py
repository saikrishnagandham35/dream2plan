from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models.database import db
from routes.generate import router as generate_router
from routes.recommend import router as recommend_router
from routes.auth import router as auth_router
import os

load_dotenv()

app = FastAPI(
    title="Dream2Plan API",
    description="AI Startup Blueprint Generator",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(generate_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Dream2Plan API is running! 🚀"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "groq_key": "loaded" if os.getenv("GROQ_API_KEY") else "missing",
        "mongodb_uri": "loaded" if os.getenv("MONGODB_URI") else "missing"
    }

@app.get("/test-db")
def test_db():
    if db is not None:
        return {"status": "✅ MongoDB Connected!"}
    else:
        return {"status": "❌ MongoDB Connection Failed!"}