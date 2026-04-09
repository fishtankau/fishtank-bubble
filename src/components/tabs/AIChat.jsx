import { useState, useEffect } from 'react'
import { useBrand } from '../../context/BrandContext'
import { MessageCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react'

export default function AIChat() {
  const { brand } = useBrand()
  const [embedUrl, setEmbedUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!brand.embedSecret || !brand.aiConnectionId) {
      setEmbedUrl(null)
      return
    }

    setLoading(true)
    setError('')

    const connectionRoles = {
      [brand.aiConnectionId]: brand.aiConnectionRole || 'RESTRICTED_QUERIER'
    }

    fetch('/api/omni-embed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: brand.embedSecret,
        contentPath: '/chat',
        vanityDomain: brand.embedVanityDomain || '',
        connectionRoles,
        mode: 'SINGLE_CONTENT',
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
        setEmbedUrl(data.url)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [brand.embedSecret, brand.embedVanityDomain, brand.aiConnectionId, brand.aiConnectionRole])

  if (loading) {
    return (
      <div className="embed-placeholder">
        <Loader2 size={32} className="spin" style={{ color: brand.primaryColor }} />
        <p>Loading AI Chat...</p>
      </div>
    )
  }

  if (!brand.embedSecret || !brand.aiConnectionId) {
    return (
      <div className="embed-placeholder">
        <div className="embed-placeholder-icon" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
          <MessageCircle size={48} />
        </div>
        <h3>Omni AI Chat</h3>
        <p>To embed the Omni AI agent, configure your <strong>Embed Secret</strong> and <strong>Connection ID</strong> in the Configuration page.</p>
        <div className="embed-placeholder-steps">
          <div className="embed-step">
            <span className="embed-step-num" style={{ background: brand.primaryColor, color: '#fff' }}>1</span>
            <span>Add your <strong>Embed Secret</strong> under Omni Embed Settings</span>
          </div>
          <div className="embed-step">
            <span className="embed-step-num" style={{ background: brand.primaryColor, color: '#fff' }}>2</span>
            <span>In Omni, go to <strong>Settings → Connections</strong> and copy the Connection ID</span>
          </div>
          <div className="embed-step">
            <span className="embed-step-num" style={{ background: brand.primaryColor, color: '#fff' }}>3</span>
            <span>Paste the Connection ID in the Config page under <strong>AI Chat Settings</strong></span>
          </div>
        </div>
        <a
          href="https://docs.omni.co/embed/customization/ai-chat"
          target="_blank"
          rel="noopener noreferrer"
          className="embed-docs-link"
          style={{ color: brand.primaryColor }}
        >
          <ExternalLink size={14} /> Read Omni AI Chat Documentation
        </a>
      </div>
    )
  }

  if (error) {
    return (
      <div className="embed-placeholder">
        <AlertCircle size={48} style={{ color: '#dc2626' }} />
        <h3>AI Chat Error</h3>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="tab-embed">
      <iframe
        src={embedUrl}
        title={`${brand.name} AI Chat`}
        className="omni-embed-iframe"
        frameBorder="0"
        allow="clipboard-write"
        allowFullScreen
      />
    </div>
  )
}
