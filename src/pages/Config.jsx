import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import { generatePalette } from '../utils/colors'
import { ArrowLeft, Search, Loader2, CheckCircle2, ExternalLink, Palette, MonitorDot } from 'lucide-react'

export default function Config() {
  const navigate = useNavigate()
  const { brand, updateBrand } = useBrand()
  const [url, setUrl] = useState(brand.url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanned, setScanned] = useState(brand.configured)
  const [editData, setEditData] = useState(brand.configured ? { ...brand } : null)

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
      // Provide defaults on error so user can still configure manually
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

  const handleSave = () => {
    if (!editData) return
    updateBrand(editData)
    navigate('/output')
  }

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
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
                <div className="config-field">
                  <label>Vanity Domain (optional)</label>
                  <input
                    type="text"
                    value={editData.embedVanityDomain || ''}
                    onChange={e => updateField('embedVanityDomain', e.target.value)}
                    placeholder="e.g. trial.embed-omniapp.co"
                  />
                </div>
                <div className="config-field">
                  <label>Dashboard Path</label>
                  <input
                    type="text"
                    value={editData.embedDashboardPath || '/dashboards/d33cc8c2'}
                    onChange={e => updateField('embedDashboardPath', e.target.value)}
                    placeholder="/dashboards/abc123"
                  />
                </div>
                <div className="config-field full-width">
                  <label>Custom Theme ID (optional — from Omni Settings → Themes)</label>
                  <input
                    type="text"
                    value={editData.embedThemeId || ''}
                    onChange={e => updateField('embedThemeId', e.target.value)}
                    placeholder="e.g. abcdefgh-ijkl-mnop-qrst-123456789123"
                  />
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
                Omni requires a signed embed URL. Contact your Omni admin to enable embedding and generate a secret.
                Without a secret, the Dashboard tab will show a placeholder.
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
