import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const SUGGESTIONS = [
  'Which product has highest returns?',
  'What region is performing best?',
  'What are the main complaints?',
  'Which product should we invest in?',
]

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! 👋 I can answer questions about your product data. Try one of the suggestions below or ask anything.' }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [messages])

  const send = async (q) => {
    const question = (q || input).trim()
    if (!question) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)
    try {
      const res = await axios.post('/chat', { question })
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Error getting answer. Please try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.headerIcon}>💬</span>
          <div>
            <div style={s.headerTitle}>Ask AI</div>
            <div style={s.headerSub}>Powered by your data</div>
          </div>
        </div>
        <div style={s.onlineDot} />
      </div>

      {/* Suggestions */}
      <div style={s.suggestions}>
        {SUGGESTIONS.map(q => (
          <button key={q} style={s.suggestion} onClick={() => send(q)}>{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={s.msgWrap(msg.role)}>
            {msg.role === 'assistant' && <span style={s.avatar}>🤖</span>}
            <div style={s.bubble(msg.role)}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={s.msgWrap('assistant')}>
            <span style={s.avatar}>🤖</span>
            <div style={s.bubble('assistant')}>
              <span style={s.typing}>● ● ●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputRow}>
        <input
          style={s.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask about your data..."
          disabled={loading}
        />
        <button style={{ ...s.sendBtn, ...(loading || !input.trim() ? s.sendDisabled : {}) }} onClick={() => send()} disabled={loading || !input.trim()}>
          ➤
        </button>
      </div>
    </div>
  )
}

const s = {
  card:   { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', height: '100%' },

  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  headerIcon: { fontSize: 24, background: '#f0fdf4', borderRadius: 8, padding: '6px 8px' },
  headerTitle: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  headerSub:   { fontSize: 11, color: '#94a3b8' },
  onlineDot:   { width: 8, height: 8, background: '#10b981', borderRadius: '50%' },

  suggestions: { display: 'flex', flexWrap: 'wrap', gap: 6, padding: '12px 16px', borderBottom: '1px solid #f1f5f9' },
  suggestion:  {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 20, padding: '5px 12px', fontSize: 11,
    color: '#475569', cursor: 'pointer', fontWeight: 500,
    fontFamily: 'inherit',
  },

  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 },
  msgWrap:  role => ({ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: role === 'user' ? 'flex-end' : 'flex-start' }),
  avatar:   { fontSize: 20, flexShrink: 0 },
  bubble:   role => ({
    maxWidth: '78%', padding: '10px 14px', borderRadius: 14, fontSize: 13, lineHeight: 1.6,
    background: role === 'user' ? 'linear-gradient(135deg, #1e40af, #3b82f6)' : '#f1f5f9',
    color: role === 'user' ? '#fff' : '#334155',
    borderBottomRightRadius: role === 'user' ? 4 : 14,
    borderBottomLeftRadius:  role === 'user' ? 14 : 4,
  }),
  typing: { color: '#94a3b8', letterSpacing: 3, fontSize: 16 },

  inputRow: { display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #f1f5f9' },
  input: {
    flex: 1, padding: '10px 14px', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', color: '#0f172a',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: '#fff', border: 'none', borderRadius: 10,
    width: 40, height: 40, fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4, cursor: 'not-allowed' },
}
