import { useState } from 'react'
import { useBrand } from '../context/BrandContext'
import { generatePalette, getContrastColor } from '../utils/colors'
import { Sparkles } from 'lucide-react'

export default function Login({ onLogin }) {
  const { brand } = useBrand()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [logoFailed, setLogoFailed] = useState(false)
  const palette = generatePalette(brand.primaryColor)
  const btnText = getContrastColor(brand.primaryColor)

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin()
  }

  const rawLogo = brand.logoUrl || brand.logo
  const logoSrc = rawLogo
    ? (rawLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(rawLogo)}` : rawLogo)
    : null

  // Show text brand if no logo or logo failed to load
  const showTextBrand = !logoSrc || logoFailed

  return (
    <div className="login-page" style={{ '--brand-primary': brand.primaryColor, '--brand-secondary': brand.secondaryColor }}>
      {/* Background Pattern */}
      <svg className="login-bg-pattern" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="arcs" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0 200 Q100 100 200 200" fill="none" stroke={brand.secondaryColor} strokeWidth="1" opacity="0.08" />
            <path d="M-100 200 Q0 100 100 200" fill="none" stroke={brand.secondaryColor} strokeWidth="1" opacity="0.08" />
            <path d="M100 200 Q200 100 300 200" fill="none" stroke={brand.secondaryColor} strokeWidth="1" opacity="0.08" />
            <path d="M0 0 Q100 100 200 0" fill="none" stroke={brand.secondaryColor} strokeWidth="1" opacity="0.05" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arcs)" />
      </svg>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          {logoSrc && !logoFailed && (
            <img
              src={logoSrc}
              alt={brand.name}
              className="login-logo-img"
              onError={() => setLogoFailed(true)}
            />
          )}
          {showTextBrand && (
            <div className="login-brand-text">
              <span className="login-brand-name">{brand.name}</span>
              <Sparkles
                size={24}
                style={{ color: brand.primaryColor, marginLeft: 4, marginTop: -8 }}
              />
            </div>
          )}
        </div>

        <div className="login-field">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="login-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="login-btn"
          style={{ background: brand.primaryColor, color: btnText }}
        >
          Login
        </button>
      </form>
    </div>
  )
}
