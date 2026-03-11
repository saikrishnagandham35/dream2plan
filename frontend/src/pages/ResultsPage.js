import React, { useState } from 'react';
import jsPDF from 'jspdf';

const tabs = [
  { key: 'business_model_canvas', label: 'Business Model', icon: '📊', color: '#14b8a6' },
  { key: 'market_research',       label: 'Market Research', icon: '🔍', color: '#6366f1' },
  { key: 'legal_requirements',    label: 'Legal',           icon: '⚖️', color: '#f59e0b' },
  { key: 'funding_options',       label: 'Funding',         icon: '💰', color: '#10b981' },
  { key: 'budget_allocation',     label: 'Budget',          icon: '📈', color: '#3b82f6' },
  { key: 'go_to_market',          label: 'Go-to-Market',    icon: '🚀', color: '#ec4899' },
  { key: 'investor_suggestions',  label: 'Investors',       icon: '🤝', color: '#8b5cf6' },
];

// ── Markdown Parser ──────────────────────────────────────────
// Converts LLM markdown output into clean React elements
function parseMarkdown(text) {
  if (!text) return [];
  text = text.replace(/===.*?===/g, '').trim();

  // If LLM returned one big paragraph with no newlines, break it up
  if (!text.includes('\n') && text.length > 300) {
    text = text
      .replace(/\.\s+([A-Z])/g, '.\n$1')
      .replace(/:\s+([A-Z\u2022-])/g, ':\n$1')
      .trim();
  }

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    if (trimmed.startsWith('### ')) {
      elements.push({ type: 'h3', text: trimmed.slice(4) });
      i++; continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push({ type: 'h2', text: trimmed.slice(3) });
      i++; continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push({ type: 'h2', text: trimmed.slice(2) });
      i++; continue;
    }

    // **Bold heading** alone on line
    if (/^\*\*[^*]+\*\*:?\s*$/.test(trimmed)) {
      elements.push({ type: 'bold-heading', text: trimmed.replace(/\*\*/g, '').replace(/:$/, '') });
      i++; continue;
    }

    // **Bold:** text on same line — render as bullet with bold label
    const boldInline = trimmed.match(/^\*\*(.+?)\*\*:?\s+(.+)$/);
    if (boldInline) {
      elements.push({ type: 'bold-bullet', label: boldInline[1], text: boldInline[2] });
      i++; continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bullets = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith('- ') || t.startsWith('* ')) { bullets.push(t.slice(2)); i++; }
        else if (!t) { i++; break; }
        else { break; }
      }
      elements.push({ type: 'bullets', items: bullets });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^\d+\.\s/.test(t)) { items.push(t.replace(/^\d+\.\s/, '')); i++; }
        else if (!t) { i++; break; }
        else { break; }
      }
      elements.push({ type: 'numbered', items });
      continue;
    }

    elements.push({ type: 'paragraph', text: trimmed });
    i++;
  }

  return elements;
}

// Render inline markdown: **bold**, *italic*, remove === markers
function renderInline(text) {
  if (!text) return null;
  // Remove === section markers if they leaked into content
  text = text.replace(/===.*?===/g, '').trim();
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// Render parsed markdown elements
function MarkdownContent({ text, accentColor }) {
  if (!text || !text.trim()) {
    return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No data available.</p>;
  }

  const elements = parseMarkdown(text);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {elements.map((el, idx) => {
        if (el.type === 'h2') return (
          <h2 key={idx} style={{
            fontSize: '1.1rem', fontWeight: '700',
            color: 'var(--text-primary)', marginTop: '20px', marginBottom: '6px',
            fontFamily: 'var(--font-display)',
          }}>{el.text}</h2>
        );

        if (el.type === 'h3') return (
          <h3 key={idx} style={{
            fontSize: '0.95rem', fontWeight: '700',
            color: accentColor || 'var(--accent)', marginTop: '16px', marginBottom: '4px',
            letterSpacing: '0.01em',
          }}>{el.text}</h3>
        );

        if (el.type === 'bold-heading') return (
          <div key={idx} style={{
            fontSize: '0.88rem', fontWeight: '700',
            color: accentColor || 'var(--accent)',
            marginTop: '14px', marginBottom: '2px',
            paddingLeft: '12px',
            borderLeft: `3px solid ${accentColor || 'var(--accent)'}`,
            letterSpacing: '0.01em',
          }}>{el.text}</div>
        );

        if (el.type === 'bullets') return (
          <ul key={idx} style={{ listStyle: 'none', padding: 0, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {el.items.map((item, ii) => (
              <li key={ii} style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: accentColor || 'var(--accent)',
                  flexShrink: 0, marginTop: '7px',
                }} />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );

        if (el.type === 'numbered') return (
          <ol key={idx} style={{ padding: 0, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: '6px', listStyle: 'none' }}>
            {el.items.map((item, ii) => (
              <li key={ii} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7',
              }}>
                <span style={{
                  minWidth: '22px', height: '22px',
                  background: accentColor || 'var(--accent)',
                  color: '#0f0f0f', borderRadius: '50%',
                  fontSize: '0.7rem', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '2px',
                }}>{ii + 1}</span>
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        );

        if (el.type === 'bold-bullet') return (
          <li key={idx} style={{
            display: 'flex', gap: '10px', alignItems: 'flex-start',
            color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7',
            listStyle: 'none', margin: '4px 0',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: accentColor || 'var(--accent)',
              flexShrink: 0, marginTop: '8px',
            }} />
            <span>
              <strong style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{el.label}: </strong>
              {renderInline(el.text)}
            </span>
          </li>
        );

        if (el.type === 'paragraph') return (
          <p key={idx} style={{
            color: 'var(--text-secondary)', fontSize: '0.9rem',
            lineHeight: '1.75', margin: '4px 0',
          }}>{renderInline(el.text)}</p>
        );

        return null;
      })}
    </div>
  );
}

// ── Main ResultsPage ─────────────────────────────────────────
function formatInvestment(raw) {
  if (!raw) return null;
  try {
    const num = parseInt(raw);
    if (isNaN(num)) return raw;
    if (num >= 10000000) return `₹${(num/10000000).toFixed(1)} Crore`;
    if (num >= 100000)   return `₹${(num/100000).toFixed(1)} Lakh`;
    if (num >= 1000)     return `₹${(num/1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  } catch { return raw; }
}

function ResultsPage({ data, onBack }) {
  const [activeTab, setActiveTab] = useState('business_model_canvas');
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = pageW - margin * 2 - 5; // extra 5mm safety buffer
      let y = margin;

      const checkPage = (needed = 10) => {
        if (y + needed > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const cleanText = (text) => {
        if (!text) return '';
        return text
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/#{1,3}\s/g, '')
          .replace(/===.*?===/g, '')
          .replace(/---/g, '')
          .replace(/₹/g, 'Rs.')       // ← fix: jsPDF can't render ₹ symbol
          // eslint-disable-next-line no-control-regex
          .replace(/[^\u0000-\u007F]/g, (ch) => {
            const map = { '→': '->', '←': '<-', '•': '-', '…': '...', '\u2019': "'", '\u2018': "'", '\u201C': '"', '\u201D': '"' };
            return map[ch] || '';
          })
          .trim();
      };

      // ── Cover Page ──
      // Dark background header
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, pageW, 60, 'F');

      // Teal accent bar
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, pageW, 4, 'F');

      // Title
      doc.setTextColor(232, 245, 243);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('DREAM2PLAN', margin, 28);

      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(157, 184, 180);
      doc.text('AI Startup Blueprint Generator', margin, 38);

      doc.setFontSize(10);
      doc.setTextColor(85, 107, 104);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, 50);

      y = 75;

      // Blueprint title
      doc.setTextColor(20, 20, 20);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Startup Blueprint', margin, y);
      y += 12;

      // Summary pills row
      const summary = data.input_summary || {};
      const pills = [
        summary.domain && summary.domain !== 'AI Recommended' ? `Domain: ${summary.domain}` : null,
        summary.investment && summary.investment !== 'Not specified' ? `Investment: ${summary.investment}` : null,
        summary.risk ? `Risk: ${summary.risk}` : null,
        `Location: India`,
      ].filter(Boolean);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let pillX = margin;
      pills.forEach(pill => {
        // eslint-disable-next-line no-control-regex
        pill = pill.replace(/₹/g, 'Rs.').replace(/[^\u0000-\u007F]/g, '');
        const pillW = doc.getTextWidth(pill) + 8;
        doc.setFillColor(232, 245, 243);
        doc.setDrawColor(20, 184, 166);
        doc.roundedRect(pillX, y - 4, pillW, 7, 2, 2, 'FD');
        doc.setTextColor(20, 150, 136);
        doc.text(pill, pillX + 4, y + 1);
        pillX += pillW + 6;
      });
      y += 16;

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 12;

      // ── Sections ──
      const sectionColors = {
        business_model_canvas: [20, 184, 166],
        market_research:       [99, 102, 241],
        legal_requirements:    [245, 158, 11],
        funding_options:       [16, 185, 129],
        budget_allocation:     [59, 130, 246],
        go_to_market:          [236, 72, 153],
        investor_suggestions:  [139, 92, 246],
      };

      tabs.forEach((tab) => {
        const content = blueprint[tab.key];
        if (!content || !content.trim()) return;

        checkPage(20);

        // Section header background
        const [r, g, b] = sectionColors[tab.key] || [20, 184, 166];
        doc.setFillColor(r, g, b);
        doc.rect(margin, y - 5, contentW, 12, 'F');

        // Section title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${tab.label.toUpperCase()}`, margin + 4, y + 3);
        y += 14;

        // Section content
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const lines = content.split('\n');
        lines.forEach(line => {
          const clean = cleanText(line);
          if (!clean) return;

          checkPage(8);

          // Bullet point
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const bulletText = clean.replace(/^[-*]\s*/, '');
            doc.setFillColor(r, g, b);
            doc.circle(margin + 2, y - 1, 1, 'F');
            const wrapped = doc.splitTextToSize(bulletText, contentW - 8);
            wrapped.forEach((wline, wi) => {
              checkPage(6);
              doc.text(wline, margin + 6, y);
              if (wi < wrapped.length - 1) y += 5;
            });
            y += 6;
          }
          // Bold heading line
          else if (line.trim().startsWith('**') || line.trim().startsWith('###')) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(r, g, b);
            const wrapped = doc.splitTextToSize(clean, contentW);
            wrapped.forEach(wline => {
              checkPage(6);
              doc.text(wline, margin, y);
              y += 6;
            });
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(40, 40, 40);
          }
          // Regular paragraph
          else {
            const wrapped = doc.splitTextToSize(clean, contentW);
            wrapped.forEach(wline => {
              checkPage(6);
              doc.text(wline, margin, y);
              y += 5.5;
            });
            y += 2;
          }
        });

        y += 10;

        // Section divider
        checkPage(5);
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(margin, y - 5, pageW - margin, y - 5);
      });

      // ── Footer on each page ──
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(245, 245, 245);
        doc.rect(0, pageH - 12, pageW, 12, 'F');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated by Dream2Plan — AI Startup Blueprint Generator', margin, pageH - 4);
        doc.text(`Page ${i} of ${totalPages}`, pageW - margin - 20, pageH - 4);
      }

      // ── Save ──
      const domain = data.input_summary?.domain || 'Startup';
      const filename = `Dream2Plan_${domain.replace(/\s+/g, '_')}_Blueprint.pdf`;
      doc.save(filename);

    } catch (err) {
      console.error('PDF Error:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (!data || !data.blueprint) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-page)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No blueprint data found.</p>
          <button onClick={onBack} style={{
            padding: '12px 28px', background: 'var(--accent)', color: '#0f0f0f',
            border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontWeight: '600', fontSize: '0.95rem',
          }}>← Go Back</button>
        </div>
      </div>
    );
  }

  const blueprint = data.blueprint || {};
  const activeTabData = tabs.find(t => t.key === activeTab);
  const activeColor = activeTabData?.color || 'var(--accent)';

  const handleCopy = () => {
    const content = blueprint[activeTab] || '';
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Progress: count non-empty sections
  const filledSections = tabs.filter(t => blueprint[t.key]?.trim()).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tab-btn:hover { background: var(--bg-subtle) !important; }
        .copy-btn:hover { border-color: var(--accent) !important; color: var(--accent) !important; }
        .back-btn:hover { border-color: var(--accent) !important; color: var(--accent) !important; background: var(--accent-light) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background: 'var(--bg-white)',
        borderBottom: '1px solid var(--border)',
        padding: '28px 24px 0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* Top row */}
          <div style={{
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '16px',
            flexWrap: 'wrap', marginBottom: '20px',
          }}>
            <div>
              {/* Success badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                }} />
                <span style={{
                  fontSize: '0.7rem', fontWeight: '700', color: '#22c55e',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>Blueprint Ready — {filledSections}/7 Sections</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
                fontWeight: '800', color: 'var(--text-primary)',
                letterSpacing: '-0.02em', marginBottom: '14px',
              }}>{data.input_summary?.domain && data.input_summary.domain !== 'AI Recommended' ? data.input_summary.domain : 'Your Startup Blueprint'}</h1>

              {/* Summary pills — investment, risk, India only */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {data.input_summary?.investment && data.input_summary.investment !== 'Not specified' && (
                  <span style={{
                    background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '100px', padding: '4px 14px',
                    fontSize: '0.75rem', fontWeight: '500',
                  }}>{formatInvestment(data.input_summary.investment_raw) || data.input_summary.investment}</span>
                )}
                {data.input_summary?.risk && (
                  <span style={{
                    background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '100px', padding: '4px 14px',
                    fontSize: '0.75rem', fontWeight: '500',
                  }}>{data.input_summary.risk} Risk</span>
                )}
                <span style={{
                  background: 'var(--bg-subtle)', color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '100px', padding: '4px 14px',
                  fontSize: '0.75rem', fontWeight: '500',
                }}>India</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <button
                className="copy-btn"
                onClick={handleCopy}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px', padding: '10px 18px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: '500',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                style={{
                  background: pdfLoading ? 'var(--bg-subtle)' : 'var(--accent)',
                  border: '1.5px solid var(--accent)',
                  borderRadius: '10px', padding: '10px 18px',
                  color: pdfLoading ? 'var(--text-muted)' : '#0f0f0f',
                  fontSize: '0.85rem', fontWeight: '600',
                  cursor: pdfLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                {pdfLoading ? '⏳ Generating...' : '⬇️ Download PDF'}
              </button>
              <button
                className="back-btn"
                onClick={onBack}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '10px', padding: '10px 18px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: '500',
                  cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >← New Blueprint</button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '0' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.key;
              const hasContent = !!blueprint[tab.key]?.trim();
              return (
                <button
                  key={tab.key}
                  className="tab-btn"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'transparent',
                    color: isActive ? tab.color : 'var(--text-muted)',
                    border: 'none',
                    borderBottom: isActive ? `2.5px solid ${tab.color}` : '2.5px solid transparent',
                    padding: '10px 16px 12px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.83rem', fontWeight: isActive ? '600' : '400',
                    cursor: 'pointer', transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    borderRadius: '0',
                    opacity: hasContent ? 1 : 0.5,
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{tab.icon}</span>
                  {tab.label}
                  {hasContent && !isActive && (
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: tab.color, opacity: 0.6,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div
          key={activeTab}
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border)',
            borderTop: `3px solid ${activeColor}`,
            borderRadius: '0 0 16px 16px',
            padding: '36px 40px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            minHeight: '400px',
            animation: 'fadeUp 0.25s ease both',
          }}
        >
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '28px', paddingBottom: '20px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${activeColor}18`,
              border: `1px solid ${activeColor}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem',
            }}>
              {activeTabData?.icon}
            </div>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem', fontWeight: '700',
                color: 'var(--text-primary)', letterSpacing: '-0.01em',
                margin: 0,
              }}>{activeTabData?.label}</h2>
              <p style={{
                fontSize: '0.75rem', color: 'var(--text-muted)',
                margin: '2px 0 0', letterSpacing: '0.02em',
              }}>
                {data.input_summary?.domain || 'Startup'} · {formatInvestment(data.input_summary?.investment_raw) || data.input_summary?.investment || ''} · India
              </p>
            </div>
          </div>

          {/* Markdown content */}
          <MarkdownContent
            text={blueprint[activeTab]}
            accentColor={activeColor}
          />
        </div>

        {/* Section navigation dots */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '8px', marginTop: '28px',
        }}>
          {tabs.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              title={tab.label}
              style={{
                width: activeTab === tab.key ? '24px' : '8px',
                height: '8px',
                borderRadius: '100px',
                background: activeTab === tab.key ? tab.color : 'var(--border)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.25s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Prev / Next navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginTop: '20px',
        }}>
          {(() => {
            const currentIdx = tabs.findIndex(t => t.key === activeTab);
            const prev = tabs[currentIdx - 1];
            const next = tabs[currentIdx + 1];
            return (
              <>
                {prev ? (
                  <button
                    onClick={() => setActiveTab(prev.key)}
                    style={{
                      background: 'var(--bg-white)', border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '10px 20px',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontSize: '0.84rem', fontWeight: '500',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s',
                    }}
                  >← {prev.icon} {prev.label}</button>
                ) : <div />}
                {next ? (
                  <button
                    onClick={() => setActiveTab(next.key)}
                    style={{
                      background: activeTabData?.color || 'var(--accent)',
                      border: 'none', borderRadius: '10px',
                      padding: '10px 20px', color: '#0f0f0f',
                      cursor: 'pointer', fontSize: '0.84rem', fontWeight: '600',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s',
                    }}
                  >{next.icon} {next.label} →</button>
                ) : (
                  <button
                    onClick={onBack}
                    style={{
                      background: 'var(--accent)', border: 'none',
                      borderRadius: '10px', padding: '10px 20px',
                      color: '#0f0f0f', cursor: 'pointer',
                      fontSize: '0.84rem', fontWeight: '600',
                    }}
                  >🎉 Start New Blueprint</button>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;