import React, { useEffect, useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
      background: colors.bg, color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: '100px', padding: '3px 10px',
      fontSize: '0.7rem', fontWeight: '700',
      letterSpacing: '0.04em', display: 'inline-flex',
      alignItems: 'center', gap: '4px',
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: colors.text,
      }} />
      {risk} Risk
    </span>
  );
}

export default function RecommendationsPage({ inputData, onGenerate, onBack }) {
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
      fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment_amount: inputData?.investment_amount || null,
          risk_level:        inputData?.risk_level        || 'Medium',
          location:          inputData?.location          || 'India',
          user_message:      inputData?.user_message      || null,
          business_domain:   inputData?.business_domain   || null,
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(result);
      } else {
        setError('Failed to get recommendations');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (domain) => {
    setGeneratingDomain(domain);
    onGenerate({ ...inputData, business_domain: domain });
  };

  // Format investment display
  const formatInvestment = (amount) => {
    if (!amount) return null;
    try {
      const num = parseInt(amount);
      if (num >= 10000000) return `₹${(num/10000000).toFixed(1)} Crore`;
      if (num >= 100000)   return `₹${(num/100000).toFixed(1)} Lakh`;
      if (num >= 1000)     return `₹${(num/1000).toFixed(1)}K`;
      return `₹${num}`;
    } catch { return `₹${amount}`; }
  };

  const investment = formatInvestment(inputData?.investment_amount);
  const risk = inputData?.risk_level || 'Medium';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .rec-card { transition: all 0.25s ease !important; }
        .rec-card:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.3) !important; }
        .gen-btn { transition: all 0.2s ease !important; }
        .gen-btn:hover { opacity: 0.88 !important; transform: scale(1.02) !important; }
        .other-pill { transition: all 0.2s ease !important; cursor: pointer; }
        .other-pill:hover { border-color: var(--accent) !important; color: var(--accent) !important; background: var(--accent-light) !important; transform: translateY(-2px) !important; }
        .back-link { transition: color 0.2s; cursor: pointer; }
        .back-link:hover { color: var(--accent) !important; }
      `}</style>

      {/* ── Loading State ── */}
      {loading && (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '20px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--accent)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1rem', marginBottom: '6px' }}>
              Analyzing your inputs...
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              AI is finding the best domains for your budget
            </p>
          </div>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={fetchRecommendations} style={{
            background: 'var(--accent)', color: '#0f0f0f',
            border: 'none', borderRadius: '10px',
            padding: '12px 28px', cursor: 'pointer',
            fontWeight: '600', fontSize: '0.9rem',
          }}>Try Again</button>
        </div>
      )}

      {/* ── Main Content ── */}
      {!loading && data && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>

          {/* Back link */}
          <p
            className="back-link"
            onClick={onBack}
            style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '40px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            ← Back to Input
          </p>

          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: '56px', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--accent-light)', border: '1px solid rgba(20,184,166,0.25)',
              borderRadius: '100px', padding: '6px 18px',
              fontSize: '0.78rem', fontWeight: '600', color: 'var(--accent)',
              letterSpacing: '0.04em', marginBottom: '20px',
            }}>
              ✦ AI-Powered Recommendations
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: '800', color: 'var(--text-primary)',
              letterSpacing: '-0.03em', marginBottom: '12px', lineHeight: '1.2',
            }}>
              Recommended Business Domains
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
              Based on your investment
              {investment && <strong style={{ color: 'var(--text-primary)' }}> of {investment}</strong>}
              {risk && <span> with <strong style={{ color: 'var(--text-primary)' }}>{risk.toLowerCase()} risk</strong> tolerance</span>}
            </p>
          </div>

          {/* Top 3 */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <h2 style={{
                fontSize: '1rem', fontWeight: '700',
                color: 'var(--text-primary)', letterSpacing: '-0.01em',
              }}>Top 3 Recommendations</h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
            }}>
              {(data.recommendations?.top_3 || []).map((item, idx) => (
                <div
                  key={idx}
                  className="rec-card"
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: 'var(--bg-white)',
                    border: hoveredCard === idx ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                    borderRadius: '16px',
                    padding: '28px',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    animation: `fadeUp ${0.3 + idx * 0.1}s ease both`,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Top accent line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '3px',
                    background: idx === 0 ? '#14b8a6' : idx === 1 ? '#6366f1' : '#f59e0b',
                    borderRadius: '16px 16px 0 0',
                  }} />

                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem',
                      }}>
                        {getDomainIcon(item.domain)}
                      </div>
                      <div>
                        <h3 style={{
                          fontSize: '1rem', fontWeight: '700',
                          color: 'var(--text-primary)', margin: 0,
                          letterSpacing: '-0.01em',
                        }}>{item.domain}</h3>
                        <p style={{
                          fontSize: '0.75rem', color: 'var(--text-muted)',
                          margin: '2px 0 0',
                        }}>{item.tagline}</p>
                        {item.parent_domain && (
                          <span style={{
                            fontSize: '0.65rem', color: 'var(--accent)',
                            background: 'var(--accent-light)',
                            border: '1px solid rgba(20,184,166,0.2)',
                            borderRadius: '100px', padding: '1px 8px',
                            marginTop: '4px', display: 'inline-block',
                            fontWeight: '600', letterSpacing: '0.03em',
                          }}>{item.parent_domain}</span>
                        )}
                      </div>
                    </div>
                    <RiskBadge risk={item.risk || 'Medium'} />
                  </div>

                  {/* Why this domain */}
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.875rem',
                    lineHeight: '1.7', margin: 0, flex: 1,
                  }}>{item.why}</p>

                  {/* Badges row */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.potential && (
                      <span style={{
                        background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.7rem', fontWeight: '500',
                      }}>📈 {item.potential} Potential</span>
                    )}
                    {item.investment_fit && (
                      <span style={{
                        background: 'var(--bg-subtle)',
                        color: FIT_COLORS[item.investment_fit] || 'var(--text-muted)',
                        border: '1px solid var(--border)',
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.7rem', fontWeight: '600',
                      }}>✓ {item.investment_fit} Fit</span>
                    )}
                  </div>

                  {/* Generate button */}
                  <button
                    className="gen-btn"
                    onClick={() => handleGenerate(item.domain)}
                    disabled={generatingDomain !== null}
                    style={{
                      background: idx === 0 ? '#14b8a6' : idx === 1 ? '#6366f1' : '#f59e0b',
                      color: '#0f0f0f',
                      border: 'none', borderRadius: '10px',
                      padding: '13px 20px',
                      fontWeight: '700', fontSize: '0.9rem',
                      cursor: generatingDomain ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      opacity: generatingDomain && generatingDomain !== item.domain ? 0.5 : 1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {generatingDomain === item.domain ? (
                      <>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%',
                          border: '2px solid rgba(0,0,0,0.2)',
                          borderTop: '2px solid #0f0f0f',
                          animation: 'spin 0.7s linear infinite',
                        }} />
                        Generating...
                      </>
                    ) : (
                      <>Generate Blueprint →</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Other Options */}
          {data.recommendations?.other_options?.length > 0 && (
            <div style={{ animation: 'fadeUp 0.6s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: '1rem', fontWeight: '700',
                  color: 'var(--text-primary)', letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}>Other Feasible Options</h2>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {data.recommendations.other_options.map((item, idx) => {
                  const riskColors = RISK_COLORS[item.risk] || RISK_COLORS.Medium;
                  return (
                    <button
                      key={idx}
                      className="other-pill"
                      onClick={() => handleGenerate(item.domain)}
                      disabled={generatingDomain !== null}
                      style={{
                        background: 'var(--bg-white)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '100px',
                        padding: '10px 20px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem', fontWeight: '500',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        opacity: generatingDomain ? 0.6 : 1,
                      }}
                    >
                      <span>{getDomainIcon(item.domain)}</span>
                      {item.domain}
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: riskColors.text, flexShrink: 0,
                      }} />
                    </button>
                  );
                })}
              </div>

              <p style={{
                color: 'var(--text-muted)', fontSize: '0.78rem',
                marginTop: '12px',
              }}>
                💡 Click any domain above to generate its blueprint directly
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}