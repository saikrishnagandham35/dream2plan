from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

def get_database():
    try:
        client = MongoClient(os.getenv("MONGODB_URI"))
        db = client["dream2plan"]
        # Test connection
        client.admin.command('ping')
        print("✅ MongoDB Connected Successfully!")
        return db
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")
        return None

# Initialize database
db = get_database()

# Collections
users_collection = db["users"] if db is not None else None
blueprints_collection = db["blueprints"] if db is not None else None