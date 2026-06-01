import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

const SECTIONS = [
  { key: 'sales_insights',           icon: '📈', title: 'Sales Performance',       color: '#eff6ff', border: '#bfdbfe', tag: 'Revenue & Profit' },
  { key: 'feedback_insights',        icon: '💬', title: 'Customer Feedback',        color: '#fdf4ff', border: '#e9d5ff', tag: 'Sentiment Analysis' },
  { key: 'swot_analysis',            icon: '🔷', title: 'SWOT Analysis',            color: '#f0fdf4', border: '#bbf7d0', tag: 'Strategic Overview' },
  { key: 'feature_priorities',       icon: '🎯', title: 'Feature Prioritization',   color: '#fff7ed', border: '#fed7aa', tag: 'Product Roadmap' },
  { key: 'strategy_recommendations', icon: '🚀', title: 'Strategic Recommendations',color: '#fff1f2', border: '#fecdd3', tag: 'Action Plan' },
]

export default function ResultsPanel({ result }) {
  const [open, setOpen] = useState(0)

  const handleDownload = async () => {
    const res  = await axios.get('/report/download', { params: { pdf_path: result.pdf_path }, responseType: 'blob' })
    const url  = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', 'product_strategy_report.pdf')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div style={s.wrapper}>
      {/* Stats row */}
      <div style={s.statsRow}>
        {[
          { label: 'Rows Analyzed', value: result.rows_ingested, icon: '📊' },
          { label: 'Agents Run',    value: '6',                  icon: '🤖' },
          { label: 'Reports',       value: '5',                  icon: '📄' },
          { label: 'Status',        value: 'Complete',           icon: '✅' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={s.statCard}>
            <span style={s.statIcon}>{icon}</span>
            <span style={s.statValue}>{value}</span>
            <span style={s.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Download */}
      {result.pdf_path && (
        <button style={s.downloadBtn} onClick={handleDownload}>
          📄 Download Full PDF Report
        </button>
      )}

      {/* Accordion sections */}
      {SECTIONS.map(({ key, icon, title, color, border, tag }, i) => result[key] && (
        <div key={key} style={s.section}>
          <button style={s.sectionHead} onClick={() => setOpen(open === i ? -1 : i)}>
            <div style={s.sectionLeft}>
              <span style={{ ...s.sectionIcon, background: color, border: `1px solid ${border}` }}>{icon}</span>
              <div>
                <div style={s.sectionTitle}>{title}</div>
                <div style={s.sectionTag}>{tag}</div>
              </div>
            </div>
            <span style={s.chevron}>{open === i ? '▲' : '▼'}</span>
          </button>

          {open === i && (
            <div style={s.sectionBody}>
              <div style={s.mdBody} className="mdBody">
                <ReactMarkdown>{result[key]}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 12 },

  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  statCard: {
    background: '#fff', borderRadius: 12, padding: '16px 12px',
    textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  statIcon:  { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: 800, color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 500 },

  downloadBtn: {
    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '13px 20px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', width: '100%',
  },

  section:     { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  sectionHead: {
    width: '100%', background: 'none', border: 'none',
    padding: '16px 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', cursor: 'pointer',
  },
  sectionLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  sectionIcon:  { fontSize: 20, borderRadius: 8, padding: '6px 8px' },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a', textAlign: 'left' },
  sectionTag:   { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  chevron:      { fontSize: 11, color: '#94a3b8' },

  sectionBody: { padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' },
  mdBody: { paddingTop: 16, fontSize: 13, lineHeight: 1.8, color: '#334155' },
}
