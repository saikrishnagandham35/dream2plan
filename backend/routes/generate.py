from fastapi import APIRouter, Header
from typing import Optional
from models.schemas import UserInput
from models.database import blueprints_collection, db
from agents.prompt_builder import build_structured_prompt
from agents.llm_agent import generate_blueprint
from agents.output_parser import parse_blueprint_to_json
from datetime import datetime
from bson import ObjectId
import jwt
import os

router = APIRouter()

SECRET_KEY = os.getenv("JWT_SECRET", "dream2plan_secret_key_2026")


def get_user_id_from_token(authorization: Optional[str]) -> Optional[str]:
    """Extract user_id from Bearer token, return None if invalid/missing."""
    try:
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload.get("user_id")
    except Exception:
        pass
    return None


@router.post("/generate")
async def generate(user_input: UserInput, authorization: Optional[str] = Header(None)):
    try:
        # Step 1 — Build structured prompt
        prompt = build_structured_prompt(user_input)

        # Step 2 — Generate blueprint using LLM + multi-query RAG
        raw_blueprint = generate_blueprint(
            prompt=prompt,
            domain=user_input.business_domain or "",
            investment=user_input.investment_amount or "",
            location=user_input.location or "India"
        )

        # Step 3 — Check for LLM error
        if raw_blueprint.startswith("❌"):
            return {"status": "error", "message": raw_blueprint}

        # Step 4 — Parse into structured JSON
        structured_blueprint = parse_blueprint_to_json(raw_blueprint)

        # Step 5 — Format investment for display
        investment = user_input.investment_amount
        investment_display = "Not specified"
        if investment:
            try:
                num = int(float(investment))
                if num >= 10000000:
                    investment_display = f"₹{num/10000000:.1f} Crore"
                elif num >= 100000:
                    investment_display = f"₹{num/100000:.1f} Lakh"
                elif num >= 1000:
                    investment_display = f"₹{num/1000:.1f}K"
                else:
                    investment_display = f"₹{num:,}"
            except:
                investment_display = f"₹{investment}"

        # Step 6 — Get logged-in user (if any)
        user_id = get_user_id_from_token(authorization)

        # Step 7 — Save to MongoDB (with user_id if logged in)
        result = {
            "user_id":             user_id,          # None if not logged in
            "domain":              user_input.business_domain or "AI Recommended",
            "input":               user_input.dict(),
            "raw_blueprint":       raw_blueprint,
            "structured_blueprint": structured_blueprint,
            "created_at":          datetime.utcnow(),
        }
        inserted = blueprints_collection.insert_one(result)

        # Step 8 — Increment user's blueprint count if logged in
        if user_id and db is not None:
            try:
                db["users"].update_one(
                    {"_id": ObjectId(user_id)},
                    {"$inc": {"blueprints_count": 1}}
                )
                print(f"✅ Blueprint saved for user {user_id}")
            except Exception as e:
                print(f"⚠️  Count update failed (non-critical): {e}")

        return {
            "status": "success",
            "blueprint_id": str(inserted.inserted_id),
            "input_summary": {
                "investment":     investment_display,
                "investment_raw": investment,
                "risk":           user_input.risk_level or "Medium",
                "domain":         user_input.business_domain or "AI Recommended",
                "location":       user_input.location or "India",
                "idea":           user_input.user_message or ""
            },
            "blueprint": structured_blueprint
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/blueprint/{blueprint_id}")
async def get_blueprint(blueprint_id: str):
    try:
        blueprint = blueprints_collection.find_one({"_id": ObjectId(blueprint_id)})
        if blueprint:
            blueprint["_id"] = str(blueprint["_id"])
            return {"status": "success", "blueprint": blueprint}
        else:
            return {"status": "error", "message": "Blueprint not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}