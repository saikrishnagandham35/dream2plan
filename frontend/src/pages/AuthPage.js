import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// modes: 'login' | 'signup' | 'forgot' | 'otp' | 'reset'
export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode]               = useState('login');
  const [form, setForm]               = useState({ name: '', email: '', password: '', otp: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpEmail, setOtpEmail]       = useState('');

  const reset = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setForm({ name: '', email: '', password: '', otp: '', newPassword: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  // ── SUBMIT HANDLERS ──────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Email and password are required'); return; }
    if (!isValidEmail(form.email))     { setError('Please enter a valid email (e.g. name@gmail.com)'); return; }
    await callAuth('/api/auth/login', { email: form.email, password: form.password });
  };

  const handleSignup = async () => {
    if (!form.name.trim())             { setError('Please enter your full name'); return; }
    if (!form.email)                   { setError('Email is required'); return; }
    if (!isValidEmail(form.email))     { setError('Please enter a valid email (e.g. name@gmail.com)'); return; }
    if (!form.password)                { setError('Password is required'); return; }
    if (form.password.length < 6)     { setError('Password must be at least 6 characters'); return; }
    await callAuth('/api/auth/signup', { name: form.name.trim(), email: form.email, password: form.password });
  };

  const handleForgot = async () => {
    if (!form.email)               { setError('Please enter your registered email'); return; }
    if (!isValidEmail(form.email)) { setError('Please enter a valid email (e.g. name@gmail.com)'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Failed to send OTP'); return; }
      setOtpEmail(form.email.toLowerCase().trim());
      setSuccess('OTP sent! Check your inbox (and spam folder).');
      setMode('otp');
      setForm(f => ({ ...f, otp: '' }));
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    if (!form.otp || form.otp.length !== 6) { setError('Please enter the 6-digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: form.otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Invalid OTP'); return; }
      setSuccess('OTP verified! Set your new password.');
      setMode('reset');
      setForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const handleResendOTP = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Failed to resend OTP'); return; }
      setSuccess('New OTP sent to your email!');
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!form.newPassword)              { setError('Please enter a new password'); return; }
    if (form.newPassword.length < 6)   { setError('Password must be at least 6 characters'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: form.otp, new_password: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Failed to reset password'); return; }
      setSuccess('Password reset successfully!');
      setTimeout(() => reset('login'), 1500);
    } catch { setError('Cannot connect to server'); }
    finally { setLoading(false); }
  };

  const callAuth = async (endpoint, body) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Something went wrong'); return; }
      localStorage.setItem('d2p_token', data.token);
      localStorage.setItem('d2p_user',  JSON.stringify(data.user));
      onAuthSuccess(data.user);
    } catch { setError('Cannot connect to server. Make sure backend is running.'); }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (mode === 'login')  handleLogin();
    if (mode === 'signup') handleSignup();
    if (mode === 'forgot') handleForgot();
    if (mode === 'otp')    handleVerifyOTP();
    if (mode === 'reset')  handleResetPassword();
  };

  // ── STYLES ────────────────────────────────────────────────
  const baseInput = {
    width: '100%', background: '#1e1e1e',
    border: '1.5px solid #2a2a2a', borderRadius: '10px',
    padding: '13px 16px', fontFamily: 'var(--font-body)',
    fontSize: '0.95rem', color: '#e8f5f3', outline: 'none',
    boxSizing: 'border-box', colorScheme: 'dark', transition: 'all 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: '700',
    color: '#6b8f8c', marginBottom: '7px',
    letterSpacing: '0.06em', textTransform: 'uppercase',
  };
  const onFocus = (e) => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)'; e.target.style.background = '#1a2a28'; };
  const onBlur  = (e) => { e.target.style.borderColor = '#2a2a2a'; e.target.style.boxShadow = 'none'; e.target.style.background = '#1e1e1e'; };

  const submitBtn = (label, handler, emoji = '') => (
    <button onClick={handler} disabled={loading} style={{
      width: '100%', marginTop: '20px', padding: '14px',
      background: loading ? '#0d6b62' : '#14b8a6', color: '#0f0f0f',
      border: 'none', borderRadius: '10px', fontFamily: 'var(--font-display)',
      fontSize: '1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      boxShadow: loading ? 'none' : '0 4px 16px rgba(20,184,166,0.25)',
    }}
    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d9488'; }}
    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#14b8a6'; }}
    >
      {loading ? (
        <><div style={{ width:'16px', height:'16px', border:'2px solid rgba(0,0,0,0.2)', borderTop:'2px solid #0f0f0f', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />Processing...</>
      ) : <>{emoji} {label}</>}
    </button>
  );

  const inputField = (name, label, type = 'text', placeholder = '', extraStyle = {}) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name} type={type} value={form[name]}
        onChange={handleChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={handleKeyDown}
        placeholder={placeholder} style={{ ...baseInput, ...extraStyle }}
        autoComplete={name === 'password' ? 'current-password' : name === 'newPassword' ? 'new-password' : name}
      />
    </div>
  );

  const passwordField = (name, label, show, setShow, placeholder) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          name={name} type={show ? 'text' : 'password'} value={form[name]}
          onChange={handleChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={handleKeyDown}
          placeholder={placeholder} style={{ ...baseInput, paddingRight: '44px' }}
        />
        <button onClick={() => setShow(!show)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'#4a6360' }}>
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );

  const titles = {
    login:  { icon: '🔑', title: 'Welcome back!',       sub: 'Sign in to your account' },
    signup: { icon: '✨', title: 'Create your account', sub: 'Join Dream2Plan for free' },
    forgot: { icon: '🔐', title: 'Forgot Password?',    sub: 'Enter your email to receive an OTP' },
    otp:    { icon: '📩', title: 'Enter OTP',           sub: `OTP sent to ${otpEmail}` },
    reset:  { icon: '🔒', title: 'Set New Password',    sub: 'Choose a strong new password' },
  };
  const current = titles[mode];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        input::placeholder { color: #4a6360 !important; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #1e1e1e inset !important;
          -webkit-text-fill-color: #e8f5f3 !important;
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeUp 0.4s ease both' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#14b8a6,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', margin:'0 auto 14px', boxShadow:'0 8px 24px rgba(20,184,166,0.3)' }}>
            {current.icon}
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:'800', color:'#e8f5f3', letterSpacing:'-0.03em', margin:'0 0 6px' }}>
            {current.title}
          </h1>
          <p style={{ color:'#6b8f8c', fontSize:'0.88rem' }}>{current.sub}</p>
        </div>

        {/* Card */}
        <div style={{ background:'#161616', border:'1.5px solid #242424', borderRadius:'18px', padding:'32px', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>

          {(mode === 'login' || mode === 'signup') && (
            <div style={{ display:'flex', background:'#1e1e1e', borderRadius:'10px', padding:'4px', marginBottom:'24px', border:'1px solid #2a2a2a' }}>
              {['login','signup'].map(m => (
                <button key={m} onClick={() => reset(m)} style={{
                  flex:1, padding:'9px',
                  background: mode === m ? '#14b8a6' : 'transparent',
                  color: mode === m ? '#0f0f0f' : '#6b8f8c',
                  border:'none', borderRadius:'8px', fontWeight:'700',
                  fontSize:'0.88rem', cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize',
                }}>
                  {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
                </button>
              ))}
            </div>
          )}

          {mode === 'login' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {inputField('email', 'Email Address', 'email', 'you@example.com')}
              {passwordField('password', 'Password', showPassword, setShowPassword, 'Your password')}
              <div style={{ textAlign:'right', marginTop:'-6px' }}>
                <span onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ color:'#14b8a6', fontSize:'0.82rem', cursor:'pointer', fontWeight:'500' }}>
                  Forgot password?
                </span>
              </div>
              {submitBtn('Sign In', handleLogin, '🔑')}
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {inputField('name', 'Full Name', 'text', 'Your full name')}
              {inputField('email', 'Email Address', 'email', 'you@example.com')}
              {passwordField('password', 'Password', showPassword, setShowPassword, 'Min 6 characters')}
              {submitBtn('Create Account', handleSignup, '✨')}
            </div>
          )}

          {mode === 'forgot' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {inputField('email', 'Registered Email', 'email', 'you@example.com')}
              {submitBtn('Send OTP', handleForgot, '📩')}
              <p style={{ textAlign:'center', color:'#4a6360', fontSize:'0.83rem', margin:0 }}>
                <span onClick={() => reset('login')} style={{ color:'#14b8a6', cursor:'pointer', fontWeight:'500' }}>← Back to Sign In</span>
              </p>
            </div>
          )}

          {mode === 'otp' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={labelStyle}>Enter 6-Digit OTP</label>
                <input
                  name="otp" type="text" value={form.otp}
                  onChange={e => { setForm(f => ({...f, otp: e.target.value.replace(/\D/g,'').slice(0,6)})); setError(''); }}
                  onFocus={onFocus} onBlur={onBlur} onKeyDown={handleKeyDown}
                  placeholder="_ _ _ _ _ _" maxLength={6}
                  style={{ ...baseInput, fontSize:'1.4rem', letterSpacing:'0.3em', textAlign:'center', fontFamily:'monospace' }}
                />
              </div>
              {submitBtn('Verify OTP', handleVerifyOTP, '✅')}
              <p style={{ textAlign:'center', color:'#4a6360', fontSize:'0.83rem', margin:0 }}>
                Didn't receive?{' '}
                <span onClick={handleResendOTP} style={{ color:'#14b8a6', cursor:'pointer', fontWeight:'600' }}>Resend OTP</span>
                {'  ·  '}
                <span onClick={() => reset('login')} style={{ color:'#556b68', cursor:'pointer' }}>Cancel</span>
              </p>
            </div>
          )}

          {mode === 'reset' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {passwordField('newPassword', 'New Password', showNewPassword, setShowNewPassword, 'Min 6 characters')}
              {passwordField('confirmPassword', 'Confirm Password', showNewPassword, setShowNewPassword, 'Re-enter new password')}
              {submitBtn('Reset Password', handleResetPassword, '🔒')}
            </div>
          )}

          {error && (
            <div style={{ marginTop:'16px', padding:'12px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', color:'#f87171', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'8px' }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop:'16px', padding:'12px 16px', background:'rgba(20,184,166,0.1)', border:'1px solid rgba(20,184,166,0.25)', borderRadius:'10px', color:'#14b8a6', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'8px' }}>
              ✅ {success}
            </div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <p style={{ textAlign:'center', marginTop:'20px', color:'#4a6360', fontSize:'0.85rem' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => reset(mode === 'login' ? 'signup' : 'login')} style={{ color:'#14b8a6', cursor:'pointer', fontWeight:'600' }}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}