from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from rag.rag_engine import retrieve_context

load_dotenv()

# ══════════════════════════════════════════════════════════════
#  LOCATION MAPPING — same as recommend.py
# ══════════════════════════════════════════════════════════════
LOCATION_MAP = {
    "Vizag":      {"city": "Visakhapatnam (Vizag)", "state": "Andhra Pradesh"},
    "Hyderabad":  {"city": "Hyderabad",              "state": "Telangana"},
    "Bangalore":  {"city": "Bangalore",              "state": "Karnataka"},
    "Chennai":    {"city": "Chennai",                "state": "Tamil Nadu"},
    "Delhi":      {"city": "Delhi",                  "state": "Delhi NCR"},
    "India":      {"city": "All Over India",         "state": "India"},
}


# ══════════════════════════════════════════════════════════════
#  GROQ — fallback
# ══════════════════════════════════════════════════════════════
def get_llm():
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=4000
    )


# ══════════════════════════════════════════════════════════════
#  CEREBRAS (ACTIVE NOW)
# ══════════════════════════════════════════════════════════════
def invoke_cerebras(prompt: str) -> str:
    from cerebras.cloud.sdk import Cerebras
    client = Cerebras(api_key=os.getenv("CEREBRAS_API_KEY"))
    response = client.chat.completions.create(
        model="llama3.1-8b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4000,
        temperature=0.3,
    )
    return response.choices[0].message.content


# ══════════════════════════════════════════════════════════════
#  RAG CONTEXT BUILDER — now location-aware
# ══════════════════════════════════════════════════════════════
def build_multi_query_context(domain: str, investment: str, location: str) -> str:
    # Resolve full location info
    loc = LOCATION_MAP.get(location, LOCATION_MAP["India"])
    city = loc["city"]
    state = loc["state"]

    queries = [
        f"{domain} market size India 2025 2026 opportunities",
        f"legal requirements budget {investment} India registration",
        f"government schemes funding startups India {investment}",
        f"budget allocation {investment} startup India",
        f"investors angel VC {domain} India funding",
        f"go to market strategy India {domain} startup",
        f"startup ecosystem {city} {state} India",          # ✅ city-specific
        f"state schemes {state} startups funding grants",   # ✅ state-specific
    ]
    seen = set()
    all_chunks = []
    for query in queries:
        context = retrieve_context(query, k=3)
        for chunk in context.split("\n\n---\n\n"):
            chunk = chunk.strip()
            if chunk and chunk not in seen:
                seen.add(chunk)
                all_chunks.append(chunk)
    combined = "\n\n---\n\n".join(all_chunks)
    print(f"📚 RAG: Retrieved {len(all_chunks)} unique chunks across {len(queries)} queries for {city}, {state}")
    return combined


# ══════════════════════════════════════════════════════════════
#  MAIN GENERATE FUNCTION
# ══════════════════════════════════════════════════════════════
def generate_blueprint(prompt: str, domain: str = "", investment: str = "", location: str = "India") -> str:
    try:
        # Resolve location
        loc = LOCATION_MAP.get(location, LOCATION_MAP["India"])
        city = loc["city"]
        state = loc["state"]

        if domain or investment:
            context = build_multi_query_context(domain, investment, location)
        else:
            context = retrieve_context(prompt[:300], k=6)

        enhanced_prompt = f"""
Use the following verified information about the Indian startup ecosystem as reference:

{context}

---

Now based on the above context and your expertise, generate the blueprint as instructed.

Location Context: {city}, {state}

{prompt}

CRITICAL REMINDERS:
- Be specific to the domain, budget, and location ({city}, {state}) mentioned.
- Show actual rupee amounts in budget allocation, NEVER say "No data available".
- Legal section MUST include specific registrations relevant to budget and domain.
- Mention state-specific schemes relevant to {state} where applicable.
- Do NOT give generic answers, every line must be specific and actionable.
- Each section must have unique, non-overlapping content.
"""

        # ── AUTO FALLBACK — tries Groq first, then Cerebras ──
        apis = [
            ("Groq",     lambda: get_llm().invoke(enhanced_prompt).content),
            ("Cerebras", lambda: invoke_cerebras(enhanced_prompt)),
        ]
        for name, api_call in apis:
            try:
                print(f"Trying {name}...")
                result = api_call()
                print(f"✅ {name} succeeded!")
                return result
            except Exception as e:
                print(f"❌ {name} failed: {e}. Trying next...")

        return "All APIs failed. Please try again later."

    except Exception as e:
        return f"LLM Error: {str(e)}"