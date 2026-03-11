import React, { useEffect, useState } from 'react';

const features = [
  { icon: '📊', title: 'Business Model Canvas', desc: 'Complete BMC with all 9 building blocks tailored to your domain.' },
  { icon: '🔍', title: 'Market Research', desc: 'Competitor analysis, market sizing, and key growth insights.' },
  { icon: '⚖️', title: 'Legal Requirements', desc: 'Compliance guidance — GST, MSME, Startup India registration.' },
  { icon: '💰', title: 'Funding Options', desc: 'Government schemes, angel investors & top VC firms.' },
  { icon: '📈', title: 'Budget Allocation', desc: 'Smart breakdown of your investment across every department.' },
  { icon: '🚀', title: 'Go-to-Market Strategy', desc: 'Launch phases, marketing channels, and growth tactics.' },
];

const steps = [
  { number: '01', icon: '✍️', title: 'Describe Your Idea', desc: 'Write your concept or fill the quick form below.' },
  { number: '02', icon: '🤖', title: 'AI Analyzes', desc: 'Our AI researches market data, legal needs, and competitors.' },
  { number: '03', icon: '📋', title: 'Get Your Blueprint', desc: 'Receive a complete, actionable startup plan instantly.' },
];

const domains = [
  { icon: '📚', name: 'Education' },
  { icon: '💳', name: 'Finance' },
  { icon: '🏥', name: 'Healthcare' },
  { icon: '🌾', name: 'Agriculture' },
  { icon: '🛒', name: 'E-Commerce' },
  { icon: '💻', name: 'SaaS' },
  { icon: '🍔', name: 'Food & Beverage' },
  { icon: '♻️', name: 'Clean Energy' },
  { icon: '🚚', name: 'Logistics' },
  { icon: '👥', name: 'Human Resources' },
  { icon: '⚖️', name: 'Legal Services' },
  { icon: '✈️', name: 'Travel' },
  { icon: '🏠', name: 'Real Estate' },
  { icon: '🔐', name: 'Cyber Security' },
  { icon: '🎮', name: 'Gaming' },
  { icon: '🎬', name: 'Media' },
  { icon: '⚽', name: 'Sports' },
  { icon: '👗', name: 'Fashion' },
  { icon: '🚀', name: 'Space & Defense' },
  { icon: '🏪', name: 'Retail' },
];

function LandingPage({ onGetStarted }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

  const anim = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(22px)',
    transition: `all 0.55s ease ${delay}s`,
  });

  // Duplicate for seamless loop
  const marqueeItems = [...domains, ...domains];

  return (
    <div style={{ background: 'var(--bg-page)', overflowX: 'hidden' }}>

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-track-reverse {
          display: flex;
          width: max-content;
          animation: marquee-reverse 32s linear infinite;
        }
        .marquee-track-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{
        background: 'var(--bg-white)',
        borderBottom: '1px solid var(--border)',
        padding: '140px 48px 0px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Soft radial glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,70,229,0.07) 0%, transparent 70%)`,
        }} />
        {/* Decorative rings */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          border: '1px solid rgba(79,70,229,0.06)',
          top: '-260px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
          border: '1px solid rgba(79,70,229,0.05)',
          top: '-120px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Heading */}
          <h1 style={{
            ...anim(0),
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3.8vw, 3.4rem)',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1.1',
            letterSpacing: '-0.03em',
            marginBottom: '18px',
            whiteSpace: 'nowrap',
          }}>
            Turn Your Idea Into a{' '}
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, var(--indigo-500) 0%, var(--indigo-800) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Startup Blueprint
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            ...anim(0.1),
            fontSize: '1.12rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.7',
            marginBottom: '44px',
            fontWeight: '400',
            whiteSpace: 'nowrap',
          }}>
            Describe your startup idea. Get a complete business plan — instantly.
          </p>

          {/* CTA */}
          <div style={{ ...anim(0.18), display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <button
              onClick={onGetStarted}
              style={{
                background: 'linear-gradient(135deg, var(--indigo-500), var(--indigo-700))',
                color: '#fff', border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '16px 52px',
                fontFamily: 'var(--font-display)',
                fontSize: '1.05rem', fontWeight: '600',
                cursor: 'pointer', transition: 'var(--transition)',
                boxShadow: 'var(--shadow-indigo)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(79,70,229,0.38)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-indigo)';
              }}
            >
              Get Started →
            </button>
          </div>

          {/* Trust row */}
          <div style={{
            ...anim(0.25),
            display: 'flex', gap: '28px',
            justifyContent: 'center', flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '60px',
          }}>
            {[
              { icon: '⚡', text: 'Results in 30s' },
              { icon: '🧠', text: 'AI-Based Suggestions' },
              { icon: '📡', text: 'RAG Real-Time Data' },
              { icon: '🎯', text: 'Domain-Specific Plans' },
            ].map((b, i, arr) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.88rem' }}>{b.icon}</span>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: '500',
                    color: 'var(--text-muted)', fontFamily: 'var(--font-body)',
                  }}>{b.text}</span>
                </div>
                {i < arr.length - 1 && (
                  <span style={{ color: 'var(--border)', fontSize: '0.5rem' }}>●</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Marquee Row 1 ── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '12px',
          // fade edges
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}>
          <div className="marquee-track">
            {marqueeItems.map((d, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-page)',
                border: '1.5px solid var(--border)',
                borderRadius: '100px',
                padding: '8px 20px',
                margin: '0 6px',
                whiteSpace: 'nowrap',
                transition: 'var(--transition)',
              }}>
                <span style={{ fontSize: '1rem' }}>{d.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem', fontWeight: '600',
                  color: 'var(--text-secondary)',
                }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Marquee Row 2 (reverse) ── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '48px',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}>
          <div className="marquee-track-reverse">
            {[...marqueeItems].reverse().map((d, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'var(--accent-light)',
                border: '1.5px solid var(--indigo-200)',
                borderRadius: '100px',
                padding: '8px 20px',
                margin: '0 6px',
                whiteSpace: 'nowrap',
              }}>
                <span style={{ fontSize: '1rem' }}>{d.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem', fontWeight: '600',
                  color: 'var(--accent)',
                }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{ background: 'var(--bg-page)', padding: '100px 48px' }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--indigo-200)', borderRadius: '100px',
              padding: '4px 16px', fontSize: '0.72rem', fontWeight: '600',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px',
              fontFamily: 'var(--font-body)',
            }}>What You Get</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 2.9rem)',
              fontWeight: '700', color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
            }}>
              Everything to launch your startup
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '18px',
          }}>
            {features.map((f, i) => (
              <div key={i}
                style={{
                  background: 'var(--bg-white)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '28px',
                  transition: 'var(--transition)',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(79,70,229,0.1)';
                  e.currentTarget.querySelector('.top-line').style.opacity = '1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.querySelector('.top-line').style.opacity = '0';
                }}
              >
                <div className="top-line" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: 'linear-gradient(90deg, var(--indigo-400), var(--indigo-600))',
                  opacity: 0, transition: 'var(--transition)',
                }} />
                <div style={{
                  width: '48px', height: '48px',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--indigo-200)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '16px',
                }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: '600',
                  color: 'var(--text-primary)', marginBottom: '7px',
                }}>{f.title}</h3>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.875rem',
                  lineHeight: '1.7', fontFamily: 'var(--font-body)',
                }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{
        background: 'var(--bg-white)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '100px 48px',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--indigo-200)', borderRadius: '100px',
              padding: '4px 16px', fontSize: '0.72rem', fontWeight: '600',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px',
              fontFamily: 'var(--font-body)',
            }}>How It Works</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 2.9rem)',
              fontWeight: '700', color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
            }}>
              Three steps to your blueprint
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg-page)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 28px',
                textAlign: 'center',
                position: 'relative',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,70,229,0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: '-16px',
                    transform: 'translateY(-50%)',
                    fontSize: '1.1rem', color: 'var(--indigo-300)', zIndex: 2,
                  }}>→</div>
                )}
                <div style={{
                  width: '64px', height: '64px',
                  background: 'linear-gradient(135deg, var(--indigo-500), var(--indigo-700))',
                  borderRadius: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '1.8rem',
                  boxShadow: 'var(--shadow-indigo)',
                }}>{s.icon}</div>
                <div style={{
                  fontSize: '0.68rem', fontWeight: '700',
                  color: 'var(--accent)', letterSpacing: '0.12em',
                  textTransform: 'uppercase', marginBottom: '8px',
                  fontFamily: 'var(--font-body)',
                }}>Step {s.number}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem', fontWeight: '600',
                  color: 'var(--text-primary)', marginBottom: '10px',
                }}>{s.title}</h3>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.86rem',
                  lineHeight: '1.7', fontFamily: 'var(--font-body)',
                }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" style={{
        background: 'var(--bg-page)',
        padding: '100px 48px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={{
              display: 'inline-block',
              background: 'var(--accent-light)', color: 'var(--accent)',
              border: '1px solid var(--indigo-200)', borderRadius: '100px',
              padding: '4px 16px', fontSize: '0.72rem', fontWeight: '600',
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '18px',
              fontFamily: 'var(--font-body)',
            }}>About</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 2.9rem)',
              fontWeight: '700', color: 'var(--text-primary)',
              letterSpacing: '-0.025em', marginBottom: '20px',
            }}>
              What is Dream2Plan?
            </h2>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '1.05rem',
              lineHeight: '1.85', fontFamily: 'var(--font-body)',
              maxWidth: '700px', margin: '0 auto',
            }}>
              Dream2Plan is an AI-powered startup blueprint generator built specifically for Indian entrepreneurs.
              Whether you have a rough idea or a detailed concept, our platform instantly converts it into a
              structured, investor-ready business plan.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px', marginBottom: '48px',
          }}>
            {[
              { icon: '🎯', title: 'Our Mission', desc: 'To democratize startup planning — making it fast, intelligent, and accessible to every entrepreneur.' },
              { icon: '🤖', title: 'How It Works', desc: 'We use advanced AI combined with RAG to pull real-time Indian market data and generate accurate, domain-specific plans.' },
              { icon: '🇮🇳', title: 'Built for India', desc: 'Every blueprint is tailored with Indian legal requirements, government schemes, local funding options, and market data.' },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'var(--bg-white)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(79,70,229,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--indigo-200)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '16px',
                }}>{card.icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem', fontWeight: '600',
                  color: 'var(--text-primary)', marginBottom: '8px',
                }}>{card.title}</h3>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.875rem',
                  lineHeight: '1.7', fontFamily: 'var(--font-body)',
                }}>{card.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: 'var(--text-muted)', fontSize: '0.9rem',
              fontFamily: 'var(--font-body)',
            }}>
              This project was built as a BTech Final Year Project — combining AI, RAG, and real startup data to help aspiring entrepreneurs.
            </p>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: '100px 48px', background: 'var(--bg-white)', textAlign: 'center' }}>
        <div style={{
          maxWidth: '680px', margin: '0 auto',
          background: 'linear-gradient(135deg, var(--indigo-600) 0%, var(--indigo-900) 100%)',
          borderRadius: '32px', padding: '64px 48px',
          boxShadow: '0 24px 80px rgba(79,70,229,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 80% at 50% 120%, rgba(255,255,255,0.07) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', top: '16px', right: '24px',
            width: '90px', height: '90px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px', display: 'inline-block', animation: 'float 3s ease-in-out infinite' }}>🚀</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
              fontWeight: '700', color: '#fff',
              letterSpacing: '-0.025em', lineHeight: '1.15', marginBottom: '14px',
            }}>Ready to build your startup?</h2>
            <p style={{
              color: 'rgba(255,255,255,0.78)', fontSize: '1rem',
              marginBottom: '36px', lineHeight: '1.7', fontFamily: 'var(--font-body)',
            }}>
              Join entrepreneurs across India who used Dream2Plan to turn their ideas into action.
            </p>
            <button onClick={onGetStarted} style={{
              background: '#fff', color: 'var(--indigo-700)',
              border: 'none', borderRadius: '14px', padding: '15px 44px',
              fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: '700',
              cursor: 'pointer', transition: 'var(--transition)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
            }}>
              Get Started →
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{
        padding: '28px 48px', background: 'var(--bg-white)',
        borderTop: '1px solid var(--border)', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, var(--indigo-500), var(--indigo-700))',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
          }}>💡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
            Dream2Plan
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
          © 2026 Dream2Plan &nbsp;·&nbsp; Built with ❤️ for India's startup ecosystem 
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;