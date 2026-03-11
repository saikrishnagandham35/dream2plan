import React, { useEffect, useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function formatInvestment(amount) {
  if (!amount) return null;
  try {
    const num = parseInt(amount);
    if (num >= 10000000) return `₹${(num/10000000).toFixed(1)} Cr`;
    if (num >= 100000)   return `₹${(num/100000).toFixed(1)}L`;
    if (num >= 1000)     return `₹${(num/1000).toFixed(1)}K`;
    return `₹${num}`;
  } catch { return `₹${amount}`; }
}

const DOMAIN_ICONS = {
  EdTech:'🎓', FinTech:'💳', HealthTech:'🏥', AgriTech:'🌾',
  ECommerce:'🛒', SaaS:'☁️', FoodTech:'🍔', CleanTech:'⚡',
  LogisticsTech:'🚚', Gaming:'🎮', MediaTech:'📱', Default:'💡',
};
function getDomainIcon(domain) {
  if (!domain) return '💡';
  for (const [key, icon] of Object.entries(DOMAIN_ICONS)) {
    if (domain.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '💡';
}

const RISK_COLORS = {
  Low:    { bg: 'rgba(34,197,94,0.1)',  text: '#22c55e' },
  Medium: { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' },
  High:   { bg: 'rgba(239,68,68,0.1)',  text: '#ef4444' },
};

export default function HistoryPage({ user, onViewBlueprint, onNewBlueprint }) {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('d2p_token');
      fetch(`${API_URL}/api/auth/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBlueprints(data.blueprints);
      } else {
        setError('Failed to load history');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '60px 24px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bp-card { transition: all 0.2s ease !important; }
        .bp-card:hover { border-color: var(--accent) !important; transform: translateY(-2px) !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px', animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                My Blueprints
              </p>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)',
                fontWeight: '800', color: 'var(--text-primary)',
                letterSpacing: '-0.03em', margin: 0,
              }}>
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                {blueprints.length > 0 ? `You have ${blueprints.length} saved blueprint${blueprints.length > 1 ? 's' : ''}` : 'No blueprints yet'}
              </p>
            </div>
            <button
              onClick={onNewBlueprint}
              style={{
                background: 'var(--accent)', color: '#0f0f0f',
                border: 'none', borderRadius: '10px',
                padding: '12px 24px', fontWeight: '700',
                fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 16px rgba(20,184,166,0.25)',
              }}
            >
              ✨ New Blueprint
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '3px solid var(--border)', borderTop: '3px solid var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            textAlign: 'center', padding: '60px',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <p>{error}</p>
            <button onClick={fetchHistory} style={{
              marginTop: '16px', background: 'var(--accent)', color: '#0f0f0f',
              border: 'none', borderRadius: '10px', padding: '10px 24px',
              fontWeight: '600', cursor: 'pointer',
            }}>Retry</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && blueprints.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: 'var(--bg-white)', border: '1.5px solid var(--border)',
            borderRadius: '18px', animation: 'fadeUp 0.4s ease both',
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🚀</div>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '10px' }}>
              No blueprints yet
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '28px', fontSize: '0.95rem' }}>
              Generate your first startup blueprint to see it here!
            </p>
            <button
              onClick={onNewBlueprint}
              style={{
                background: 'var(--accent)', color: '#0f0f0f',
                border: 'none', borderRadius: '10px',
                padding: '13px 32px', fontWeight: '700',
                fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(20,184,166,0.25)',
              }}
            >
              ✨ Generate First Blueprint
            </button>
          </div>
        )}

        {/* Blueprint cards grid */}
        {!loading && !error && blueprints.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {blueprints.map((bp, idx) => {
              const riskColor = RISK_COLORS[bp.risk] || RISK_COLORS.Medium;
              const domain = bp.domain || 'Unknown Domain';
              const investment = formatInvestment(bp.investment);
              return (
                <div
                  key={bp.id}
                  className="bp-card"
                  style={{
                    background: 'var(--bg-white)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '14px', padding: '22px',
                    cursor: 'pointer',
                    animation: `fadeUp ${0.3 + idx * 0.05}s ease both`,
                    display: 'flex', flexDirection: 'column', gap: '14px',
                  }}
                  onClick={() => onViewBlueprint(bp)}
                >
                  {/* Domain icon + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', flexShrink: 0,
                    }}>
                      {getDomainIcon(domain)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{
                        fontSize: '0.95rem', fontWeight: '700',
                        color: 'var(--text-primary)', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{domain}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {timeAgo(bp.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Idea snippet */}
                  {bp.idea && (
                    <p style={{
                      fontSize: '0.82rem', color: 'var(--text-secondary)',
                      lineHeight: '1.6', margin: 0,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>"{bp.idea}"</p>
                  )}

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {investment && (
                      <span style={{
                        background: 'var(--bg-subtle)', color: 'var(--accent)',
                        border: '1px solid rgba(20,184,166,0.2)',
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.72rem', fontWeight: '600',
                      }}>{investment}</span>
                    )}
                    {bp.risk && (
                      <span style={{
                        background: riskColor.bg, color: riskColor.text,
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '0.72rem', fontWeight: '600',
                      }}>{bp.risk} Risk</span>
                    )}
                  </div>

                  {/* View button */}
                  <div style={{
                    fontSize: '0.82rem', fontWeight: '600',
                    color: 'var(--accent)', display: 'flex',
                    alignItems: 'center', gap: '4px',
                  }}>
                    View Blueprint →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}