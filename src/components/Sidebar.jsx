import { useBrand } from '../context/BrandContext'
import { generatePalette, getContrastColor } from '../utils/colors'
import {
  LayoutDashboard, BarChart3, MonitorDot,
  Sparkles
} from 'lucide-react'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'search', label: 'Dashboard', icon: MonitorDot },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const { brand } = useBrand()
  const palette = generatePalette(brand.primaryColor)
  const activeBtnText = getContrastColor(brand.primaryColor)

  const rawLogo = brand.logoUrl || brand.logo
  const logoSrc = rawLogo
    ? (rawLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(rawLogo)}` : rawLogo)
    : null

  return (
    <aside className="sidebar" style={{ '--brand-primary': brand.primaryColor }}>
      <div className="sidebar-brand">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={brand.name}
            className="sidebar-logo-img"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className="sidebar-brand-text" style={logoSrc ? { display: 'none' } : {}}>
          <Sparkles size={18} style={{ color: brand.primaryColor }} />
          <span>{brand.name}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              className={`sidebar-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              style={isActive ? {
                background: brand.primaryColor,
                color: activeBtnText,
              } : {}}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
