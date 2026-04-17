import { useState, useEffect } from 'react'
import { useBrand } from '../../context/BrandContext'
import { MonitorDot, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

export default function SearchTab() {
  const { brand } = useBrand()
  const [embedUrl, setEmbedUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!brand.embedSecret) {
      setEmbedUrl(null)
      return
    }

    setLoading(true)
    setError('')

    // Build customTheme from brand colors
    const customTheme = {
      'dashboard-background': '#f8f9fa',
      'dashboard-key-color': brand.primaryColor,
      'dashboard-tile-border-color': `${brand.primaryColor}22`,
      'dashboard-control-outline-color': brand.primaryColor,
      'dashboard-tile-title-text-color': brand.secondaryColor,
    }

    // Build connectionRoles — specific connection or all connections (enables Dashboard Agent)
    let connectionRoles = undefined
    const role = brand.aiConnectionRole || 'RESTRICTED_QUERIER'
    if (brand.aiConnectionId) {
      connectionRoles = JSON.stringify({ [brand.aiConnectionId]: role })
    } else if (brand.allConnections?.length > 0) {
      const allRoles = {}
      brand.allConnections.forEach(c => { allRoles[c.id] = role })
      connectionRoles = JSON.stringify(allRoles)
    }

    fetch('/api/omni-embed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: brand.embedSecret,
        contentPath: brand.embedDashboardPath || '/dashboards/d33cc8c2',
        vanityDomain: brand.embedVanityDomain || '',
        customTheme: brand.embedThemeId ? undefined : customTheme,
        customThemeId: brand.embedThemeId || undefined,
        connectionRoles,
        linkAccess: '__omni_link_access_open',
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setEmbedUrl(data.url)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [brand.embedSecret, brand.embedDashboardPath, brand.embedVanityDomain])

  if (loading) {
    return (
      <div className="embed-placeholder">
        <Loader2 size={32} className="spin" style={{ color: brand.primaryColor }} />
        <p>Generating signed embed URL...</p>
      </div>
    )
  }

  if (!brand.embedSecret) {
    return (
      <div className="embed-placeholder">
        <div className="embed-placeholder-icon" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
          <MonitorDot size={48} />
        </div>
        <h3>Omni Dashboard Embed</h3>
        <p>To embed an Omni dashboard, add your <strong>Embed Secret</strong> in the Configuration page.</p>
        <div className="embed-placeholder-steps">
          <div className="embed-step">
            <span className="embed-step-num" style={{ background: brand.primaryColor, color: '#fff' }}>1</span>
            <span>In Omni, go to <strong>Settings → Embed → Admin</strong></span>
          </div>
          <div className="embed-step">
            <span className="embed-step-num" style={{ background: brand.primaryColor, color: '#fff' }}>2</span>
            <span>Click <strong>Add Secret</strong> and copy the key</span>
          </div>
          <div className="embed-step">
            <span className="embed-step-num" style={{ background: brand.primaryColor, color: '#fff' }}>3</span>
            <span>Paste the secret in the Config page under <strong>Omni Embed Settings</strong></span>
          </div>
        </div>
        <a
          href="https://docs.omni.co/embed/setup/standard-sso"
          target="_blank"
          rel="noopener noreferrer"
          className="embed-docs-link"
          style={{ color: brand.primaryColor }}
        >
          <ExternalLink size={14} /> Read Omni Embed Documentation
        </a>
      </div>
    )
  }

  if (error) {
    return (
      <div className="embed-placeholder">
        <AlertCircle size={48} style={{ color: '#dc2626' }} />
        <h3>Embed Error</h3>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="tab-embed">
      <iframe
        src={embedUrl}
        title={`${brand.name} Dashboard`}
        className="omni-embed-iframe"
        frameBorder="0"
        allow="clipboard-write"
        allowFullScreen
      />
    </div>
  )
}
