import React, { useState } from 'react';

function InputPage({ onSubmit }) {
  const [formData, setFormData] = useState({
    investment_amount: '',
    risk_level: '',
    business_domain: '',
    location: 'India',
    user_message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSubmit({
      investment_amount: formData.investment_amount || null,
      risk_level:        formData.risk_level        || null,
      business_domain:   formData.business_domain   || null,
      location:          formData.location,
      user_message:      formData.user_message       || null,
    });
  };

  const baseInput = {
    width: '100%',
    background: '#232323',
    border: '1.5px solid #2a2a2a',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    fontFamily: 'var(--font-body)',
    fontSize: '0.93rem',
    color: '#e8f5f3',
    outline: 'none',
    transition: 'var(--transition)',
    appearance: 'none',
    WebkitAppearance: 'none',
    colorScheme: 'dark',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '700',
    color: '#9db8b4',
    marginBottom: '7px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const onFocus = (e) => {
    e.target.style.borderColor = '#14b8a6';
    e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.15)';
    e.target.style.background = '#1a2a28';
    e.target.style.color = '#e8f5f3';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = '#2a2a2a';
    e.target.style.boxShadow = 'none';
    e.target.style.background = '#232323';
    e.target.style.color = '#e8f5f3';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      padding: '56px 24px 80px',
      animation: 'fadeIn 0.4s ease both',
    }}>

      <style>{`
        select option {
          background: #232323 !important;
          color: #e8f5f3 !important;
        }
        input::placeholder, textarea::placeholder {
          color: #556b68 !important;
          opacity: 1;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        select:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #232323 inset !important;
          -webkit-text-fill-color: #e8f5f3 !important;
        }
      `}</style>

      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <p style={{
            fontSize: '0.73rem', fontWeight: '700', color: '#14b8a6',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '14px',
          }}>New Blueprint</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 2.7rem)',
            fontWeight: '800', color: '#e8f5f3',
            letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '14px',
          }}>
            Tell us about your<br />startup idea
          </h1>
          <p style={{ color: '#9db8b4', fontSize: '0.96rem', lineHeight: '1.7' }}>
            Describe your idea or fill the form — or do both for a more precise blueprint.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#181818',
          border: '1.5px solid #2a2a2a',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        }}>

          {/* Idea textarea */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Your Idea</label>
              <span style={{
                fontSize: '0.7rem', fontWeight: '600', color: '#14b8a6',
                background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.2)',
                borderRadius: '100px', padding: '2px 10px', letterSpacing: '0.05em',
              }}>Optional</span>
            </div>
            <textarea
              name="user_message"
              value={formData.user_message}
              onChange={handleChange}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="e.g. I want to build a platform that connects rural artisans with urban buyers..."
              rows={5}
              style={{ ...baseInput, resize: 'vertical', lineHeight: '1.7', minHeight: '120px' }}
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#2a2a2a' }} />
            <span style={{ fontSize: '0.75rem', color: '#556b68', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>
              or provide more details below
            </span>
            <div style={{ flex: 1, height: '1px', background: '#2a2a2a' }} />
          </div>

          <p style={{ ...labelStyle, marginBottom: '20px' }}>Startup Details</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Investment */}
            <div>
              <label style={labelStyle}>💰 Investment (₹)</label>
              <input
                type="number"
                name="investment_amount"
                value={formData.investment_amount}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder="e.g. 500000"
                style={baseInput}
              />
            </div>

            {/* Risk */}
            <div>
              <label style={labelStyle}>⚡ Risk Level</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="risk_level"
                  value={formData.risk_level}
                  onChange={handleChange}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={baseInput}
                >
                  <option value="">Select risk level</option>
                  <option value="Low">🟢 Low Risk - Safe, Stable Returns</option>
                  <option value="Medium">🟡 Medium Risk - Balanced Reward</option>
                  <option value="High">🔴 High Risk - Higher Returns</option>
                </select>
                <span style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#556b68',
                  pointerEvents: 'none', fontSize: '0.65rem',
                }}>▼</span>
              </div>
            </div>

            {/* Domain */}
            <div>
              <label style={labelStyle}>🏢 Business Domain</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="business_domain"
                  value={formData.business_domain}
                  onChange={handleChange}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={baseInput}
                >
                  <option value="">AI Recommends</option>
                  <option value="EdTech">📚 Education</option>
                  <option value="FinTech">💳 Finance & Banking</option>
                  <option value="HealthTech">🏥 Healthcare & Wellness</option>
                  <option value="AgriTech">🌾 Agriculture & Farming</option>
                  <option value="ECommerce">🛒 E-Commerce & Retail</option>
                  <option value="SaaS">💻 Software & SaaS</option>
                  <option value="FoodTech">🍔 Food & Beverages</option>
                  <option value="CleanTech">♻️ Clean Energy</option>
                  <option value="LogisticsTech">🚚 Logistics & Supply Chain</option>
                  <option value="HRTech">👥 Human Resources</option>
                  <option value="LegalTech">⚖️ Legal Services</option>
                  <option value="TravelTech">✈️ Travel & Tourism</option>
                  <option value="RealEstateTech">🏠 Real Estate</option>
                  <option value="RetailTech">🏪 Retail & Commerce</option>
                  <option value="CyberSecurity">🔐 Cyber Security</option>
                  <option value="Gaming">🎮 Gaming & Esports</option>
                  <option value="MediaTech">🎬 Media & Entertainment</option>
                  <option value="SportsTech">⚽ Sports & Fitness</option>
                  <option value="FashionTech">👗 Fashion & Lifestyle</option>
                  <option value="SpaceTech">🚀 Space & Defense</option>
                </select>
                <span style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#556b68',
                  pointerEvents: 'none', fontSize: '0.65rem',
                }}>▼</span>
              </div>
            </div>

            {/* Location — Dropdown */}
            <div>
              <label style={labelStyle}>📍 Location</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={baseInput}
                >
                  <option value="India">All Over India</option>
                  <option value="Vizag">🌊 Visakhapatnam (Vizag)</option>
                  <option value="Hyderabad">🏙️ Hyderabad</option>
                  <option value="Bangalore">🌿 Bangalore</option>
                  <option value="Chennai">🌞 Chennai</option>
                  <option value="Delhi">🏛️ Delhi</option>
                </select>
                <span style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: '#556b68',
                  pointerEvents: 'none', fontSize: '0.65rem',
                }}>▼</span>
              </div>
            </div>

          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%', marginTop: '32px', padding: '15px',
              background: '#14b8a6', color: '#0f0f0f',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-display)',
              fontSize: '1rem', fontWeight: '700',
              cursor: 'pointer', transition: 'var(--transition)',
              boxShadow: '0 4px 16px rgba(20,184,166,0.25)',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0d9488';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(20,184,166,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#14b8a6';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,184,166,0.25)';
            }}
          >
            Find Best Domains →
          </button>

        </div>
      </div>
    </div>
  );
}

export default InputPage;