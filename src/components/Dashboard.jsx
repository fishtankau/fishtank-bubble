import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import Overview from './tabs/Overview'
import AIChat from './tabs/AIChat'
import SearchTab from './tabs/Search'
import { Sun, Moon, LogOut, Settings, LayoutDashboard, MessageCircle, MonitorDot, Sparkles } from 'lucide-react'
import { getContrastColor } from '../utils/colors'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'aichat', label: 'AI Chat', icon: MessageCircle },
  { id: 'search', label: 'Dashboard', icon: MonitorDot },
]

const tabComponents = {
  overview: Overview,
  aichat: AIChat,
  search: SearchTab,
}

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [darkMode, setDarkMode] = useState(false)
  const { brand } = useBrand()
  const navigate = useNavigate()

  const ActiveComponent = tabComponents[activeTab]
  const activeBtnText = getContrastColor(brand.primaryColor)

  const rawLogo = brand.logoUrl || brand.logo
  const logoSrc = rawLogo
    ? (rawLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(rawLogo)}` : rawLogo)
    : null

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="dashboard-brand">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={brand.name}
                className="dashboard-brand-logo"
                onError={e => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="dashboard-brand-text" style={logoSrc ? { display: 'none' } : {}}>
              <Sparkles size={16} style={{ color: brand.primaryColor }} />
              <span>{brand.name}</span>
            </div>
          </div>
          <nav className="dashboard-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className={`dashboard-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={isActive ? {
                    background: brand.primaryColor,
                    color: activeBtnText,
                  } : {}}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        <div className="dashboard-header-actions">
          <button
            className="btn-icon"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-icon" onClick={onLogout} title="Logout">
            <LogOut size={20} />
          </button>
          <button
            className="dashboard-avatar"
            style={{ borderColor: brand.primaryColor, cursor: 'pointer' }}
            onClick={() => navigate('/config')}
            title="Back to Configuration"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}
