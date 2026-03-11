import React, { useState } from 'react';

export default function Navbar({ onHome, currentPage, user, onLogout, onHistory }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('d2p_token');
    localStorage.removeItem('d2p_user');
    setDropdownOpen(false);
    onLogout();
  };

  const scrollToSection = (sectionId) => {
    if (currentPage !== 'landing') {
      onHome();
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,15,15,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #1e1e1e',
      padding: '0 24px',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
    }}>
      <style>{`
        .nav-btn { transition: all 0.2s !important; }
        .nav-btn:hover { background: rgba(20,184,166,0.1) !important; color: #14b8a6 !important; }
        .dropdown-item { transition: background 0.15s !important; cursor: pointer; }
        .dropdown-item:hover { background: #1e1e1e !important; }
      `}</style>

      {/* Logo */}
      <div onClick={onHome} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
        }}>💡</div>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '1.1rem',
          fontWeight: '800', color: '#e8f5f3', letterSpacing: '-0.02em',
        }}>Dream2Plan</span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Always visible nav links */}
        <button className="nav-btn" onClick={onHome} style={{
          background: 'transparent', color: '#9db8b4', border: 'none',
          borderRadius: '8px', padding: '7px 14px', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: '500',
        }}>Home</button>

        <button className="nav-btn" onClick={() => scrollToSection('how-it-works')} style={{
          background: 'transparent', color: '#9db8b4', border: 'none',
          borderRadius: '8px', padding: '7px 14px', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: '500',
        }}>How it Works</button>

        <button className="nav-btn" onClick={() => scrollToSection('about')} style={{
          background: 'transparent', color: '#9db8b4', border: 'none',
          borderRadius: '8px', padding: '7px 14px', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: '500',
        }}>About</button>

        {/* User avatar + dropdown — only when logged in */}
        {user && currentPage !== 'auth' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                background: 'rgba(20,184,166,0.1)',
                border: '1.5px solid rgba(20,184,166,0.25)',
                borderRadius: '100px', padding: '6px 12px 6px 8px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                color: '#e8f5f3', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#14b8a6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(20,184,166,0.25)'}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #14b8a6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: '700', color: '#fff',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '500', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name?.split(' ')[0]}
              </span>
              <span style={{ fontSize: '0.6rem', color: '#6b8f8c' }}>▼</span>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: '44px', right: 0,
                background: '#161616', border: '1.5px solid #2a2a2a',
                borderRadius: '12px', minWidth: '180px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                overflow: 'hidden', zIndex: 200,
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #2a2a2a' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600', color: '#e8f5f3' }}>{user?.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b8f8c', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                </div>
                <div className="dropdown-item" onClick={() => { setDropdownOpen(false); onHistory(); }}
                  style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#9db8b4', fontSize: '0.88rem' }}>
                  📋 My Blueprints
                </div>
                <div className="dropdown-item" onClick={() => { setDropdownOpen(false); onHome(); }}
                  style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#9db8b4', fontSize: '0.88rem' }}>
                  🏠 Home
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a' }}>
                  <div className="dropdown-item" onClick={handleLogout}
                    style={{ padding: '11px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontSize: '0.88rem' }}>
                    🚪 Sign Out
                  </div>
                </div>
              </div>
            )}

            {dropdownOpen && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setDropdownOpen(false)} />
            )}
          </div>
        )}

        {/* Not logged in — Login button */}
        {!user && currentPage !== 'auth' && (
          <button
            onClick={() => onHome('auth')}
            style={{
              background: 'var(--accent)', color: '#0f0f0f',
              border: 'none', borderRadius: '8px',
              padding: '7px 18px', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: '600',
            }}
          >Login</button>
        )}
      </div>
    </nav>
  );
}