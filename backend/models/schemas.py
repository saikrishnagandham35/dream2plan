from pydantic import BaseModel, field_validator
from typing import Optional
import re

def parse_investment(value: Optional[str]) -> Optional[str]:
    """Convert any investment input to a clean number string."""
    if value is None:
        return None
    
    value = str(value).strip().lower()
    
    # Remove currency symbols and spaces
    value = value.replace('₹', '').replace('rs', '').replace('inr', '').replace(',', '').strip()
    
    # Word to number mapping
    word_map = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12, 'fifteen': 15, 'twenty': 20,
        'twenty five': 25, 'fifty': 50, 'hundred': 100,
        'thousand': 1000, 'lakh': 100000, 'lac': 100000,
        'million': 1000000, 'crore': 10000000,
    }
    
    # Handle shorthand: 10k, 5L, 2Cr, 1M
    shorthand = re.match(r'^(\d+\.?\d*)\s*(k|l|lac|lakh|cr|crore|m|million)?$', value)
    if shorthand:
        num = float(shorthand.group(1))
        unit = shorthand.group(2) or ''
        multipliers = {
            'k': 1000, 'l': 100000, 'lac': 100000, 'lakh': 100000,
            'cr': 10000000, 'crore': 10000000, 'm': 1000000, 'million': 1000000
        }
        num = int(num * multipliers.get(unit, 1))
        return str(num)
    
    # Handle word numbers
    for word, num in sorted(word_map.items(), key=lambda x: -len(x[0])):
        if word in value:
            # Try to extract multiplier before word
            match = re.match(rf'^(\d+\.?\d*)?\s*{word}s?$', value)
            if match:
                multiplier = float(match.group(1)) if match.group(1) else 1
                return str(int(multiplier * num))
    
    # Plain number
    plain = re.sub(r'[^\d.]', '', value)
    if plain:
        return str(int(float(plain)))
    
    return value  # Return as-is if can't parse


class UserInput(BaseModel):
    investment_amount: Optional[str] = None
    risk_level: Optional[str] = None
    business_domain: Optional[str] = None
    location: Optional[str] = "India"
    user_message: Optional[str] = None

    @field_validator('investment_amount', mode='before')
    @classmethod
    def clean_investment(cls, v):
        return parse_investment(v)


class BlueprintOutput(BaseModel):
    business_model_canvas: str
    market_research: str
    legal_requirements: str
    funding_options: str
    budget_allocation: str
    go_to_market: str
    investor_suggestions: str
    user_message: Optional[str] = None