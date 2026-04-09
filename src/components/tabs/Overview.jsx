import { useBrand } from '../../context/BrandContext'
import { generatePalette, getContrastColor } from '../../utils/colors'
import {
  ExternalLink, ArrowRight, Sparkles, Star, Zap, Gem,
  Heart, Shield, Users, Target, Award, Lightbulb,
  Building2, Globe, TrendingUp, ChevronRight
} from 'lucide-react'

function FloatingSparkle({ style, size = 16, delay = 0, color }) {
  return (
    <div className="floating-sparkle" style={{ ...style, animationDelay: `${delay}s` }}>
      <Sparkles size={size} style={{ color }} />
    </div>
  )
}

const valueIcons = [Heart, Shield, Users, Target, Award, Lightbulb]

export default function Overview() {
  const { brand } = useBrand()
  const palette = generatePalette(brand.primaryColor)
  const heroBtnText = getContrastColor(brand.primaryColor)

  const rawLogo = brand.logoUrl || brand.logo
  const logoSrc = rawLogo
    ? (rawLogo.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(rawLogo)}` : rawLogo)
    : null

  const hasMessages = brand.keyMessages?.length > 0
  const hasProducts = brand.products?.length > 0

  return (
    <div className="tab-homepage">
      {/* Hero Banner */}
      <div className="homepage-hero" style={{ background: `linear-gradient(135deg, ${brand.secondaryColor}, ${palette.primaryDark})` }}>
        <div className="sparkle-field">
          <FloatingSparkle style={{ top: '10%', left: '8%' }} size={14} delay={0} color={brand.primaryColor} />
          <FloatingSparkle style={{ top: '20%', right: '12%' }} size={20} delay={0.8} color={palette.primaryLight} />
          <FloatingSparkle style={{ bottom: '25%', left: '15%' }} size={12} delay={1.6} color={brand.primaryColor} />
          <FloatingSparkle style={{ top: '15%', left: '40%' }} size={16} delay={2.2} color={palette.primaryLight} />
          <FloatingSparkle style={{ bottom: '15%', right: '8%' }} size={18} delay={0.4} color={brand.primaryColor} />
          <FloatingSparkle style={{ top: '50%', left: '5%' }} size={10} delay={3.0} color={palette.primaryMuted} />
          <FloatingSparkle style={{ bottom: '35%', right: '25%' }} size={14} delay={1.2} color={palette.primaryLight} />
          <FloatingSparkle style={{ top: '35%', right: '5%' }} size={11} delay={2.6} color={brand.primaryColor} />
        </div>

        <div className="homepage-hero-content">
          {logoSrc && (
            <img
              src={logoSrc}
              alt={brand.name}
              className="homepage-hero-logo"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          <div className="hero-badge" style={{ background: `${brand.primaryColor}22`, color: brand.primaryColor }}>
            <Sparkles size={14} /> About {brand.name}
          </div>
          <h1 className="homepage-hero-title" style={{ color: '#fff' }}>
            {brand.keyMessages?.[0] || brand.name}
          </h1>
          <p className="homepage-hero-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {brand.description || `Welcome to ${brand.name}`}
          </p>
          <div className="homepage-hero-actions">
            <a
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="homepage-hero-btn"
              style={{ background: brand.primaryColor, color: heroBtnText }}
            >
              <Zap size={16} /> Visit Site <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className="hero-orb hero-orb-1" style={{ background: brand.primaryColor }} />
        <div className="hero-orb hero-orb-2" style={{ background: palette.primaryLight }} />
        <div className="hero-orb hero-orb-3" style={{ background: brand.primaryColor }} />
      </div>

      {/* About Section */}
      <div className="homepage-about">
        <div className="about-content">
          <div className="about-text">
            <div className="section-eyebrow" style={{ color: brand.primaryColor }}>
              <Building2 size={16} /> Who We Are
            </div>
            <h2 className="homepage-section-title">About {brand.name}</h2>
            <p className="about-description">
              {brand.description || `${brand.name} is a leading organization committed to delivering exceptional value and innovative solutions to customers worldwide.`}
            </p>
            {brand.url && (
              <a href={brand.url} target="_blank" rel="noopener noreferrer" className="about-link" style={{ color: brand.primaryColor }}>
                Learn more about us <ChevronRight size={16} />
              </a>
            )}
          </div>
          <div className="about-visual" style={{ background: `linear-gradient(135deg, ${palette.primarySoft}, ${brand.primaryColor}15)` }}>
            {logoSrc ? (
              <img src={logoSrc} alt={brand.name} className="about-logo-img" onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <div className="about-logo-placeholder" style={{ color: brand.primaryColor }}>
                <Building2 size={48} />
                <span>{brand.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Our Strategy / Mission */}
      {hasMessages && (
        <div className="homepage-strategy" style={{ background: brand.secondaryColor }}>
          <div className="strategy-content">
            <div className="strategy-text">
              <div className="section-eyebrow" style={{ color: brand.primaryColor }}>
                <Target size={16} /> Our Strategy
              </div>
              <h2 className="homepage-section-title" style={{ color: '#fff' }}>
                {brand.keyMessages?.[1] || 'Our Mission & Vision'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.7 }}>
                {brand.description || `At ${brand.name}, we are committed to driving innovation and delivering value through our products and services.`}
              </p>
              <a href={brand.url} target="_blank" rel="noopener noreferrer"
                className="strategy-btn"
                style={{ background: brand.primaryColor, color: heroBtnText }}>
                Learn More <ArrowRight size={16} />
              </a>
            </div>
            <div className="strategy-visual">
              <div className="strategy-circle" style={{ borderColor: brand.primaryColor }}>
                <div className="strategy-circle-inner" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${palette.primaryDark})` }}>
                  <Globe size={36} style={{ color: '#fff' }} />
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
                    {brand.keyMessages?.[2]?.split(' ').slice(0, 4).join(' ') || brand.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Our Values */}
      {hasMessages && brand.keyMessages.length > 1 && (
        <div className="homepage-values">
          <div className="section-eyebrow center" style={{ color: brand.primaryColor }}>
            <Sparkles size={16} /> Our Values
          </div>
          <h2 className="homepage-section-title center">What We Stand For</h2>
          <div className="values-grid">
            {brand.keyMessages.slice(1, 5).map((msg, i) => {
              const Icon = valueIcons[i % valueIcons.length]
              return (
                <div key={i} className="value-card">
                  <div className="value-icon-wrap" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="value-title">{msg.split(/[.!,–—]/).filter(Boolean)[0]?.trim().split(' ').slice(0, 5).join(' ') || msg}</h3>
                  <p className="value-desc">{msg}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Products & Services (styled like "Our Brands") */}
      {hasProducts && (
        <div className="homepage-products-section">
          <div className="section-eyebrow center" style={{ color: brand.primaryColor }}>
            <TrendingUp size={16} /> Our Brands
          </div>
          <h2 className="homepage-section-title center">Products & Services</h2>
          <div className="homepage-products-grid">
            {brand.products.map((p, i) => (
              <div key={i} className="homepage-product-card" style={{ '--card-accent': brand.primaryColor }}>
                {p.image && (
                  <div className="homepage-product-img">
                    <img
                      src={`/api/proxy-image?url=${encodeURIComponent(p.image)}`}
                      alt={p.name}
                      onError={e => { e.target.parentElement.style.display = 'none' }}
                    />
                  </div>
                )}
                <div className="homepage-product-info">
                  <h3>{p.name}</h3>
                  {p.description && <p>{p.description}</p>}
                  <span className="homepage-product-link" style={{ color: brand.primaryColor }}>
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats / Highlights Bar */}
      <div className="homepage-stats" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${palette.primaryDark})` }}>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#fff' }}>500+</span>
            <span className="stat-label">Team Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#fff' }}>50M+</span>
            <span className="stat-label">Customers Served</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#fff' }}>25+</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#fff' }}>99.9%</span>
            <span className="stat-label">Uptime</span>
          </div>
        </div>
      </div>

      {/* Life at Brand */}
      <div className="homepage-life">
        <div className="section-eyebrow center" style={{ color: brand.primaryColor }}>
          <Star size={16} /> Life at {brand.name}
        </div>
        <h2 className="homepage-section-title center">Join Our Team</h2>
        <div className="life-grid">
          <div className="life-card">
            <div className="life-card-icon" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
              <Heart size={24} />
            </div>
            <h3>Diversity & Inclusion</h3>
            <p>We celebrate differences and foster an inclusive environment where everyone can thrive.</p>
          </div>
          <div className="life-card">
            <div className="life-card-icon" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
              <Award size={24} />
            </div>
            <h3>Rewards & Benefits</h3>
            <p>Competitive compensation, flexible working, and comprehensive benefits for all team members.</p>
          </div>
          <div className="life-card">
            <div className="life-card-icon" style={{ background: `${brand.primaryColor}15`, color: brand.primaryColor }}>
              <Globe size={24} />
            </div>
            <h3>Community</h3>
            <p>Making a positive impact through community partnerships and sustainability initiatives.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="homepage-footer" style={{ background: brand.secondaryColor }}>
        <Sparkles size={14} style={{ color: brand.primaryColor, opacity: 0.7 }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          Powered by Fishtank Bubble
        </span>
        <Sparkles size={14} style={{ color: brand.primaryColor, opacity: 0.7 }} />
      </div>
    </div>
  )
}
