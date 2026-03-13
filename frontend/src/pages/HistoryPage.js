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
  EdTech: '🎓',
  FinTech: '💳',
  HealthTech: '🏥',
  AgriTech: '🌾',
  ECommerce: '🛒',
  SaaS: '☁️',
  FoodTech: '🍔',
  CleanTech: '⚡',
  LogisticsTech: '🚚',
  Gaming: '🎮',
  MediaTech: '📱',
  Default: '💡',
};


function getDomainIcon(domain) {
  if (!domain) return '💡';

  for (const [key, icon] of Object.entries(DOMAIN_ICONS)) {
    if (domain.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }

  return '💡';
}


export default function HistoryPage({
  user,
  onViewBlueprint,
  onNewBlueprint,
}) {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


// ✅ FIX FOR VERCEL CI WARNING
  useEffect(() => {
    fetchHistory();
// eslint-disable-next-line
  }, []);


  const fetchHistory = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('d2p_token');

      const res = await fetch(
        `${API_URL}/api/auth/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    <div style={{ padding: 40 }}>

      <h2>
        Welcome back {user?.name}
      </h2>

      <button onClick={onNewBlueprint}>
        New Blueprint
      </button>


      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}


      {!loading &&
        blueprints.map((bp) => (

          <div
            key={bp.id}
            onClick={() => onViewBlueprint(bp)}
            style={{
              border: '1px solid #ccc',
              padding: 10,
              marginTop: 10,
              cursor: 'pointer'
            }}
          >

            <div>
              {getDomainIcon(bp.domain)} {bp.domain}
            </div>

            <div>
              {formatInvestment(bp.investment)}
            </div>

            <div>
              {timeAgo(bp.created_at)}
            </div>

          </div>

        ))}

    </div>
  );
}