import React, { useEffect, useState } from 'react';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://saikrishna471032-dream2plan-backend.hf.space';

const RISK_COLORS = {
  Low:    { bg: 'rgba(34,197,94,0.12)',  text: '#22c55e', border: 'rgba(34,197,94,0.25)'  },
  Medium: { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  High:   { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444', border: 'rgba(239,68,68,0.25)'  },
};

const FIT_COLORS = {
  Perfect: '#14b8a6',
  Good:    '#6366f1',
  Viable:  '#f59e0b',
};

const DOMAIN_ICONS = {
  EdTech: '🎓', FinTech: '💳', HealthTech: '🏥', AgriTech: '🌾',
  'E-Commerce': '🛒', SaaS: '☁️', FoodTech: '🍔', LogisticsTech: '🚚',
  CleanTech: '⚡', SpaceTech: '🚀', GameTech: '🎮', MediaTech: '📱',
  HRTech: '👥', LegalTech: '⚖️', TravelTech: '✈️', FashionTech: '👗',
  'Real Estate': '🏠', CyberSecurity: '🔒', Gaming: '🎮', Retail: '🏪',
  'Cloud Kitchen': '👨‍🍳', 'Food Delivery': '🍕', default: '💡',
};

function getDomainIcon(domain) {
  for (const [key, icon] of Object.entries(DOMAIN_ICONS)) {
    if (domain?.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return DOMAIN_ICONS.default;
}

function RiskBadge({ risk }) {
  const colors = RISK_COLORS[risk] || RISK_COLORS.Medium;
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: '100px',
      padding: '3px 10px',
      fontSize: '0.7rem',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
    }}>
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: colors.text,
        }}
      />
      {risk} Risk
    </span>
  );
}

export default function RecommendationsPage({
  inputData,
  onGenerate,
  onBack,
}) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [generatingDomain, setGeneratingDomain] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/recommend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            investment_amount: inputData?.investment_amount || null,
            risk_level: inputData?.risk_level || 'Medium',
            location: inputData?.location || 'India',
            user_message: inputData?.user_message || null,
            business_domain: inputData?.business_domain || null,
          }),
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        setData(result);
      } else {
        setError('AI could not generate recommendations');
      }
    } catch (err) {
      setError('Backend not reachable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (domain) => {
    setGeneratingDomain(domain);
    onGenerate({ ...inputData, business_domain: domain });
  };

  const formatInvestment = (amount) => {
    if (!amount) return null;

    try {
      const num = parseInt(amount);

      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Crore`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
      if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;

      return `₹${num}`;
    } catch {
      return `₹${amount}`;
    }
  };

  const investment = formatInvestment(
    inputData?.investment_amount
  );

  const risk = inputData?.risk_level || 'Medium';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      
      {/* Loading */}
      {loading && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          Loading...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Main */}
      {!loading && data && (
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '60px 24px',
        }}>

          <p onClick={onBack}>← Back</p>

          <h1>Recommended Business Domains</h1>

          <div style={{
            display: 'grid',
            gap: '20px',
          }}>
            {(data.recommendations?.top_3 || []).map(
              (item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-white)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                  }}
                >
                  <h3>
                    {getDomainIcon(item.domain)} {item.domain}
                  </h3>

                  <RiskBadge risk={item.risk} />

                  <p>{item.why}</p>

                  <button
                    onClick={() =>
                      handleGenerate(item.domain)
                    }
                  >
                    Generate Blueprint
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}