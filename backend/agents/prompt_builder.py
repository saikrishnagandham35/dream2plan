from models.schemas import UserInput
from typing import Optional
import re


# ══════════════════════════════════════════════════════════════
#  LOCATION MAPPING — City → State + Schemes
# ══════════════════════════════════════════════════════════════
LOCATION_MAP = {
    "Vizag": {
        "city": "Visakhapatnam (Vizag)",
        "state": "Andhra Pradesh",
        "schemes": ["T-Hub (AP/Telangana)", "AP Startup Policy", "STPI Vizag"]
    },
    "Hyderabad": {
        "city": "Hyderabad",
        "state": "Telangana",
        "schemes": ["T-Hub", "Telangana Startup Policy", "STPI Hyderabad", "WE Hub"]
    },
    "Bangalore": {
        "city": "Bangalore",
        "state": "Karnataka",
        "schemes": ["Karnataka Elevate (up to ₹50L grant)", "STPI Bangalore", "KBITS"]
    },
    "Chennai": {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "schemes": ["TIDEL Park", "STPI Chennai", "TN Startup & Innovation Policy"]
    },
    "Delhi": {
        "city": "Delhi",
        "state": "Delhi NCR",
        "schemes": ["Delhi Startup Policy", "STPI Delhi", "DSIIDC"]
    },
    "India": {
        "city": "All Over India",
        "state": "India",
        "schemes": ["Startup India", "MUDRA Loan", "SISFS", "CGSS", "DPIIT Recognition"]
    }
}


def extract_budget_from_message(message: str) -> Optional[str]:
    if not message:
        return None
    message_lower = message.lower()
    patterns = [
        r'(?:budget|investment|invest|capital|fund(?:ing)?)\s*(?:of|is|=|:)?\s*(?:₹|rs\.?|inr)?\s*(\d[\d,\.]*\s*(?:k|l|lakh|lac|cr|crore|m|million|thousand)?)',
        r'(?:₹|rs\.?|inr)\s*(\d[\d,\.]*\s*(?:k|l|lakh|lac|cr|crore|m|million|thousand)?)',
        r'(\d[\d,\.]*\s*(?:lakh|lac|crore|cr|million|thousand|k))',
    ]
    for pattern in patterns:
        match = re.search(pattern, message_lower)
        if match:
            return match.group(1).strip()
    return None


def format_investment(amount: str) -> str:
    if not amount:
        return "Not specified"
    try:
        num = int(float(amount))
        if num >= 10000000:
            return f"₹{num/10000000:.1f} Crore ({num:,})"
        elif num >= 100000:
            return f"₹{num/100000:.1f} Lakh ({num:,})"
        elif num >= 1000:
            return f"₹{num/1000:.1f}K ({num:,})"
        else:
            return f"₹{num:,}"
    except:
        return f"₹{amount}"


def get_budget_tier(amount: str) -> str:
    if not amount:
        return "unknown"
    try:
        num = int(float(amount))
        if num < 10000:      return "micro"
        elif num < 100000:   return "small"
        elif num < 1000000:  return "medium"
        elif num < 10000000: return "large"
        else:                return "enterprise"
    except:
        return "unknown"


def get_budget_guidance(tier: str, domain: str) -> str:
    guidance = {
        "micro": f"""
BUDGET TIER: MICRO (< ₹10,000) — BOOTSTRAPPED ONLY
- Do NOT suggest company registration, GST, or any paid compliance.
- Sole Proprietorship only — completely FREE, no registration needed.
- No GST (turnover far below ₹20L threshold).
- Use only FREE tools: Google Workspace, Canva, GitHub, social media.
- Funding: Personal savings, friends/family only. NO VC or angel investors.
- Investors section: Write bootstrapping tips instead of investor names.
""",
        "small": f"""
BUDGET TIER: SMALL (₹10,000 – ₹1,00,000) — LEAN STARTUP
- Sole Proprietorship or simple Partnership — low/zero cost.
- Udyam/MSME Registration: FREE — strongly recommended.
- DPIIT Startup India Recognition: FREE — apply at startupindia.gov.in.
- GST only if turnover expected to exceed ₹20L.
- Funding: MUDRA Shishu loan (up to ₹50,000), self-funding, family.
- Angel investors: unlikely at this stage. Focus on DPIIT first.
""",
        "medium": f"""
BUDGET TIER: MEDIUM (₹1,00,000 – ₹10,00,000) — STANDARD STARTUP
- Register as LLP (₹5,000-10,000) or Pvt Ltd (₹10,000-20,000).
- Udyam/MSME Registration: FREE — do this first.
- DPIIT Startup India Recognition: FREE.
- GST Registration: Required if applicable to {domain} domain.
- Funding: MUDRA Kishore/Tarun loans, state schemes, angel investors.
- Suggest angel networks specific to {domain} domain.
""",
        "large": f"""
BUDGET TIER: LARGE (₹10,00,000 – ₹1,00,00,000) — GROWTH STARTUP
- Private Limited Company registration is mandatory.
- All compliances: GST, TAN, PAN, DPIIT, MSME, Trademark.
- Ready for angel/seed funding rounds.
- Suggest specific angel investors and seed funds active in {domain}.
- Consider: Startup India Seed Fund, TIDE 2.0, corporate accelerators.
""",
        "enterprise": f"""
BUDGET TIER: ENTERPRISE (> ₹1,00,00,000)
- Full corporate structure: Private Limited or Public Limited.
- All regulatory compliances mandatory.
- VC funding ready — suggest Series A investors in {domain}.
- SEBI regulations if applicable.
""",
        "unknown": ""
    }
    return guidance.get(tier, "")


# ── STRICT SECTION FORMAT TEMPLATE ──
SECTION_FORMAT = """
You MUST format your response using EXACTLY these section headers with === delimiters.
Do NOT skip any section. Do NOT skip any bold header inside each section.
Every bold header MUST have at least 3 bullet points with specific details.

===BUSINESS MODEL CANVAS===

**Customer Segments**
- Who are the primary target customers? (specific demographics, age, location)
- What are their key needs and pain points?
- Primary segment vs secondary segment breakdown

**Value Proposition**
- What core problem does this business solve?
- What unique value do you offer over competitors?
- Why will customers choose you specifically?

**Channels**
- Online channels (social media, website, app, marketplaces)
- Offline channels (local stores, events, word of mouth)
- How customers will discover and buy from you

**Customer Relationships**
- How will you acquire new customers?
- How will you retain existing customers?
- Type of relationship (personal, automated, community)

**Revenue Streams**
- Primary revenue source with ₹ pricing details
- Secondary revenue sources
- Expected monthly revenue at early stage

**Key Resources**
- Physical resources needed (equipment, space, inventory)
- Digital/intellectual resources (tools, software, skills)
- Human resources (team, freelancers, partners)

**Key Activities**
- Core day-to-day operations
- Marketing and sales activities
- Product/service delivery process

**Key Partners**
- Suppliers and vendors with names (e.g. Meesho, Amazon, local suppliers)
- Platform partners (Razorpay, Shiprocket, etc.)
- Strategic alliances and collaborations

**Cost Structure**
- Fixed costs with ₹ amounts (rent, subscriptions, salaries)
- Variable costs with ₹ amounts (inventory, packaging, delivery)
- One-time setup costs with ₹ amounts

===MARKET RESEARCH===

**Market Size & Opportunity**
- Total Addressable Market (TAM) in India with ₹ or $ figures
- Serviceable Addressable Market (SAM) for this specific domain
- Growth rate of this market in India (2024-2026 data)

**Target Customer Profile**
- Age group, income level, location (Tier 1/2/3 cities)
- Online vs offline buying behavior
- Key motivations and triggers for purchase

**Competitor Analysis**
- Top 3-5 direct competitors with their names
- Their strengths and weaknesses
- Gap in the market this business can fill

**Market Trends**
- Current trends driving growth in this domain in India
- Technology trends affecting this market
- Post-COVID and digital India impact

**Demand Indicators**
- Google search volume or social media demand signals
- Seasonal demand patterns
- Geographic demand hotspots in India

===LEGAL REQUIREMENTS===

**Business Registration**
- Recommended business structure (Sole Proprietorship / LLP / Pvt Ltd)
- Registration process and cost with ₹ amounts
- Time required to complete registration

**Tax & Compliance**
- GST registration (required or not based on turnover threshold)
- Income tax obligations and filing requirements
- TDS applicability if hiring employees or freelancers

**Government Schemes & Recognition**
- Udyam/MSME Registration (FREE - strongly recommended)
- DPIIT Startup India Recognition (FREE - apply at startupindia.gov.in)
- State-specific startup schemes available

**Licenses & Permits**
- Industry-specific licenses required (FSSAI for food, drug license for pharma, etc.)
- Shop & Establishment Act registration if applicable
- Any other domain-specific compliance required

**Intellectual Property**
- Trademark registration for brand name (cost and process)
- Copyright protection for content/software if applicable
- Domain name and social media handle protection

===FUNDING OPTIONS===

**Self Funding (Bootstrapping)**
- How to start with available personal savings
- Ways to reduce initial capital requirement
- Reinvestment strategy from early revenue

**Government Schemes**
- MUDRA Loan (Shishu/Kishore/Tarun) - eligibility and amount
- Startup India Seed Fund Scheme - how to apply
- State government schemes relevant to this domain and location
- SIDBI schemes and other government support

**Grants & Competitions**
- Startup India challenges and grant programs
- Domain-specific grants (AgriTech, HealthTech, EdTech grants)
- Incubator programs that provide funding + mentorship

**Angel Investors & VCs**
- Angel networks relevant for this stage (Mumbai Angels, Lead Angels, etc.)
- Stage-appropriate VC firms for this domain
- How to approach investors at this budget level

**Revenue-Based Options**
- Bank loans and NBFC options available
- Invoice financing or working capital loans
- Crowdfunding platforms (Ketto, Milaap, Seedrs India)

===BUDGET ALLOCATION===

**Total Budget Breakdown**
- Total available investment: ₹[actual amount from input]
- Allocation philosophy (lean vs growth-focused)
- Priority order for spending

**Product/Service Development**
- Development or setup cost: ₹[specific amount]
- Tools, software, equipment: ₹[specific amount]
- Inventory or raw materials (if applicable): ₹[specific amount]

**Marketing & Customer Acquisition**
- Digital marketing budget: ₹[specific amount]
- Social media ads (Instagram, Facebook, Google): ₹[specific amount]
- Content creation and branding: ₹[specific amount]

**Operations & Infrastructure**
- Office/workspace cost (or work from home): ₹[specific amount]
- Logistics and delivery setup: ₹[specific amount]
- Utilities and miscellaneous: ₹[specific amount]

**Legal & Compliance**
- Business registration and licenses: ₹[specific amount]
- Accounting and GST filing: ₹[specific amount]

**Emergency Reserve**
- Contingency fund (10-15% of total budget): ₹[specific amount]
- Purpose and when to use this reserve

===GO TO MARKET STRATEGY===

**Phase 1 — Launch (Month 1-2)**
- Immediate actions to take in first 2 months
- Initial target audience and geography
- Free/low-cost channels to start with

**Phase 2 — Growth (Month 3-6)**
- Paid marketing channels to activate
- Partnerships and collaborations to pursue
- Target revenue milestones for this phase

**Phase 3 — Scale (Month 6-12)**
- Expansion strategies (new cities, new products)
- Team hiring plan if needed
- Revenue and customer targets

**Digital Marketing Strategy**
- Instagram/Facebook/YouTube content strategy
- WhatsApp Business and local community marketing
- SEO and Google My Business setup

**Sales Strategy**
- Direct sales approach and scripts
- B2B vs B2C approach for this domain
- Referral and word-of-mouth programs

**Key Metrics to Track**
- Customer Acquisition Cost (CAC) target: ₹[amount]
- Monthly Active Users or Customers target
- Break-even timeline estimate

===INVESTOR SUGGESTIONS===

**Investor Readiness Assessment**
- Current stage vs investor expectations
- What to build before approaching investors
- Key metrics that attract investors in this domain

**Angel Investors to Target**
- Specific angel investors active in this domain in India
- Angel networks: Mumbai Angels, Lead Angels, Indian Angel Network
- How to get warm introductions to angels

**Incubators & Accelerators**
- Top incubators for this domain (T-Hub, NSRCEL, CIIE, etc.)
- Benefits beyond funding (mentorship, network, office space)
- How to apply and selection criteria

**VC Firms (Future Round)**
- Stage-appropriate VCs once traction is proven
- Domain-specific VC firms in India
- What they look for before investing

**Pitch Preparation**
- Key slides for investor pitch deck
- What traction metrics to show (users, revenue, growth rate)
- Common questions investors ask in this domain
"""


def build_structured_prompt(user_input: UserInput) -> str:

    # Extract budget from message if not in form
    investment = user_input.investment_amount
    if not investment and user_input.user_message:
        extracted = extract_budget_from_message(user_input.user_message)
        if extracted:
            from models.schemas import parse_investment
            investment = parse_investment(extracted)

    investment_display = format_investment(investment)
    budget_tier = get_budget_tier(investment)
    budget_guidance = get_budget_guidance(budget_tier, user_input.business_domain or "General")
    domain = user_input.business_domain or "AI Recommended based on idea"
    risk = user_input.risk_level or "Medium"

    # ── Resolve full location info ──
    location_key = user_input.location or "India"
    loc = LOCATION_MAP.get(location_key, LOCATION_MAP["India"])
    city = loc["city"]
    state = loc["state"]
    schemes = ", ".join(loc["schemes"])
    location_context = f"{city}, {state}"

    strict_rules = f"""
    STRICT RULES — FOLLOW WITHOUT EXCEPTION:
    1. Every section MUST have detailed, specific content — NEVER say "No data available".
    2. Budget allocation MUST show actual ₹ amounts based on {investment_display}.
    3. Legal requirements MUST match budget tier — no unnecessary registrations.
    4. Investor suggestions MUST be realistic for {investment_display} budget.
    5. Location is {location_context} — mention state-specific schemes: {schemes}
    6. Do NOT repeat content across sections.
    7. Be domain-specific and budget-specific throughout.
    8. FORMATTING IS MANDATORY — every section MUST follow this exact format:
    **Section Topic Name**
    - Key point one with specific details
    - Key point two with specific details
    - Key point three with specific details

    NEVER write plain paragraphs. ALWAYS use **Bold Headers** followed by bullet points (- ).
    Every single section must have at least 3 bold headers, each with 3-5 bullet points.
"""

    # ── SCENARIO 1: Only form filled ──
    if not user_input.user_message and user_input.business_domain:
        prompt = f"""You are an expert Indian startup consultant.

Generate a HIGHLY SPECIFIC and ACTIONABLE startup blueprint for:
- Business Domain: {domain}
- Investment Amount: {investment_display}
- Risk Level: {risk}
- Location: {location_context}
- Applicable State Schemes: {schemes}

{budget_guidance}
{strict_rules}
{SECTION_FORMAT}"""

    # ── SCENARIO 2: Only text box filled ──
    elif user_input.user_message and not user_input.business_domain:
        prompt = f"""You are an expert Indian startup consultant.

A user has described their startup idea. Generate a HIGHLY SPECIFIC blueprint.

User's Idea: "{user_input.user_message}"
Investment Amount: {investment_display}
Location: {location_context}
Applicable State Schemes: {schemes}
Risk Level: {risk}

{budget_guidance}
{strict_rules}
{SECTION_FORMAT}"""

    # ── SCENARIO 3: Both filled ──
    else:
        prompt = f"""You are an expert Indian startup consultant.

Generate a HIGHLY SPECIFIC startup blueprint combining the idea and details below.

User's Idea: "{user_input.user_message or 'Not provided'}"
Business Domain: {domain}
Investment Amount: {investment_display}
Risk Level: {risk}
Location: {location_context}
Applicable State Schemes: {schemes}

{budget_guidance}
{strict_rules}
{SECTION_FORMAT}"""

    return prompt.strip()