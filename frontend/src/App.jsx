import { useState } from 'react'
import UploadPanel   from './components/UploadPanel'
import ResultsPanel  from './components/ResultsPanel'
import ChatInterface from './components/ChatInterface'

export default function App() {
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab,     setTab]     = useState('dashboard')

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <span style={s.logoIcon}>⚡</span>
          <span style={s.logoText}>StrategyAI</span>
        </div>

        <nav style={s.nav}>
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'chat',      icon: '💬', label: 'Ask AI'    },
          ].map(({ id, icon, label }) => (
            <div
              key={id}
              style={{ ...s.navItem, ...(tab === id ? s.navActive : {}) }}
              onClick={() => setTab(id)}
            >
              <span style={s.navIcon}>{icon}</span>
              <span>{label}</span>
              {id === 'chat' && <span style={s.navBadge}>AI</span>}
            </div>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.badge}>AI-Powered</div>
          <p style={s.version}>v1.0.0 · GPT-4o mini</p>
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        {/* Top bar */}
        <header style={s.topbar}>
          <div>
            <h1 style={s.pageTitle}>
              {tab === 'dashboard' ? 'Product Strategy Assistant' : 'Ask AI'}
            </h1>
            <p style={s.pageSub}>
              {tab === 'dashboard'
                ? 'Upload your data and get AI-driven strategic insights'
                : 'Ask anything about your uploaded business data'}
            </p>
          </div>
          {result && tab === 'dashboard' && (
            <div style={s.statusBadge}>
              <span style={s.dot} /> Analysis Complete
            </div>
          )}
        </header>

        {/* Tab Content */}
        <div style={s.content}>

          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && (
            <div style={s.dashLayout}>
              {/* Left — Upload */}
              <div style={s.leftCol}>
                <UploadPanel onResult={(r) => { setResult(r); }} onLoading={setLoading} />

                {/* Quick stats after analysis */}
                {result && !loading && (
                  <div style={s.quickStats}>
                    {[
                      { label: 'Rows',    value: result.rows_ingested, icon: '📊' },
                      { label: 'Agents',  value: '6',                  icon: '🤖' },
                      { label: 'Reports', value: '5',                  icon: '📄' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} style={s.statCard}>
                        <span style={s.statIcon}>{icon}</span>
                        <span style={s.statValue}>{value}</span>
                        <span style={s.statLabel}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {result && !loading && (
                  <button style={s.chatCTA} onClick={() => setTab('chat')}>
                    💬 Switch to Ask AI →
                  </button>
                )}
              </div>

              {/* Right — Results */}
              <div style={s.rightCol}>
                {loading  && <LoadingCard />}
                {result   && !loading && <div className="fade-in"><ResultsPanel result={result} /></div>}
                {!result  && !loading && <EmptyState />}
              </div>
            </div>
          )}

          {/* CHAT TAB */}
          {tab === 'chat' && (
            <div style={s.chatFull}>
              <ChatInterface />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  const agents = ['Sales Agent', 'Feedback Agent', 'SWOT Agent', 'Feature Agent', 'Strategy Agent', 'Report Agent']
  return (
    <div style={s.loadCard}>
      <div style={s.spinner} />
      <h3 style={s.loadTitle}>Running AI Analysis</h3>
      <p style={s.loadSub}>6 agents are analyzing your data...</p>
      <div style={s.agentGrid}>
        {agents.map((a, i) => (
          <div key={i} style={s.agentChip}>
            <span style={{ ...s.agentDot, animationDelay: `${i * 0.2}s` }} />
            {a}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={s.empty}>
      <div style={s.emptyIcon}>📊</div>
      <h3 style={s.emptyTitle}>No Analysis Yet</h3>
      <p style={s.emptySub}>Upload a file on the left and click Analyze</p>
      <div style={s.emptyHints}>
        {['Sales Performance', 'Customer Feedback', 'SWOT Analysis', 'Feature Priorities', 'Strategy Plan'].map(h => (
          <span key={h} style={s.hint}>{h}</span>
        ))}
      </div>
    </div>
  )
}

const s = {
  root:    { display: 'flex', minHeight: '100vh', background: '#f8fafc' },

  sidebar: {
    width: 220, background: '#0f172a',
    display: 'flex', flexDirection: 'column',
    padding: '24px 16px', position: 'sticky',
    top: 0, height: '100vh', flexShrink: 0,
  },
  logo:     { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoIcon: { fontSize: 24 },
  logoText: { color: '#fff', fontWeight: 800, fontSize: 18 },
  nav:      { display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  navItem:  {
    display: 'flex', alignItems: 'center', gap: 10,
    color: '#94a3b8', padding: '11px 12px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  navActive:  { background: '#1e293b', color: '#fff' },
  navIcon:    { fontSize: 16 },
  navBadge:   { marginLeft: 'auto', background: '#3b82f6', color: '#fff', borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700 },
  sidebarFooter: { borderTop: '1px solid #1e293b', paddingTop: 16 },
  badge:         { background: '#1e3a5f', color: '#60a5fa', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'inline-block', marginBottom: 6 },
  version:       { color: '#475569', fontSize: 11 },

  main:    { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar:  {
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    padding: '20px 32px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
  },
  pageTitle:   { fontSize: 20, fontWeight: 700, color: '#0f172a' },
  pageSub:     { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 20, padding: '6px 14px', fontSize: 13, fontWeight: 600 },
  dot:         { width: 8, height: 8, background: '#16a34a', borderRadius: '50%' },

  content:    { flex: 1, padding: 28 },

  dashLayout: { display: 'flex', gap: 24, alignItems: 'flex-start' },
  leftCol:    { width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 },
  rightCol:   { flex: 1, minWidth: 0 },

  quickStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  statCard:   { background: '#fff', borderRadius: 10, padding: '14px 10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 },
  statIcon:   { fontSize: 20 },
  statValue:  { fontSize: 18, fontWeight: 800, color: '#0f172a' },
  statLabel:  { fontSize: 11, color: '#94a3b8' },

  chatCTA: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '12px 20px', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', width: '100%',
  },

  // Full page chat
  chatFull: { height: 'calc(100vh - 85px)', display: 'flex', flexDirection: 'column' },

  loadCard:  { background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  spinner:   { width: 52, height: 52, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' },
  loadTitle: { fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  loadSub:   { fontSize: 13, color: '#64748b', marginBottom: 20 },
  agentGrid: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  agentChip: { display: 'flex', alignItems: 'center', gap: 6, background: '#f1f5f9', borderRadius: 20, padding: '6px 12px', fontSize: 12, color: '#475569', fontWeight: 500 },
  agentDot:  { width: 6, height: 6, background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1.4s ease-in-out infinite' },

  empty:      { background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  emptyIcon:  { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 8 },
  emptySub:   { fontSize: 13, color: '#64748b', marginBottom: 24 },
  emptyHints: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  hint:       { background: '#f1f5f9', color: '#475569', borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 500 },
}
