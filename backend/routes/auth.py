from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
import bcrypt
import jwt
import os
import re
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from models.database import db

load_dotenv()
router = APIRouter()
security = HTTPBearer()

SECRET_KEY  = os.getenv("JWT_SECRET", "dream2plan_secret_key_2026")
ALGORITHM   = "HS256"
TOKEN_DAYS  = 7
EMAIL_USER  = os.getenv("EMAIL_USER", "")
EMAIL_PASS  = os.getenv("EMAIL_PASS", "")

# In-memory OTP store  { email: { otp, expires } }
otp_store = {}

# ── Pydantic models ────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ForgotRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

# ── Helpers ────────────────────────────────────────────────────
def is_valid_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str, name: str) -> str:
    payload = {
        "user_id": user_id,
        "email":   email,
        "name":    name,
        "exp":     datetime.utcnow() + timedelta(days=TOKEN_DAYS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please login again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return decode_token(credentials.credentials)

def send_otp_email(to_email: str, otp: str, name: str = "User"):
    """Send OTP via Gmail SMTP."""
    if not EMAIL_USER or not EMAIL_PASS:
        print(f"⚠️  Email not configured. OTP for {to_email}: {otp}")
        return

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f0f0f;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#14b8a6,#0d9488);padding:32px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:1.8rem;letter-spacing:-0.02em;">💡 Dream2Plan</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:0.9rem;">Password Reset Request</p>
      </div>
      <div style="padding:32px;background:#161616;">
        <p style="color:#9db8b4;font-size:0.95rem;line-height:1.6;">Hi <strong style="color:#e8f5f3;">{name}</strong>,</p>
        <p style="color:#9db8b4;font-size:0.95rem;line-height:1.6;">
          We received a request to reset your Dream2Plan password. Use the OTP below:
        </p>
        <div style="background:#0f0f0f;border:2px solid #14b8a6;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
          <p style="color:#9db8b4;font-size:0.8rem;margin:0 0 8px;letter-spacing:0.08em;text-transform:uppercase;">Your OTP Code</p>
          <h2 style="color:#14b8a6;font-size:2.4rem;letter-spacing:0.2em;margin:0;font-family:monospace;">{otp}</h2>
          <p style="color:#556b68;font-size:0.78rem;margin:10px 0 0;">Valid for 10 minutes only</p>
        </div>
        <p style="color:#556b68;font-size:0.82rem;line-height:1.6;">
          If you did not request this, please ignore this email. Your account is safe.
        </p>
      </div>
      <div style="padding:16px 32px;background:#0f0f0f;text-align:center;border-top:1px solid #1e1e1e;">
        <p style="color:#3a5552;font-size:0.75rem;margin:0;">Dream2Plan — AI Startup Blueprint Generator</p>
      </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🔐 {otp} is your Dream2Plan OTP"
    msg["From"]    = f"Dream2Plan <{EMAIL_USER}>"
    msg["To"]      = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, to_email, msg.as_string())
        print(f"✅ OTP sent to {to_email}")
    except Exception as e:
        print(f"❌ Email send error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Check EMAIL_USER and EMAIL_PASS in .env")


# ── SIGNUP ─────────────────────────────────────────────────────
@router.post("/auth/signup")
async def signup(req: SignupRequest):
    try:
        # Validate email format
        if not is_valid_email(req.email):
            raise HTTPException(status_code=400, detail="Please enter a valid email address (e.g. name@gmail.com)")

        if len(req.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

        if len(req.name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Name must be at least 2 characters")

        users = db["users"]
        if users.find_one({"email": req.email.lower().strip()}):
            raise HTTPException(status_code=400, detail="This email is already registered. Please sign in.")

        user = {
            "name":             req.name.strip(),
            "email":            req.email.lower().strip(),
            "password":         hash_password(req.password),
            "created_at":       datetime.utcnow(),
            "blueprints_count": 0,
        }
        result = users.insert_one(user)
        user_id = str(result.inserted_id)
        token = create_token(user_id, req.email.lower(), req.name.strip())

        return {
            "status":  "success",
            "message": "Account created successfully!",
            "token":   token,
            "user":    {"id": user_id, "name": req.name.strip(), "email": req.email.lower()},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── LOGIN ──────────────────────────────────────────────────────
@router.post("/auth/login")
async def login(req: LoginRequest):
    try:
        if not is_valid_email(req.email):
            raise HTTPException(status_code=400, detail="Please enter a valid email address")

        users = db["users"]
        user  = users.find_one({"email": req.email.lower().strip()})

        if not user or not verify_password(req.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id = str(user["_id"])
        token   = create_token(user_id, user["email"], user["name"])

        return {
            "status":  "success",
            "message": f"Welcome back, {user['name']}!",
            "token":   token,
            "user":    {"id": user_id, "name": user["name"], "email": user["email"]},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── GET ME ─────────────────────────────────────────────────────
@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        users = db["users"]
        user  = users.find_one({"_id": ObjectId(current_user["user_id"])})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {
            "status": "success",
            "user": {
                "id":               str(user["_id"]),
                "name":             user["name"],
                "email":            user["email"],
                "created_at":       user.get("created_at", ""),
                "blueprints_count": user.get("blueprints_count", 0),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── HISTORY ────────────────────────────────────────────────────
@router.get("/auth/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    try:
        blueprints = db["blueprints"]
        docs = list(
            blueprints.find(
                {"user_id": current_user["user_id"]},
                {"raw_blueprint": 0}
            ).sort("created_at", -1).limit(20)
        )
        result = []
        for bp in docs:
            result.append({
                "id":         str(bp["_id"]),
                "domain":     bp.get("input", {}).get("business_domain") or bp.get("domain", "Unknown"),
                "investment": bp.get("input", {}).get("investment_amount", ""),
                "risk":       bp.get("input", {}).get("risk_level", ""),
                "idea":       bp.get("input", {}).get("user_message", ""),
                "created_at": str(bp.get("created_at", "")),
                "blueprint":  bp.get("structured_blueprint", {}),
            })
        return {"status": "success", "blueprints": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── FORGOT PASSWORD — send OTP ─────────────────────────────────
@router.post("/auth/forgot-password")
async def forgot_password(req: ForgotRequest):
    try:
        if not is_valid_email(req.email):
            raise HTTPException(status_code=400, detail="Please enter a valid email address")

        users = db["users"]
        user  = users.find_one({"email": req.email.lower().strip()})

        # Always return success to prevent email enumeration
        if not user:
            return {"status": "success", "message": "If this email is registered, an OTP has been sent."}

        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        otp_store[req.email.lower()] = {
            "otp":     otp,
            "expires": datetime.utcnow() + timedelta(minutes=10),
            "name":    user["name"],
        }

        send_otp_email(req.email.lower(), otp, user["name"])

        return {"status": "success", "message": "OTP sent to your email. Valid for 10 minutes."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── VERIFY OTP ─────────────────────────────────────────────────
@router.post("/auth/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    email = req.email.lower().strip()
    record = otp_store.get(email)

    if not record:
        raise HTTPException(status_code=400, detail="No OTP found. Please request a new one.")

    if datetime.utcnow() > record["expires"]:
        del otp_store[email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if record["otp"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please try again.")

    return {"status": "success", "message": "OTP verified successfully!"}


# ── RESET PASSWORD ─────────────────────────────────────────────
@router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    try:
        email = req.email.lower().strip()
        record = otp_store.get(email)

        if not record:
            raise HTTPException(status_code=400, detail="OTP session expired. Please start over.")

        if datetime.utcnow() > record["expires"]:
            del otp_store[email]
            raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

        if record["otp"] != req.otp.strip():
            raise HTTPException(status_code=400, detail="Incorrect OTP.")

        if len(req.new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

        users = db["users"]
        users.update_one(
            {"email": email},
            {"$set": {"password": hash_password(req.new_password)}}
        )

        # Clear OTP
        del otp_store[email]

        return {"status": "success", "message": "Password reset successfully! Please sign in."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))