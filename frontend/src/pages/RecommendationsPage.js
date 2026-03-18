import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://saikrishna471032-dream2plan-backend.hf.space';

export default function RecommendationsPage({ inputData, onGenerate, onBack }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [generatingDomain, setGeneratingDomain] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investment_amount: inputData?.investment_amount || null,
          risk_level: inputData?.risk_level || 'Medium',
          location: inputData?.location || 'India',
          user_message: inputData?.user_message || null,
          business_domain: inputData?.business_domain || null,
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

  const handleGenerate = (domain) => {
    setGeneratingDomain(domain);
    onGenerate({ ...inputData, business_domain: domain });
  };

  const riskColor = (risk) => {
    if (!risk) return '#6b8f8c';
    const r = risk.toLowerCase();
    if (r === 'low') return '#10b981';
    if (r === 'medium') return '#f59e0b';
    if (r === 'high') return '#ef4444';
    return '#6b8f8c';
  };

  const potentialColor = (p) => {
    if (!p) return '#6b8f8c';
    return p.toLowerCase() === 'high' ? '#6366f1' : '#14b8a6';
  };

  const fitColor = (f) => {
    if (!f) return '#6b8f8c';
    const fl = f.toLowerCase();
    if (fl === 'perfect') return '#10b981';
    if (fl === 'good') return '#14b8a6';
    return '#f59e0b';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px 16px', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rec-card { transition: all 0.2s !important; }
        .rec-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
        .gen-btn:hover { background: #0d9488 !important; }
        .other-card:hover { background: #1e1e1e !important; border-color: #14b8a6 !important; }
        @media (max-width: 768px) { .rec-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 769px) and (max-width: 1024px) { .rec-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: 'var(--bg-white)', border: '1.5px solid var(--border)',
            borderRadius: '10px', padding: '8px 18px',
            color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: '500',
            marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >← Back</button>

        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.3s ease both' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: '800', color: 'var(--text-primary)',
            letterSpacing: '-0.02em', marginBottom: '8px',
          }}>Recommended Business Domains</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-curated startup ideas based on your budget and preferences
          </p>
          {data && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {data.investment && (
                <span style={{
                  background: 'rgba(20,184,166,0.12)', color: '#14b8a6',
                  border: '1px solid rgba(20,184,166,0.3)',
                  borderRadius: '100px', padding: '4px 14px',
                  fontSize: '0.75rem', fontWeight: '600',
                }}>{data.investment}</span>
              )}
              {data.risk && (
                <span style={{
                  background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px', padding: '4px 14px',
                  fontSize: '0.75rem', fontWeight: '500',
                }}>{data.risk} Risk</span>
              )}
              {data.location && (
                <span style={{
                  background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px', padding: '4px 14px',
                  fontSize: '0.75rem', fontWeight: '500',
                }}>📍 {data.location}</span>
              )}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '80px 0' }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid rgba(20,184,166,0.2)',
              borderTop: '3px solid #14b8a6',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Finding best startup ideas for you...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '20px', textAlign: 'center',
          }}>
            <p style={{ color: '#f87171', margin: 0 }}>⚠️ {error}</p>
            <button
              onClick={fetchRecommendations}
              style={{
                marginTop: '12px', background: '#14b8a6', color: '#0f0f0f',
                border: 'none', borderRadius: '8px', padding: '8px 20px',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
              }}
            >Try Again</button>
          </div>
        )}

        {/* Top 3 Cards + Other Options */}
        {!loading && data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* ✅ 3 Cards side by side */}
            <div
              className="rec-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
                alignItems: 'stretch',
              }}
            >
              {data.recommendations?.top_3?.map((item, i) => (
                <div
                  key={i}
                  className="rec-card"
                  style={{
                    background: 'var(--bg-white)',
                    border: '1.5px solid var(--border)',
                    borderTop: `3px solid ${i === 0 ? '#14b8a6' : i === 1 ? '#6366f1' : '#ec4899'}`,
                    borderRadius: '16px', padding: '24px 20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                    animation: `fadeUp ${0.2 + i * 0.1}s ease both`,
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Rank + Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: i === 0 ? 'rgba(20,184,166,0.15)' : i === 1 ? 'rgba(99,102,241,0.15)' : 'rgba(236,72,153,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: '800',
                      color: i === 0 ? '#14b8a6' : i === 1 ? '#6366f1' : '#ec4899',
                      flexShrink: 0,
                    }}>#{i + 1}</div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem', fontWeight: '700',
                      color: 'var(--text-primary)', margin: 0,
                    }}>{item.domain}</h3>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {item.risk && (
                      <span style={{
                        background: `${riskColor(item.risk)}20`,
                        color: riskColor(item.risk),
                        border: `1px solid ${riskColor(item.risk)}40`,
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.72rem', fontWeight: '600',
                      }}>{item.risk} Risk</span>
                    )}
                    {item.potential && (
                      <span style={{
                        background: `${potentialColor(item.potential)}20`,
                        color: potentialColor(item.potential),
                        border: `1px solid ${potentialColor(item.potential)}40`,
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.72rem', fontWeight: '600',
                      }}>{item.potential} Potential</span>
                    )}
                    {item.investment_fit && (
                      <span style={{
                        background: `${fitColor(item.investment_fit)}20`,
                        color: fitColor(item.investment_fit),
                        border: `1px solid ${fitColor(item.investment_fit)}40`,
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.72rem', fontWeight: '600',
                      }}>{item.investment_fit} Fit</span>
                    )}
                  </div>

                  {/* Tagline */}
                  {item.tagline && (
                    <p style={{
                      fontSize: '0.85rem', color: '#14b8a6',
                      fontWeight: '500', margin: '0 0 10px',
                    }}>{item.tagline}</p>
                  )}

                  {/* Why */}
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.88rem',
                    lineHeight: '1.7', margin: '0 0 20px',
                    flex: 1,
                  }}>{item.why}</p>

                  {/* Generate button */}
                  <button
                    className="gen-btn"
                    onClick={() => handleGenerate(item.domain)}
                    disabled={generatingDomain === item.domain}
                    style={{
                      background: generatingDomain === item.domain ? '#0d6b62' : '#14b8a6',
                      color: '#0f0f0f', border: 'none', borderRadius: '10px',
                      padding: '10px 24px',
                      cursor: generatingDomain === item.domain ? 'not-allowed' : 'pointer',
                      fontSize: '0.88rem', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(20,184,166,0.25)',
                      width: '100%',
                    }}
                  >
                    {generatingDomain === item.domain ? (
                      <>
                        <div style={{
                          width: '14px', height: '14px',
                          border: '2px solid rgba(0,0,0,0.2)',
                          borderTop: '2px solid #0f0f0f',
                          borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                        }} />
                        Generating...
                      </>
                    ) : '🚀 Generate Blueprint'}
                  </button>
                </div>
              ))}
            </div>

            {/* ✅ Other Options — BELOW the 3 cards */}
            {data.recommendations?.other_options?.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)',
                  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
                }}>More Options</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {data.recommendations.other_options.map((opt, i) => (
                    <div
                      key={i}
                      className="other-card"
                      onClick={() => handleGenerate(opt.domain)}
                      style={{
                        background: 'var(--bg-subtle)', border: '1.5px solid var(--border)',
                        borderRadius: '10px', padding: '10px 16px',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>
                        {opt.domain}
                      </span>
                      {opt.risk && (
                        <span style={{
                          color: riskColor(opt.risk), fontSize: '0.72rem',
                          fontWeight: '600', background: `${riskColor(opt.risk)}15`,
                          borderRadius: '100px', padding: '2px 8px',
                        }}>{opt.risk}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}