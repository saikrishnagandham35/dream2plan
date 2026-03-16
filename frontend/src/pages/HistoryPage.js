import React, { useEffect, useState } from 'react';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://saikrishna471032-dream2plan-backend.hf.space';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatInvestment(amount) {
  if (!amount) return null;
  try {
    const num = parseInt(amount);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  } catch {
    return `₹${amount}`;
  }
}

const DOMAIN_ICONS = {
  EdTech: '🎓', FinTech: '💳', HealthTech: '🏥',
  AgriTech: '🌾', ECommerce: '🛒', SaaS: '☁️',
  FoodTech: '🍔', CleanTech: '⚡', LogisticsTech: '🚚',
  Gaming: '🎮', MediaTech: '📱', Default: '💡',
};

function getDomainIcon(domain) {
  if (!domain) return '💡';
  for (const [key, icon] of Object.entries(DOMAIN_ICONS)) {
    if (domain.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '💡';
}

export default function HistoryPage({ user, onViewBlueprint, onNewBlueprint }) {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  // eslint-disable-next-line
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('d2p_token');
      const res = await fetch(`${API_URL}/api/auth/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBlueprints(data.blueprints);
      } else {
        setError('Failed to load history');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px 24px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bp-card { transition: all 0.2s !important; cursor: pointer; }
        .bp-card:hover { transform: translateY(-2px) !important; border-color: #14b8a6 !important; box-shadow: 0 8px 32px rgba(20,184,166,0.15) !important; }
        .new-btn:hover { background: #0d9488 !important; }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '32px', animation: 'fadeUp 0.3s ease both' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
              fontWeight: '800', color: 'var(--text-primary)',
              letterSpacing: '-0.02em', marginBottom: '6px',
            }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {blueprints.length > 0
                ? `You have ${blueprints.length} saved blueprint${blueprints.length > 1 ? 's' : ''}`
                : 'Your saved blueprints will appear here'}
            </p>
          </div>

          <button
            className="new-btn"
            onClick={onNewBlueprint}
            style={{
              background: '#14b8a6', color: '#0f0f0f',
              border: 'none', borderRadius: '10px',
              padding: '10px 22px', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: '700',
              boxShadow: '0 4px 12px rgba(20,184,166,0.25)',
              transition: 'all 0.2s',
            }}
          >+ New Blueprint</button>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading your blueprints...</p>
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
              onClick={fetchHistory}
              style={{
                marginTop: '12px', background: '#14b8a6', color: '#0f0f0f',
                border: 'none', borderRadius: '8px', padding: '8px 20px',
                cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
              }}
            >Try Again</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && blueprints.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'var(--bg-white)', borderRadius: '16px',
            border: '1.5px dashed var(--border)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '8px' }}>No blueprints yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Generate your first business blueprint to get started
            </p>
            <button
              onClick={onNewBlueprint}
              style={{
                background: '#14b8a6', color: '#0f0f0f',
                border: 'none', borderRadius: '10px',
                padding: '10px 24px', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: '700',
              }}
            >🚀 Create Blueprint</button>
          </div>
        )}

        {/* Blueprint Cards */}
        {!loading && blueprints.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {blueprints.map((bp, i) => (
              <div
                key={bp.id}
                className="bp-card"
                onClick={() => onViewBlueprint(bp)}
                style={{
                  background: 'var(--bg-white)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  animation: `fadeUp ${0.1 + i * 0.05}s ease both`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {/* Left: icon + domain */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '0' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'rgba(20,184,166,0.1)',
                    border: '1px solid rgba(20,184,166,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', flexShrink: 0,
                  }}>
                    {getDomainIcon(bp.domain)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem', fontWeight: '700',
                      color: 'var(--text-primary)', margin: '0 0 4px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{bp.domain}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                      {timeAgo(bp.created_at)}
                    </p>
                  </div>
                </div>

                {/* Right: investment + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  {bp.investment && (
                    <span style={{
                      background: 'rgba(20,184,166,0.1)',
                      color: '#14b8a6',
                      border: '1px solid rgba(20,184,166,0.25)',
                      borderRadius: '100px', padding: '4px 12px',
                      fontSize: '0.78rem', fontWeight: '600',
                    }}>{formatInvestment(bp.investment)}</span>
                  )}
                  {bp.risk && (
                    <span style={{
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '100px', padding: '4px 12px',
                      fontSize: '0.78rem', fontWeight: '500',
                    }}>{bp.risk} Risk</span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}