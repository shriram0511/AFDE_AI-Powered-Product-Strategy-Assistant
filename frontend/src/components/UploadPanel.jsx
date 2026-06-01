import { useState } from 'react'
import axios from 'axios'

export default function UploadPanel({ onResult, onLoading }) {
  const [file,    setFile]    = useState(null)
  const [error,   setError]   = useState('')
  const [drag,    setDrag]    = useState(false)

  const handleUpload = async () => {
    if (!file) { setError('Please select a CSV file first.'); return }
    setError('')
    onLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post('/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      onResult(res.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      onLoading(false)
    }
  }

  const onDrop = e => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith('.csv')) setFile(f)
    else setError('Only CSV files are supported.')
  }

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardIcon}>📂</span>
        <div>
          <h2 style={s.cardTitle}>Upload Data</h2>
          <p style={s.cardSub}>CSV · PDF · TXT · DOCX supported</p>
        </div>
      </div>

      <label
        style={{ ...s.dropzone, ...(drag ? s.dragOver : {}), ...(file ? s.dropzoneFilled : {}) }}
        onDragOver={e => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        <input type="file" accept=".csv,.pdf,.txt,.docx,.md" style={{ display: 'none' }} onChange={e => { setFile(e.target.files[0]); setError('') }} />
        {file ? (
          <div style={s.fileInfo}>
            <span style={s.fileIconBig}>📊</span>
            <span style={s.fileName}>{file.name}</span>
            <span style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div style={s.dropContent}>
            <span style={s.uploadIcon}>⬆️</span>
            <p style={s.dropText}>Drag & drop or <span style={s.browseLink}>browse</span></p>
            <p style={s.dropHint}>CSV · PDF · TXT · DOCX</p>
          </div>
        )}
      </label>

      {error && (
        <div style={s.errorBox}>
          <span>⚠️</span> {error}
        </div>
      )}

      <button style={{ ...s.btn, ...(file ? {} : s.btnDisabled) }} onClick={handleUpload} disabled={!file}>
        <span>🚀</span> Analyze &amp; Generate Report
      </button>
    </div>
  )
}

const s = {
  card:       { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  cardIcon:   { fontSize: 28, background: '#eff6ff', borderRadius: 10, padding: '8px 10px' },
  cardTitle:  { fontSize: 15, fontWeight: 700, color: '#0f172a' },
  cardSub:    { fontSize: 12, color: '#94a3b8', marginTop: 1 },

  dropzone: {
    display: 'block', border: '2px dashed #e2e8f0', borderRadius: 12,
    padding: 28, cursor: 'pointer', marginBottom: 16,
    background: '#fafafa', textAlign: 'center', transition: 'all 0.2s',
  },
  dragOver:     { borderColor: '#3b82f6', background: '#eff6ff' },
  dropzoneFilled: { borderColor: '#10b981', background: '#f0fdf4', borderStyle: 'solid' },

  dropContent: {},
  uploadIcon:  { fontSize: 32, display: 'block', marginBottom: 8 },
  dropText:    { fontSize: 14, color: '#475569', fontWeight: 500 },
  browseLink:  { color: '#3b82f6', fontWeight: 600 },
  dropHint:    { fontSize: 12, color: '#94a3b8', marginTop: 4 },

  fileInfo:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  fileIconBig: { fontSize: 36, display: 'block' },
  fileName:    { fontSize: 13, fontWeight: 600, color: '#0f172a' },
  fileSize:    { fontSize: 11, color: '#94a3b8' },

  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: 8, padding: '10px 14px',
    fontSize: 13, marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center',
  },

  btn: {
    width: '100%', background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '13px 20px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, transition: 'opacity 0.2s',
  },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
}
