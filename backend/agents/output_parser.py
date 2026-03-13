from typing import Optional, Dict, List, Any
import json
import re

BLUEPRINT_KEYS = [
    "business_model_canvas",
    "market_research",
    "legal_requirements",
    "funding_options",
    "budget_allocation",
    "go_to_market",
    "investor_suggestions"
]

# Map === headings to JSON keys
DELIMITER_MAP = {
    "BUSINESS MODEL CANVAS": "business_model_canvas",
    "BUSINESS MODEL":        "business_model_canvas",
    "BMC":                   "business_model_canvas",
    "MARKET RESEARCH":       "market_research",
    "MARKET ANALYSIS":       "market_research",
    "LEGAL REQUIREMENTS":    "legal_requirements",
    "LEGAL REQUIREMENT":     "legal_requirements",
    "LEGAL":                 "legal_requirements",
    "FUNDING OPTIONS":       "funding_options",
    "FUNDING OPTION":        "funding_options",
    "FUNDING":               "funding_options",
    "GOVERNMENT SCHEMES":    "funding_options",
    "BUDGET ALLOCATION":     "budget_allocation",
    "BUDGET":                "budget_allocation",
    "GO TO MARKET STRATEGY": "go_to_market",
    "GO TO MARKET":          "go_to_market",
    "GO-TO-MARKET STRATEGY": "go_to_market",
    "GO-TO-MARKET":          "go_to_market",
    "GTM":                   "go_to_market",
    "MARKETING STRATEGY":    "go_to_market",
    "INVESTOR SUGGESTIONS":  "investor_suggestions",
    "INVESTOR SUGGESTION":   "investor_suggestions",
    "INVESTORS":             "investor_suggestions",
    "INVESTOR":              "investor_suggestions",
}


def parse_blueprint_to_json(blueprint_text: str) -> dict:
    """
    Parse blueprint into structured JSON.
    Priority:
      1. === DELIMITER === format (primary — matches our prompt format)
      2. Direct JSON
      3. Numbered sections
      4. Keyword sections
      5. Fallback
    """

    # ── Strategy 1: === delimiter format (our primary format) ──
    result = _parse_delimiter_sections(blueprint_text)
    filled = sum(1 for v in result.values() if v.strip())
    if filled >= 5:
        print(f"✅ Parser: Delimiter format — {filled}/7 sections filled")
        return result

    # ── Strategy 2: Direct JSON ──
    try:
        clean = re.sub(r'```json|```', '', blueprint_text).strip()
        parsed = json.loads(clean)
        if isinstance(parsed, dict) and all(k in parsed for k in BLUEPRINT_KEYS):
            print("✅ Parser: Direct JSON successful")
            return parsed
    except Exception:
        pass

    # ── Strategy 3: Numbered sections ──
    result = _parse_numbered_sections(blueprint_text)
    filled = sum(1 for v in result.values() if v.strip())
    if filled >= 4:
        print(f"✅ Parser: Numbered sections — {filled}/7 filled")
        return result

    # ── Strategy 4: Keyword sections ──
    result = _parse_keyword_sections(blueprint_text)
    filled = sum(1 for v in result.values() if v.strip())
    if filled >= 3:
        print(f"✅ Parser: Keyword sections — {filled}/7 filled")
        return result

    # ── Fallback ──
    print("⚠️ Parser: Using fallback")
    return {
        "business_model_canvas": blueprint_text,
        "market_research": "",
        "legal_requirements": "",
        "funding_options": "",
        "budget_allocation": "",
        "go_to_market": "",
        "investor_suggestions": ""
    }


def _parse_delimiter_sections(text: str) -> dict:
    """Parse ===SECTION NAME=== format."""
    result = {k: "" for k in BLUEPRINT_KEYS}

    # Find all === delimiters
    pattern = re.compile(r'===([^=]+)===', re.MULTILINE)
    matches = list(pattern.finditer(text))

    if not matches:
        return result

    for i, match in enumerate(matches):
        heading = match.group(1).strip().upper()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()

        # Match heading to key
        mapped_key = None
        for pattern_str, key in DELIMITER_MAP.items():
            if pattern_str in heading or heading in pattern_str:
                mapped_key = key
                break

        if mapped_key and content:
            # Don't overwrite if already has content (take first match)
            if not result[mapped_key]:
                result[mapped_key] = content

    return result


def _parse_numbered_sections(text: str) -> dict:
    """Parse: 1. SECTION NAME or 1) SECTION NAME"""
    result = {k: "" for k in BLUEPRINT_KEYS}

    pattern = re.compile(
        r'(?:^|\n)\s*(?:\*{0,2})(\d+[\.\)]\s*)(?:\*{0,2})([A-Z][A-Z\s&/\-]{3,60})(?:\*{0,2})',
        re.MULTILINE
    )
    matches = list(pattern.finditer(text))
    if len(matches) < 3:
        return result

    for i, match in enumerate(matches):
        heading = match.group(2).strip().upper()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()

        mapped_key = _match_to_key(heading)
        if mapped_key and content and not result[mapped_key]:
            result[mapped_key] = content

    return result


def _parse_keyword_sections(text: str) -> dict:
    """Generic keyword-based section splitting."""
    result = {k: "" for k in BLUEPRINT_KEYS}
    lines = text.split('\n')
    current_key = None
    current_lines = []

    for line in lines:
        stripped = line.strip()
        if len(stripped) > 100:
            if current_key:
                current_lines.append(line)
            continue

        clean = re.sub(r'[#*_`\d\.\):\-=]', ' ', stripped.upper())
        clean = re.sub(r'\s+', ' ', clean).strip()

        matched_key = _match_to_key(clean)
        if matched_key:
            if current_key and current_lines:
                result[current_key] = '\n'.join(current_lines).strip()
            current_key = matched_key
            current_lines = []
        elif current_key:
            current_lines.append(line)

    if current_key and current_lines:
        result[current_key] = '\n'.join(current_lines).strip()

    return result


def _match_to_key(heading: str) -> Optional[str]:
    heading = heading.upper().strip()
    for pattern_str, key in DELIMITER_MAP.items():
        if pattern_str in heading or heading in pattern_str:
            return key
    return None


from typing import Optional