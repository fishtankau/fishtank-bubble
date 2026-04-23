import { useState, useEffect, useCallback, useRef } from 'react'
import { useBrand } from '../../context/BrandContext'
import { Plane, MapPin, Briefcase, AlertCircle, Loader2, ExternalLink, Search, X } from 'lucide-react'

const AIRPORT_FILTER_ID = 'lG4Gn7nz'
const CARRIER_FILTER_ID = 'v6fXfL0c'
const DASHBOARD_PATH = '/dashboards/645cf6e2'
const MODEL_ID = '5662aa63-3e2e-4ec5-b678-5cc274e45980'
const TOPIC = 'demo__airline_delay_cause'

export default function Flights() {
  const { brand, currentUser } = useBrand()
  const [embedUrl, setEmbedUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAirports, setSelectedAirports] = useState([]) // array for multi-select
  const [selectedCarriers, setSelectedCarriers] = useState([])
  const [airports, setAirports] = useState([])
  const [carriers, setCarriers] = useState([])
  const [airportSearch, setAirportSearch] = useState('')
  const [carrierSearch, setCarrierSearch] = useState('')
  const [iframeReady, setIframeReady] = useState(false)
  const iframeRef = useRef(null)
  const embedOriginRef = useRef(null)

  // Fetch distinct airports and carriers from Omni, scoped to the
  // logged-in user's region so the filter panel only shows relevant values.
  useEffect(() => {
    if (!brand.omniApiKey) return

    // Build a region filter matching the access filter on the topic.
    // `all` users (admin) see every value; everyone else is scoped.
    // The query/run API wants the full filter object (not the {is: ...}
    // shorthand which only works in some contexts).
    const region = currentUser?.region
    const regionFilter = (region && region !== 'all')
      ? {
          [`${TOPIC}.airport_region`]: {
            kind: 'EQUALS',
            values: [region],
            is_negative: false,
            is_inclusive: false,
            type: 'string',
          }
        }
      : undefined

    const fetchValues = async (field, setter) => {
      try {
        const res = await fetch('/api/omni-query-distinct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: brand.omniApiKey,
            vanityDomain: brand.embedVanityDomain || 'trial.omniapp.co',
            modelId: MODEL_ID,
            table: TOPIC,
            field,
            limit: 500,
            filters: regionFilter,
          })
        })
        const data = await res.json()
        if (data.error) {
          console.error('[Flights] distinct query error:', field, data.error)
          setter([])
          return
        }
        if (data.values) setter(data.values)
      } catch (err) {
        console.error('[Flights] fetch values failed:', field, err)
        setter([])
      }
    }

    fetchValues(`${TOPIC}.airport`, setAirports)
    fetchValues(`${TOPIC}.carrier_name`, setCarriers)
  }, [brand.omniApiKey, brand.embedVanityDomain, currentUser?.region])

  // Parse origin from embed URL for postMessage
  useEffect(() => {
    if (embedUrl) {
      try {
        embedOriginRef.current = new URL(embedUrl).origin
      } catch {
        embedOriginRef.current = null
      }
    }
  }, [embedUrl])

  // Listen to messages from the iframe
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.source !== 'omni') return
      const name = event.data?.name
      const payload = event.data?.payload
      if (name === 'status' && payload?.status === 'done') {
        setIframeReady(true)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Fetch embed URL
  const fetchEmbedUrl = useCallback(() => {
    if (!brand.embedSecret) {
      setEmbedUrl(null)
      return
    }

    setLoading(true)
    setError('')
    setIframeReady(false)

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
        contentPath: DASHBOARD_PATH,
        vanityDomain: brand.embedVanityDomain || '',
        connectionRoles,
        linkAccess: '__omni_link_access_open',
        externalId: currentUser?.externalId,
        name: currentUser?.name,
        email: currentUser?.email,
        userAttributes: currentUser?.userAttributes,
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error))
        setEmbedUrl(data.url)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [brand, currentUser])

  useEffect(() => {
    fetchEmbedUrl()
  }, [brand.embedSecret, brand.embedVanityDomain, currentUser?.externalId])

  // Send filter update to Omni iframe
  const sendFilterUpdate = useCallback((airportList, carrierList) => {
    const iframe = iframeRef.current
    const origin = embedOriginRef.current
    if (!iframe?.contentWindow || !origin) return

    const parts = []

    const airportObj = airportList.length > 0
      ? { is_inclusive: false, is_negative: false, kind: 'EQUALS', type: 'string', values: airportList, appliedLabels: {} }
      : { values: [] }
    parts.push(`f--${AIRPORT_FILTER_ID}=${encodeURIComponent(JSON.stringify(airportObj))}`)

    const carrierObj = carrierList.length > 0
      ? { is_inclusive: false, is_negative: false, kind: 'EQUALS', type: 'string', values: carrierList, appliedLabels: {} }
      : { values: [] }
    parts.push(`f--${CARRIER_FILTER_ID}=${encodeURIComponent(JSON.stringify(carrierObj))}`)

    const filterUrlParameter = parts.join('&')
    console.log('[Flights → Omni]', decodeURIComponent(filterUrlParameter))

    iframe.contentWindow.postMessage(
      { name: 'dashboard:filter-change-by-url-parameter', payload: { filterUrlParameter } },
      origin
    )
  }, [])

  const toggleAirport = (code) => {
    const next = selectedAirports.includes(code)
      ? selectedAirports.filter(a => a !== code)
      : [...selectedAirports, code]
    setSelectedAirports(next)
    sendFilterUpdate(next, selectedCarriers)
  }

  const toggleCarrier = (name) => {
    const next = selectedCarriers.includes(name)
      ? selectedCarriers.filter(c => c !== name)
      : [...selectedCarriers, name]
    setSelectedCarriers(next)
    sendFilterUpdate(selectedAirports, next)
  }

  const clearAirports = () => {
    setSelectedAirports([])
    sendFilterUpdate([], selectedCarriers)
  }

  const clearCarriers = () => {
    setSelectedCarriers([])
    sendFilterUpdate(selectedAirports, [])
  }

  const handleClearAll = () => {
    setSelectedAirports([])
    setSelectedCarriers([])
    sendFilterUpdate([], [])
  }

  // Filter lists based on search input
  const filteredAirports = airportSearch
    ? airports.filter(a => a.toLowerCase().includes(airportSearch.toLowerCase()))
    : airports
  const filteredCarriers = carrierSearch
    ? carriers.filter(c => c.toLowerCase().includes(carrierSearch.toLowerCase()))
    : carriers

  if (!brand.embedSecret) {
    return (
      <div className="embed-placeholder">
        <div className="embed-placeholder-icon" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
          <Plane size={48} />
        </div>
        <h3>Flight Delay Dashboard</h3>
        <p>To embed this dashboard, add your <strong>Embed Secret</strong> in the Configuration page.</p>
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

  if (error && !embedUrl) {
    return (
      <div className="embed-placeholder">
        <AlertCircle size={48} style={{ color: '#dc2626' }} />
        <h3>Embed Error</h3>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="flights-tab">
      <div className="flights-filter-panel">
        <div className="flights-filter-section">
          <div className="flights-filter-header">
            <span className="flights-filter-label">
              <MapPin size={14} /> Airport {selectedAirports.length > 0 && <span className="flights-count-badge">{selectedAirports.length}</span>}
            </span>
            {selectedAirports.length > 0 && (
              <button className="flights-mini-clear" onClick={clearAirports} title="Clear airports">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="flights-search-wrap">
            <Search size={12} className="flights-search-icon" />
            <input
              type="text"
              className="flights-search-input"
              placeholder={`Search ${airports.length} airports...`}
              value={airportSearch}
              onChange={e => setAirportSearch(e.target.value)}
            />
          </div>
          <div className="flights-chip-list">
            {filteredAirports.slice(0, 300).map(code => {
              const active = selectedAirports.includes(code)
              return (
                <button
                  key={code}
                  className={`flights-chip ${active ? 'active' : ''}`}
                  style={active ? { background: brand.primaryColor, color: '#fff', borderColor: brand.primaryColor } : {}}
                  onClick={() => toggleAirport(code)}
                  disabled={!iframeReady}
                >
                  {code}
                </button>
              )
            })}
            {airports.length === 0 && <span className="flights-loading-text">Loading airports…</span>}
          </div>
        </div>

        <div className="flights-filter-section">
          <div className="flights-filter-header">
            <span className="flights-filter-label">
              <Briefcase size={14} /> Carrier {selectedCarriers.length > 0 && <span className="flights-count-badge">{selectedCarriers.length}</span>}
            </span>
            {selectedCarriers.length > 0 && (
              <button className="flights-mini-clear" onClick={clearCarriers} title="Clear carriers">
                <X size={12} />
              </button>
            )}
          </div>
          <div className="flights-search-wrap">
            <Search size={12} className="flights-search-icon" />
            <input
              type="text"
              className="flights-search-input"
              placeholder={`Search ${carriers.length} carriers...`}
              value={carrierSearch}
              onChange={e => setCarrierSearch(e.target.value)}
            />
          </div>
          <div className="flights-chip-list">
            {filteredCarriers.map(name => {
              const active = selectedCarriers.includes(name)
              return (
                <button
                  key={name}
                  className={`flights-chip flights-chip-wide ${active ? 'active' : ''}`}
                  style={active ? { background: brand.primaryColor, color: '#fff', borderColor: brand.primaryColor } : {}}
                  onClick={() => toggleCarrier(name)}
                  disabled={!iframeReady}
                >
                  {name}
                </button>
              )
            })}
            {carriers.length === 0 && <span className="flights-loading-text">Loading carriers…</span>}
          </div>
        </div>

        {(selectedAirports.length > 0 || selectedCarriers.length > 0) && (
          <button className="flights-clear-all-btn" onClick={handleClearAll}>
            <X size={12} /> Clear All Filters
          </button>
        )}
      </div>
      <div className="flights-embed-area">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={`${brand.name} Flights Dashboard`}
            className="omni-embed-iframe"
            frameBorder="0"
            allow="clipboard-write"
            allowFullScreen
          />
        ) : (
          <div className="embed-placeholder">
            <Loader2 size={32} className="spin" style={{ color: brand.primaryColor }} />
            <p>Loading Flights Dashboard...</p>
          </div>
        )}
      </div>
    </div>
  )
}
