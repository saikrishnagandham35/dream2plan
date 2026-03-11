from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()
router = APIRouter()

class RecommendRequest(BaseModel):
    investment_amount: Optional[str] = None
    risk_level: Optional[str] = "Medium"
    location: Optional[str] = "India"
    user_message: Optional[str] = None
    business_domain: Optional[str] = None

# ══════════════════════════════════════════════════════════════
#  TO SWITCH TO GROQ: comment call_llm above, uncomment below
# ══════════════════════════════════════════════════════════════
def call_llm(prompt: str) -> str:
     from langchain_groq import ChatGroq
     llm = ChatGroq(
         api_key=os.getenv("GROQ_API_KEY"),
         model="llama-3.3-70b-versatile",
         temperature=0.6,
         max_tokens=2000
    )
     return llm.invoke(prompt).content

# ══════════════════════════════════════════════════════════════
#  CEREBRAS (ACTIVE NOW)
# ══════════════════════════════════════════════════════════════
def call_llm(prompt: str) -> str:
    from cerebras.cloud.sdk import Cerebras
    client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=2000,
        temperature=0.6,
    )
    return response.choices[0].message.content

def format_investment(amount):
    if not amount:
        return "Not specified"
    try:
        num = int(float(amount))
        if num >= 10000000: return f"₹{num/10000000:.1f} Crore"
        if num >= 100000:   return f"₹{num/100000:.1f} Lakh"
        if num >= 1000:     return f"₹{num/1000:.1f}K"
        return f"₹{num}"
    except:
        return f"₹{amount}"

@router.post("/recommend")
async def recommend_domains(req: RecommendRequest):
    try:
        investment_raw = req.investment_amount or "Not specified"
        investment = format_investment(req.investment_amount)
        risk = req.risk_level or "Medium"
        idea = req.user_message or ""
        domain = req.business_domain or ""

        # ── CASE 1: User selected a specific domain ──
        if domain:
            prompt = f"""You are an expert Indian startup consultant.

The user has selected domain: "{domain}"
Their inputs:
- Investment: {investment} (raw: {investment_raw})
- Risk Level: {risk}
- Their Idea: "{idea}"
- Location: India

Generate 3 SPECIFIC startup business ideas within the "{domain}" domain that are REALISTIC for {investment} budget.

IMPORTANT: Think of actual specific businesses, not generic descriptions.
Examples:
- Gaming + ₹5K → "Gaming YouTube Channel", "Mobile Game Reseller", "Esports Coaching"
- FoodTech + ₹50K → "Cloud Kitchen", "Tiffin Delivery Service", "Home Baking Business"
- TravelTech + ₹1L → "Travel Instagram Page + Blog", "Local Tour Guide App", "Homestay Listing Service"
- Clothing + ₹20K → "Instagram Fashion Reselling", "Custom T-shirt Printing", "Thrift Store Online"

Return ONLY valid JSON (no markdown, no extra text):
{{
  "top_3": [
    {{
      "domain": "Specific Business Name (e.g. Cloud Kitchen, Gaming YouTube Channel)",
      "tagline": "One line what this business does",
      "why": "2-3 sentences: why this specific idea fits {investment} budget and {risk} risk in India 2025-26",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "{domain}"
    }},
    {{
      "domain": "Specific Business Name 2",
      "tagline": "One line what this business does",
      "why": "2-3 sentences why this fits the budget and risk",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "{domain}"
    }},
    {{
      "domain": "Specific Business Name 3",
      "tagline": "One line what this business does",
      "why": "2-3 sentences why this fits the budget and risk",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "{domain}"
    }}
  ],
  "other_options": [
    {{"domain": "Another specific idea in {domain}", "risk": "Low/Medium/High"}},
    {{"domain": "Another specific idea in {domain}", "risk": "Low/Medium/High"}},
    {{"domain": "Another specific idea in {domain}", "risk": "Low/Medium/High"}},
    {{"domain": "Another specific idea in {domain}", "risk": "Low/Medium/High"}}
  ]
}}

STRICT RULES:
- ALL ideas must be within "{domain}" only
- ALL ideas must be REALISTIC for exactly {investment} budget
- If budget is very small (< ₹10K): suggest content creation, reselling, service-based ideas
- If budget is medium (₹1L-10L): suggest platform MVPs, physical setups, small teams
- If budget is large (₹10L+): suggest full product builds, marketing campaigns, hiring
- Be SPECIFIC: "Cloud Kitchen in Hyderabad" not just "FoodTech startup"
- other_options: 4 more specific ideas within "{domain}"
- Return ONLY JSON
"""

        # ── CASE 2: No domain selected ──
        else:
            prompt = f"""You are an expert Indian startup consultant.

The user has NOT selected a domain. Recommend the 3 BEST startup domains AND specific ideas.
Their inputs:
- Investment: {investment} (raw: {investment_raw})
- Risk Level: {risk}
- Their Idea: "{idea}"
- Location: India

Return ONLY valid JSON (no markdown, no extra text):
{{
  "top_3": [
    {{
      "domain": "Specific Business Idea Name (e.g. EdTech Doubt-Solving App, Tiffin Delivery Service)",
      "tagline": "One line what this business does",
      "why": "2-3 sentences: why this specific idea is perfect for {investment} budget and {risk} risk in India",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "Domain category (EdTech/FoodTech/etc)"
    }},
    {{
      "domain": "Specific Business Idea 2",
      "tagline": "One line what this does",
      "why": "2-3 sentences",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "Domain category"
    }},
    {{
      "domain": "Specific Business Idea 3",
      "tagline": "One line what this does",
      "why": "2-3 sentences",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "Domain category"
    }}
  ],
  "other_options": [
    {{"domain": "Specific idea 4", "risk": "Low/Medium/High"}},
    {{"domain": "Specific idea 5", "risk": "Low/Medium/High"}},
    {{"domain": "Specific idea 6", "risk": "Low/Medium/High"}},
    {{"domain": "Specific idea 7", "risk": "Low/Medium/High"}}
  ]
}}

STRICT RULES:
- ALL ideas must be REALISTIC for exactly {investment} budget
- If budget < ₹10K: content creation, freelancing, reselling, WhatsApp-based services
- If budget ₹10K-1L: service-based, small physical setup, simple digital products
- If budget ₹1L-10L: MVP apps, small retail, cloud kitchen, local services
- If budget ₹10L+: full product, funded startup, team hiring
- If user has an idea in their message, top recommendation must match it
- Be VERY SPECIFIC — real business names not generic domain names
- Return ONLY JSON
"""

        content = call_llm(prompt).strip()
        content = re.sub(r'```json|```', '', content).strip()
        parsed = json.loads(content)

        return {
            "status": "success",
            "investment": investment,
            "risk": risk,
            "selected_domain": domain,
            "recommendations": parsed
        }

    except Exception as e:
        print(f"❌ Recommend Error: {e}")
        domain = req.business_domain or ""
        return {
            "status": "success",
            "investment": format_investment(req.investment_amount),
            "risk": req.risk_level or "Medium",
            "selected_domain": domain,
            "recommendations": {
                "top_3": [
                    {
                        "domain": "Content Creation Business",
                        "tagline": "Build audience and monetize through social media",
                        "why": "Zero to minimal investment needed. Start with a phone and free tools. Instagram, YouTube, and WhatsApp are powerful for Indian markets.",
                        "risk": "Low",
                        "potential": "High",
                        "investment_fit": "Perfect",
                        "parent_domain": domain or "MediaTech"
                    },
                    {
                        "domain": "Service-Based Consulting",
                        "tagline": "Offer skills as a service to businesses",
                        "why": "No inventory or product needed. Can start immediately with existing skills. High demand for digital services in India.",
                        "risk": "Low",
                        "potential": "Medium",
                        "investment_fit": "Perfect",
                        "parent_domain": domain or "SaaS"
                    },
                    {
                        "domain": "Reselling Business",
                        "tagline": "Buy and resell products online via Meesho or Instagram",
                        "why": "Very low capital needed. Meesho allows zero-inventory reselling. Massive customer base already available.",
                        "risk": "Low",
                        "potential": "Medium",
                        "investment_fit": "Good",
                        "parent_domain": domain or "E-Commerce"
                    }
                ],
                "other_options": [
                    {"domain": "WhatsApp Group Business", "risk": "Low"},
                    {"domain": "Freelance Services", "risk": "Low"},
                    {"domain": "Online Tutoring", "risk": "Low"},
                    {"domain": "Dropshipping Store", "risk": "Medium"}
                ]
            }
        }