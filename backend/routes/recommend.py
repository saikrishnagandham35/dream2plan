from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()
router = APIRouter()

# ══════════════════════════════════════════════════════════════
#  LOCATION MAPPING — City → State + Schemes
# ══════════════════════════════════════════════════════════════
LOCATION_MAP = {
    "Vizag": {
        "city": "Visakhapatnam (Vizag)",
        "state": "Andhra Pradesh",
        "region": "South India",
        "schemes": ["T-Hub (AP/Telangana)", "AP Startup Policy", "STPI Vizag", "NASSCOM 10,000 Startups"]
    },
    "Hyderabad": {
        "city": "Hyderabad",
        "state": "Telangana",
        "region": "South India",
        "schemes": ["T-Hub", "Telangana Startup Policy", "STPI Hyderabad", "WE Hub (women entrepreneurs)"]
    },
    "Bangalore": {
        "city": "Bangalore",
        "state": "Karnataka",
        "region": "South India",
        "schemes": ["Karnataka Elevate (up to ₹50L grant)", "STPI Bangalore", "KBITS", "NASSCOM 10,000 Startups"]
    },
    "Chennai": {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "region": "South India",
        "schemes": ["TIDEL Park", "STPI Chennai", "TN Startup & Innovation Policy", "SIPCOT"]
    },
    "Delhi": {
        "city": "Delhi",
        "state": "Delhi NCR",
        "region": "North India",
        "schemes": ["Delhi Startup Policy", "STPI Delhi", "DSIIDC", "Startup India (HQ in Delhi)"]
    },
    "India": {
        "city": "All Over India",
        "state": "India",
        "region": "Pan India",
        "schemes": ["Startup India", "MUDRA Loan", "SISFS", "CGSS", "DPIIT Recognition"]
    }
}


class RecommendRequest(BaseModel):
    investment_amount: Optional[str] = None
    risk_level: Optional[str] = "Medium"
    location: Optional[str] = "India"
    user_message: Optional[str] = None
    business_domain: Optional[str] = None


# ══════════════════════════════════════════════════════════════
#  CEREBRAS (ACTIVE)
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


def get_rag_context(domain: str, investment: str, location: str) -> str:
    """Get relevant RAG context for recommendations."""
    try:
        from rag.rag_engine import retrieve_context
        queries = [
            f"{domain} startup opportunities India {location} 2025 2026",
            f"government schemes startups {location} India funding",
            f"budget {investment} startup India market",
        ]
        seen = set()
        chunks = []
        for query in queries:
            context = retrieve_context(query, k=2)
            for chunk in context.split("\n\n---\n\n"):
                chunk = chunk.strip()
                if chunk and chunk not in seen:
                    seen.add(chunk)
                    chunks.append(chunk)
        return "\n\n---\n\n".join(chunks[:6])
    except Exception as e:
        print(f"⚠️ RAG retrieval failed: {e}")
        return ""


@router.post("/recommend")
async def recommend_domains(req: RecommendRequest):
    try:
        investment_raw = req.investment_amount or "Not specified"
        investment = format_investment(req.investment_amount)
        risk = req.risk_level or "Medium"
        idea = req.user_message or ""
        domain = req.business_domain or ""
        location_key = req.location or "India"

        # ── Get full location info ──
        loc = LOCATION_MAP.get(location_key, LOCATION_MAP["India"])
        city = loc["city"]
        state = loc["state"]
        schemes = ", ".join(loc["schemes"])

        # ── Get RAG context ──
        rag_context = get_rag_context(domain or "startup", investment_raw, city)
        rag_section = f"""
Use this verified India startup knowledge as reference:
{rag_context}
---
""" if rag_context else ""

        # ── CASE 1: User selected a specific domain ──
        if domain:
            prompt = f"""You are an expert Indian startup consultant.

{rag_section}
The user has selected domain: "{domain}"
Their inputs:
- Investment: {investment} (raw: {investment_raw})
- Risk Level: {risk}
- Their Idea: "{idea}"
- City: {city}
- State: {state}
- Applicable State Schemes: {schemes}

Generate 3 SPECIFIC startup business ideas within the "{domain}" domain that are REALISTIC for {investment} budget and suited for {city}, {state}.

Return ONLY valid JSON (no markdown, no extra text):
{{
  "top_3": [
    {{
      "domain": "Specific Business Name",
      "tagline": "One line what this business does",
      "why": "2-3 sentences: why this fits {investment} budget and {risk} risk in {city}, {state} 2025-26",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "{domain}"
    }},
    {{
      "domain": "Specific Business Name 2",
      "tagline": "One line what this business does",
      "why": "2-3 sentences why this fits in {city}",
      "risk": "Low/Medium/High",
      "potential": "High/Medium",
      "investment_fit": "Perfect/Good/Viable",
      "parent_domain": "{domain}"
    }},
    {{
      "domain": "Specific Business Name 3",
      "tagline": "One line what this business does",
      "why": "2-3 sentences why this fits in {city}",
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
- ALL ideas must be REALISTIC for exactly {investment} budget in {city}, {state}
- Mention {city} specifically in why/tagline where relevant
- Suggest applicable state schemes: {schemes}
- If budget < ₹10K: content creation, reselling, service-based ideas
- If budget ₹1L-10L: platform MVPs, physical setups, small teams
- If budget ₹10L+: full product builds, marketing campaigns, hiring
- Return ONLY JSON
"""

        # ── CASE 2: No domain selected ──
        else:
            prompt = f"""You are an expert Indian startup consultant.

{rag_section}
The user has NOT selected a domain. Recommend the 3 BEST startup ideas.
Their inputs:
- Investment: {investment} (raw: {investment_raw})
- Risk Level: {risk}
- Their Idea: "{idea}"
- City: {city}
- State: {state}
- Applicable State Schemes: {schemes}

Return ONLY valid JSON (no markdown, no extra text):
{{
  "top_3": [
    {{
      "domain": "Specific Business Idea Name",
      "tagline": "One line what this business does",
      "why": "2-3 sentences: why this is perfect for {investment} budget in {city}, {state}",
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
- ALL ideas must be REALISTIC for exactly {investment} budget in {city}, {state}
- Mention {city} specifically in why/tagline where relevant
- Suggest applicable state schemes: {schemes}
- If budget < ₹10K: content creation, freelancing, reselling
- If budget ₹10K-1L: service-based, small physical setup
- If budget ₹1L-10L: MVP apps, small retail, cloud kitchen
- If budget ₹10L+: full product, funded startup, team hiring
- If user has an idea, top recommendation must match it
- Return ONLY JSON
"""

        content = call_llm(prompt).strip()
        content = re.sub(r'```json|```', '', content).strip()
        parsed = json.loads(content)

        return {
            "status": "success",
            "investment": investment,
            "risk": risk,
            "location": city,
            "state": state,
            "selected_domain": domain,
            "recommendations": parsed
        }

    except Exception as e:
        print(f"❌ Recommend Error: {e}")
        loc = LOCATION_MAP.get(req.location or "India", LOCATION_MAP["India"])
        domain = req.business_domain or ""
        return {
            "status": "success",
            "investment": format_investment(req.investment_amount),
            "risk": req.risk_level or "Medium",
            "location": loc["city"],
            "state": loc["state"],
            "selected_domain": domain,
            "recommendations": {
                "top_3": [
                    {
                        "domain": "Content Creation Business",
                        "tagline": "Build audience and monetize through social media",
                        "why": f"Zero to minimal investment needed. Instagram, YouTube, and WhatsApp are powerful for {loc['city']} markets.",
                        "risk": "Low",
                        "potential": "High",
                        "investment_fit": "Perfect",
                        "parent_domain": domain or "MediaTech"
                    },
                    {
                        "domain": "Service-Based Consulting",
                        "tagline": "Offer skills as a service to businesses",
                        "why": f"No inventory needed. High demand for digital services in {loc['city']}, {loc['state']}.",
                        "risk": "Low",
                        "potential": "Medium",
                        "investment_fit": "Perfect",
                        "parent_domain": domain or "SaaS"
                    },
                    {
                        "domain": "Reselling Business",
                        "tagline": "Buy and resell products online via Meesho or Instagram",
                        "why": f"Very low capital needed. Massive customer base available in {loc['city']}.",
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