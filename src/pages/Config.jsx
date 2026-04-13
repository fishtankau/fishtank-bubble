import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import { generatePalette } from '../utils/colors'
import {
  ArrowLeft, Search, Loader2, CheckCircle2, ExternalLink,
  Palette, MonitorDot, MessageCircle, Key, RefreshCw
} from 'lucide-react'

export default function Config() {
  const navigate = useNavigate()
  const { brand, updateBrand } = useBrand()
  const [url, setUrl] = useState(brand.url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanned, setScanned] = useState(brand.configured)
  const [editData, setEditData] = useState(brand.configured ? { ...brand } : null)

  // Omni API fetch state
  const [omniLoading, setOmniLoading] = useState(false)
  const [omniError, setOmniError] = useState('')
  const [dashboards, setDashboards] = useState([])
  const [connections, setConnections] = useState([])
  const [omniFetched, setOmniFetched] = useState(false)

  const handleScan = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setScanned(false)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scrape failed')

      setEditData(data)
      setScanned(true)
    } catch (err) {
      setError(err.message)
      setEditData({
        name: 'My Brand',
        url: url.trim(),
        logo: '',
        primaryColor: '#2563eb',
        secondaryColor: '#1e293b',
        description: '',
        keyMessages: [],
        products: [],
      })
      setScanned(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchOmniData = useCallback(async () => {
    const apiKey = editData?.omniApiKey
    const vanityDomain = editData?.embedVanityDomain
    if (!apiKey) {
      setOmniError('Enter an Omni API key first')
      return
    }

    setOmniLoading(true)
    setOmniError('')
    setDashboards([])
    setConnections([])

    try {
      const [dashRes, connRes] = await Promise.all([
        fetch('/api/omni-dashboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, vanityDomain })
        }),
        fetch('/api/omni-connections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, vanityDomain })
        })
      ])

      const dashData = await dashRes.json()
      const connData = await connRes.json()

      if (!dashRes.ok) throw new Error(dashData.error || 'Failed to fetch dashboards')
      if (!connRes.ok) throw new Error(connData.error || 'Failed to fetch connections')

      // Extract dashboard items from content response
      const contentItems = dashData.records || dashData.content || dashData || []
      const dashList = (Array.isArray(contentItems) ? contentItems : [])
        .filter(item => item.type === 'document' || item.contentPath?.startsWith('/dashboards') || item.contentPath?.startsWith('/workbooks'))
        .map(item => ({
          id: item.id || item.identifier,
          name: item.name || item.title || item.id,
          contentPath: item.contentPath || `/dashboards/${item.identifier || item.id}`,
        }))

      // Extract connections
      const connList = (connData.connections || connData.records || connData || [])
        .map(conn => ({
          id: conn.id,
          name: conn.name || conn.id,
          dialect: conn.dialect || '',
          database: conn.database || '',
        }))

      setDashboards(dashList)
      setConnections(connList)
      setOmniFetched(true)

      // Auto-select first dashboard if none selected
      if (dashList.length > 0 && !editData.embedDashboardPath) {
        updateField('embedDashboardPath', dashList[0].contentPath)
      }
    } catch (err) {
      setOmniError(err.message)
    } finally {
      setOmniLoading(false)
    }
  }, [editData?.omniApiKey, editData?.embedVanityDomain])

  const handleSave = () => {
    if (!editData) return
    updateBrand(editData)
    navigate('/output')
  }

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleDashboardSelect = (contentPath) => {
    updateField('embedDashboardPath', contentPath)
  }

  const handleConnectionSelect = (connId) => {
    updateField('aiConnectionId', connId)
  }

  const palette = editData ? generatePalette(editData.primaryColor) : null

  return (
    <div className="config-page">
      <div className="config-header">
        <button className="btn-icon" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1>Brand Configuration</h1>
      </div>

      <div className="config-content">
        <div className="config-scan-section">
          <label className="config-label">Website URL</label>
          <div className="config-input-row">
            <input
              type="text"
              className="config-input"
              placeholder="e.g. nike.com, apple.com, stripe.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
            />
            <button className="btn btn-primary" onClick={handleScan} disabled={loading || !url.trim()}>
              {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
              {loading ? 'Scanning...' : 'Scan'}
            </button>
          </div>
          {error && <p className="config-error">{error} — you can edit the defaults below.</p>}
        </div>

        {scanned && editData && (
          <div className="config-results">
            <div className="config-section">
              <h3><CheckCircle2 size={18} /> Brand Identity</h3>
              <div className="config-grid">
                <div className="config-field">
                  <label>Brand Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => updateField('name', e.target.value)}
                  />
                </div>
                <div className="config-field">
                  <label>Scraped Logo (auto-detected)</label>
                  <div className="config-logo-row">
                    <input
                      type="text"
                      value={editData.logo}
                      onChange={e => updateField('logo', e.target.value)}
                      placeholder="Auto-detected from site"
                    />
                    {editData.logo && (
                      <img
                        src={editData.logo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(editData.logo)}` : editData.logo}
                        alt="Logo"
                        className="config-logo-preview"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                </div>
                <div className="config-field full-width">
                  <label>Logo URL (used in login & dashboard — paste your own logo URL here)</label>
                  <div className="config-logo-row">
                    <input
                      type="text"
                      value={editData.logoUrl || ''}
                      onChange={e => updateField('logoUrl', e.target.value)}
                      placeholder="e.g. https://example.com/logo.png"
                    />
                    {editData.logoUrl && (
                      <img
                        src={editData.logoUrl.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(editData.logoUrl)}` : editData.logoUrl}
                        alt="Custom Logo"
                        className="config-logo-preview"
                        style={{ height: 40, width: 'auto', maxWidth: 120 }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                </div>
                <div className="config-field full-width">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    value={editData.description}
                    onChange={e => updateField('description', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="config-section">
              <h3><Palette size={18} /> Theme Colors</h3>
              <div className="config-color-row">
                <div className="config-color-field">
                  <label>Primary Color</label>
                  <div className="config-color-input">
                    <input
                      type="color"
                      value={editData.primaryColor}
                      onChange={e => updateField('primaryColor', e.target.value)}
                    />
                    <input
                      type="text"
                      value={editData.primaryColor}
                      onChange={e => updateField('primaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div className="config-color-field">
                  <label>Secondary Color</label>
                  <div className="config-color-input">
                    <input
                      type="color"
                      value={editData.secondaryColor}
                      onChange={e => updateField('secondaryColor', e.target.value)}
                    />
                    <input
                      type="text"
                      value={editData.secondaryColor}
                      onChange={e => updateField('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
                {palette && (
                  <div className="config-palette-preview">
                    <label>Generated Palette</label>
                    <div className="palette-swatches">
                      {Object.entries(palette).map(([key, color]) => (
                        <div key={key} className="swatch" style={{ background: color }} title={`${key}: ${color}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {editData.keyMessages?.length > 0 && (
              <div className="config-section">
                <h3>Key Messages Found</h3>
                <ul className="config-messages">
                  {editData.keyMessages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Omni API Key + Fetch */}
            <div className="config-section">
              <h3><Key size={18} /> Omni API Key</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.6 }}>
                Enter your Omni organization API key or personal access token to auto-populate dashboards and connections below.
              </p>
              <div className="config-grid">
                <div className="config-field full-width">
                  <label>API Key (from Omni Settings → API Keys)</label>
                  <div className="config-input-row">
                    <input
                      type="password"
                      value={editData.omniApiKey || ''}
                      onChange={e => updateField('omniApiKey', e.target.value)}
                      placeholder="Enter your Omni API key"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={fetchOmniData}
                      disabled={omniLoading || !editData.omniApiKey}
                    >
                      {omniLoading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
                      {omniLoading ? 'Fetching...' : 'Fetch'}
                    </button>
                  </div>
                </div>
                <div className="config-field">
                  <label>Vanity Domain (optional)</label>
                  <input
                    type="text"
                    value={editData.embedVanityDomain || ''}
                    onChange={e => updateField('embedVanityDomain', e.target.value)}
                    placeholder="e.g. trial.embed-omniapp.co"
                  />
                </div>
              </div>
              {omniError && <p className="config-error" style={{ marginTop: 8 }}>{omniError}</p>}
              {omniFetched && !omniError && (
                <p style={{ fontSize: 12, color: '#10b981', marginTop: 8, fontWeight: 600 }}>
                  <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  Found {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} and {connections.length} connection{connections.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="config-section">
              <h3><MonitorDot size={18} /> Omni Embed Settings</h3>
              <div className="config-grid">
                <div className="config-field full-width">
                  <label>Embed Secret (from Omni Settings → Embed → Admin)</label>
                  <input
                    type="password"
                    value={editData.embedSecret || ''}
                    onChange={e => updateField('embedSecret', e.target.value)}
                    placeholder="32-character embed secret"
                  />
                </div>
                <div className="config-field full-width">
                  <label>Dashboard Path</label>
                  {dashboards.length > 0 ? (
                    <select
                      value={editData.embedDashboardPath || ''}
                      onChange={e => handleDashboardSelect(e.target.value)}
                      className="config-select"
                    >
                      <option value="">Select a dashboard...</option>
                      {dashboards.map(d => (
                        <option key={d.id} value={d.contentPath}>
                          {d.name} ({d.contentPath})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editData.embedDashboardPath || '/dashboards/d33cc8c2'}
                      onChange={e => updateField('embedDashboardPath', e.target.value)}
                      placeholder="/dashboards/abc123"
                    />
                  )}
                </div>
                <div className="config-field full-width">
                  <label>Custom Theme ID (optional)</label>
                  <div className="config-input-row">
                    <input
                      type="text"
                      value={editData.embedThemeId || ''}
                      onChange={e => updateField('embedThemeId', e.target.value)}
                      placeholder="Paste theme ID from Omni"
                      style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                    />
                    {editData.embedDashboardPath && (
                      <a
                        href={`https://${editData.embedVanityDomain || 'trial.omniapp.co'}${editData.embedDashboardPath}/themes`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} /> Open Themes
                      </a>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
                    Omni doesn't expose themes via API. Click "Open Themes" → select a theme → copy the ID from the URL.
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
                Omni requires a signed embed URL. Contact your Omni admin to enable embedding and generate a secret.
                Without a secret, the Dashboard tab will show a placeholder.
              </p>
            </div>

            <div className="config-section">
              <h3><MessageCircle size={18} /> AI Chat Settings</h3>
              <div className="config-grid">
                <div className="config-field full-width">
                  <label>Connection ID</label>
                  {connections.length > 0 ? (
                    <select
                      value={editData.aiConnectionId || ''}
                      onChange={e => handleConnectionSelect(e.target.value)}
                      className="config-select"
                    >
                      <option value="">Select a connection...</option>
                      {connections.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}{c.dialect ? ` (${c.dialect})` : ''}{c.database ? ` — ${c.database}` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editData.aiConnectionId || ''}
                      onChange={e => updateField('aiConnectionId', e.target.value)}
                      placeholder="e.g. c0f12353-4817-4398-bcc0-d501e6dd2f64"
                    />
                  )}
                </div>
                <div className="config-field full-width">
                  <label>Connection Role</label>
                  <select
                    value={editData.aiConnectionRole || 'RESTRICTED_QUERIER'}
                    onChange={e => updateField('aiConnectionRole', e.target.value)}
                    className="config-select"
                  >
                    <option value="RESTRICTED_QUERIER">RESTRICTED_QUERIER (recommended)</option>
                    <option value="QUERIER">QUERIER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
                The AI Chat tab embeds Omni's AI agent. It requires an Embed Secret (above) and a Connection ID to query data.
              </p>
            </div>

            {editData.products?.length > 0 && (
              <div className="config-section">
                <h3>Products / Services Found ({editData.products.length})</h3>
                <div className="config-products">
                  {editData.products.map((p, i) => (
                    <div key={i} className="config-product-card">
                      {p.image && (
                        <img
                          src={`/api/proxy-image?url=${encodeURIComponent(p.image)}`}
                          alt={p.name}
                          onError={e => { e.target.style.display = 'none' }}
                        />
                      )}
                      <strong>{p.name}</strong>
                      {p.description && <p>{p.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="config-actions">
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleSave}>
                Save & Launch Dashboard
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
