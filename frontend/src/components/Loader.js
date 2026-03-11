import React, { useEffect, useState } from 'react';

const steps = [
  { text: 'Understanding your idea...' },
  { text: 'Researching Indian market data...' },
  { text: 'Analyzing competitors...' },
  { text: 'Building your blueprint...' },
];

function Loader() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-page)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loaderFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        background: 'var(--bg-white)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '52px 44px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)',
        animation: 'loaderFade 0.4s ease both',
      }}>

        {/* Spinner */}
        <div style={{
          width: '56px', height: '56px',
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
          margin: '0 auto 28px auto',
        }} />

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem', fontWeight: '700',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em', marginBottom: '8px',
        }}>
          Generating Blueprint
        </h2>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.88rem',
          marginBottom: '36px', lineHeight: '1.6',
        }}>
          Our AI is crafting your personalized startup plan...
        </p>

        {/* Steps */}
        <div style={{ textAlign: 'left' }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 0',
              borderBottom: i < steps.length - 1 ? '1px solid var(--divider)' : 'none',
              opacity: i <= currentStep ? 1 : 0.3,
              transition: 'opacity 0.5s ease',
            }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: i < currentStep ? 'var(--accent)' : 'transparent',
                border: i <= currentStep ? '2px solid var(--accent)' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.6rem',
                color: i < currentStep ? '#fff' : 'var(--accent)',
                fontWeight: '700',
                transition: 'all 0.5s ease',
              }}>
                {i < currentStep ? '✓' : i === currentStep ? '●' : ''}
              </div>
              <span style={{
                fontSize: '0.86rem',
                color: i <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: i === currentStep ? '600' : '400',
                transition: 'all 0.5s ease',
              }}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        <p style={{
          marginTop: '28px', fontSize: '0.75rem',
          color: 'var(--text-muted)', letterSpacing: '0.04em',
        }}>
          This usually takes 15–30 seconds
        </p>
      </div>
    </div>
  );
}

export default Loader;