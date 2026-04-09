import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import Sidebar from './Sidebar'
import Overview from './tabs/Overview'
import Analytics from './tabs/Analytics'
import SearchTab from './tabs/Search'
import { Sun, Moon, LogOut, Settings } from 'lucide-react'

const tabComponents = {
  overview: Overview,
  analytics: Analytics,
  search: SearchTab,
}

const tabTitles = {
  overview: 'Overview',
  analytics: 'Analytics',
  search: 'Dashboard',
}

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [darkMode, setDarkMode] = useState(false)
  const { brand } = useBrand()
  const navigate = useNavigate()

  const ActiveComponent = tabComponents[activeTab]

  return (
    <div className={`dashboard ${darkMode ? 'dark' : ''}`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1 className="dashboard-title">{tabTitles[activeTab]}</h1>
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

        <div className="dashboard-content">
          <ActiveComponent />
        </div>
      </main>
    </div>
  )
}
