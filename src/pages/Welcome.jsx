import { useNavigate } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import { Settings, LayoutDashboard, Sparkles } from 'lucide-react'

export default function Welcome() {
  const navigate = useNavigate()
  const { brand } = useBrand()

  return (
    <div className="welcome-page">
      <div className="welcome-bg-pattern" />
      <div className="welcome-card">
        <div className="welcome-logo">
          <span className="welcome-title">Fishtank Bubble</span>
          <Sparkles size={28} className="welcome-sparkle" />
        </div>
        <p className="welcome-subtitle">
          White-label dashboard generator. Scan any website and create a branded dashboard experience.
        </p>

        <div className="welcome-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/config')}>
            <Settings size={20} />
            Configure Brand
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/output')}
            disabled={!brand.configured}
          >
            <LayoutDashboard size={20} />
            View Dashboard
          </button>
        </div>

        {!brand.configured && (
          <p className="welcome-hint">Configure a brand first to view the dashboard</p>
        )}
        {brand.configured && (
          <p className="welcome-configured">
            Currently configured: <strong>{brand.name}</strong>
          </p>
        )}
      </div>
    </div>
  )
}
