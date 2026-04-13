/**
 * Generate 3 distinct Omni embed custom themes from brand colors.
 * Each returns a full customTheme JSON object compatible with Omni's embed API.
 */

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r},${g},${b},${alpha})`
}

function lighten(hex, amount = 0.15) {
  const { r, g, b } = hexToRgb(hex)
  const lr = Math.min(255, Math.round(r + (255 - r) * amount))
  const lg = Math.min(255, Math.round(g + (255 - g) * amount))
  const lb = Math.min(255, Math.round(b + (255 - b) * amount))
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
}

function darken(hex, amount = 0.2) {
  const { r, g, b } = hexToRgb(hex)
  const dr = Math.max(0, Math.round(r * (1 - amount)))
  const dg = Math.max(0, Math.round(g * (1 - amount)))
  const db = Math.max(0, Math.round(b * (1 - amount)))
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`
}

/**
 * Theme 1: Corporate Light
 * Clean, professional light theme with brand accent colors.
 */
function corporateLight(primary, secondary) {
  return {
    'dashboard-background': '#f8f9fb',
    'dashboard-page-padding': '16px',
    'dashboard-key-color': primary,
    'dashboard-key-text-color': '#ffffff',
    'dashboard-tile-margin': '6px',
    'dashboard-tile-background': '#ffffff',
    'dashboard-tile-shadow': '0 1px 3px rgba(0,0,0,0.06)',
    'dashboard-tile-border-color': '#e5e7eb',
    'dashboard-tile-border-radius': '12px',
    'dashboard-tile-border-width': '1px',
    'dashboard-tile-text-body-color': '#374151',
    'dashboard-tile-text-secondary-color': '#6b7280',
    'dashboard-tile-title-text-color': secondary || '#1e293b',
    'dashboard-tile-title-font-size': '15px',
    'dashboard-tile-title-font-weight': '600',
    'dashboard-button-radius': '8px',
    'dashboard-control-background': '#ffffff',
    'dashboard-control-radius': '8px',
    'dashboard-control-border-color': '#e5e7eb',
    'dashboard-control-text-color': '#374151',
    'dashboard-control-placeholder-color': '#9ca3af',
    'dashboard-control-label-color': '#6b7280',
    'dashboard-control-outline-color': primary,
    'dashboard-control-popover-background': '#ffffff',
    'dashboard-control-popover-text-color': '#374151',
    'dashboard-control-popover-secondary-text-color': '#9ca3af',
    'dashboard-control-popover-link-color': primary,
    'dashboard-control-popover-radius': '10px',
    'dashboard-control-popover-border-color': '#e5e7eb',
    'dashboard-filter-input-background': '#f9fafb',
    'dashboard-filter-input-radius': '8px',
    'dashboard-filter-input-border-color': '#e5e7eb',
    'dashboard-filter-input-text-color': '#374151',
    'dashboard-filter-input-placeholder-color': '#9ca3af',
    'dashboard-filter-input-icon-color': '#9ca3af',
    'dashboard-filter-input-outline-color': primary,
    'dashboard-filter-input-accent-color': primary,
    'dashboard-filter-input-accent-invert-color': '#ffffff',
    'dashboard-filter-input-token-color': rgba(primary, 0.1),
    'dashboard-filter-input-token-text-color': primary,
    'dashboard-button-transparent-text-color': primary,
    'dashboard-button-transparent-interactive-color': rgba(primary, 0.08),
    'dashboard-menu-item-interactive-color': rgba(primary, 0.06),
  }
}

/**
 * Theme 2: Dark Executive
 * Sleek dark theme with brand accent highlights.
 */
function darkExecutive(primary, secondary) {
  const softPrimary = lighten(primary, 0.2)
  return {
    'dashboard-background': '#0f1117',
    'dashboard-page-padding': '16px',
    'dashboard-key-color': primary,
    'dashboard-key-text-color': '#ffffff',
    'dashboard-tile-margin': '6px',
    'dashboard-tile-background': 'rgba(255,255,255,0.04)',
    'dashboard-tile-shadow': '',
    'dashboard-tile-border-color': rgba(primary, 0.15),
    'dashboard-tile-border-radius': '12px',
    'dashboard-tile-border-width': '1px',
    'dashboard-tile-text-body-color': '#e5e7eb',
    'dashboard-tile-text-secondary-color': '#9ca3af',
    'dashboard-tile-title-text-color': softPrimary,
    'dashboard-tile-title-font-size': '15px',
    'dashboard-tile-title-font-weight': '600',
    'dashboard-button-radius': '8px',
    'dashboard-control-background': 'rgba(255,255,255,0.06)',
    'dashboard-control-radius': '8px',
    'dashboard-control-border-color': rgba(primary, 0.2),
    'dashboard-control-text-color': '#e5e7eb',
    'dashboard-control-placeholder-color': rgba(primary, 0.5),
    'dashboard-control-label-color': softPrimary,
    'dashboard-control-outline-color': primary,
    'dashboard-control-popover-background': '#1a1d27',
    'dashboard-control-popover-text-color': '#e5e7eb',
    'dashboard-control-popover-secondary-text-color': '#9ca3af',
    'dashboard-control-popover-link-color': softPrimary,
    'dashboard-control-popover-radius': '10px',
    'dashboard-control-popover-border-color': rgba(primary, 0.25),
    'dashboard-filter-input-background': '#0f1117',
    'dashboard-filter-input-radius': '8px',
    'dashboard-filter-input-border-color': rgba(primary, 0.2),
    'dashboard-filter-input-text-color': '#e5e7eb',
    'dashboard-filter-input-placeholder-color': rgba(primary, 0.4),
    'dashboard-filter-input-icon-color': softPrimary,
    'dashboard-filter-input-outline-color': primary,
    'dashboard-filter-input-accent-color': primary,
    'dashboard-filter-input-accent-invert-color': '#0f1117',
    'dashboard-filter-input-token-color': rgba(primary, 0.15),
    'dashboard-filter-input-token-text-color': softPrimary,
    'dashboard-button-transparent-text-color': softPrimary,
    'dashboard-button-transparent-interactive-color': rgba(primary, 0.15),
    'dashboard-menu-item-interactive-color': rgba(primary, 0.12),
  }
}

/**
 * Theme 3: Brand Immersive
 * Bold brand-colored background with white/light text. Makes the dashboard feel fully branded.
 */
function brandImmersive(primary, secondary) {
  const bg = darken(secondary || primary, 0.3)
  const bgMid = darken(secondary || primary, 0.15)
  return {
    'dashboard-background': `linear-gradient(135deg, ${bg} 0%, ${bgMid} 100%)`,
    'dashboard-page-padding': '16px',
    'dashboard-key-color': lighten(primary, 0.3),
    'dashboard-key-text-color': darken(primary, 0.5),
    'dashboard-tile-margin': '6px',
    'dashboard-tile-background': 'rgba(255,255,255,0.08)',
    'dashboard-tile-shadow': '',
    'dashboard-tile-border-color': rgba(primary, 0.2),
    'dashboard-tile-border-radius': '14px',
    'dashboard-tile-border-width': '1px',
    'dashboard-tile-text-body-color': 'rgba(255,255,255,0.9)',
    'dashboard-tile-text-secondary-color': 'rgba(255,255,255,0.6)',
    'dashboard-tile-title-text-color': lighten(primary, 0.35),
    'dashboard-tile-title-font-size': '16px',
    'dashboard-tile-title-font-weight': '700',
    'dashboard-button-radius': '10px',
    'dashboard-control-background': 'rgba(255,255,255,0.08)',
    'dashboard-control-radius': '10px',
    'dashboard-control-border-color': rgba(primary, 0.25),
    'dashboard-control-text-color': 'rgba(255,255,255,0.9)',
    'dashboard-control-placeholder-color': 'rgba(255,255,255,0.4)',
    'dashboard-control-label-color': lighten(primary, 0.3),
    'dashboard-control-outline-color': lighten(primary, 0.3),
    'dashboard-control-popover-background': bg,
    'dashboard-control-popover-text-color': 'rgba(255,255,255,0.9)',
    'dashboard-control-popover-secondary-text-color': 'rgba(255,255,255,0.5)',
    'dashboard-control-popover-link-color': lighten(primary, 0.3),
    'dashboard-control-popover-radius': '12px',
    'dashboard-control-popover-border-color': rgba(primary, 0.3),
    'dashboard-filter-input-background': 'rgba(0,0,0,0.25)',
    'dashboard-filter-input-radius': '10px',
    'dashboard-filter-input-border-color': rgba(primary, 0.2),
    'dashboard-filter-input-text-color': 'rgba(255,255,255,0.9)',
    'dashboard-filter-input-placeholder-color': 'rgba(255,255,255,0.35)',
    'dashboard-filter-input-icon-color': lighten(primary, 0.3),
    'dashboard-filter-input-outline-color': lighten(primary, 0.3),
    'dashboard-filter-input-accent-color': lighten(primary, 0.3),
    'dashboard-filter-input-accent-invert-color': bg,
    'dashboard-filter-input-token-color': rgba(primary, 0.2),
    'dashboard-filter-input-token-text-color': lighten(primary, 0.3),
    'dashboard-button-transparent-text-color': lighten(primary, 0.3),
    'dashboard-button-transparent-interactive-color': rgba(primary, 0.2),
    'dashboard-menu-item-interactive-color': rgba(primary, 0.15),
  }
}

export const THEME_OPTIONS = [
  { id: 'none', label: 'Default (no custom theme)', description: 'Uses the dashboard\'s native Omni theme' },
  { id: 'light', label: 'Corporate Light', description: 'Clean white background with brand accents' },
  { id: 'dark', label: 'Dark Executive', description: 'Sleek dark mode with brand highlights' },
  { id: 'immersive', label: 'Brand Immersive', description: 'Bold brand-colored background, fully branded feel' },
  { id: 'custom', label: 'Custom Theme ID', description: 'Use a specific theme ID from Omni Settings' },
]

export function generateOmniTheme(themeId, primaryColor, secondaryColor) {
  switch (themeId) {
    case 'light': return corporateLight(primaryColor, secondaryColor)
    case 'dark': return darkExecutive(primaryColor, secondaryColor)
    case 'immersive': return brandImmersive(primaryColor, secondaryColor)
    default: return null
  }
}
