import { createContext, useContext, useState } from 'react'

const BrandContext = createContext()

const defaultBrand = {
  configured: false,
  url: '',
  name: 'Fishtank Bubble',
  logo: '',
  logoUrl: '',
  primaryColor: '#F5C518',
  secondaryColor: '#1a1a1a',
  description: '',
  keyMessages: [],
  products: [],
  embedSecret: '',
  embedVanityDomain: '',
  embedDashboardPath: '/dashboards/d33cc8c2',
  embedThemeId: '',
  aiConnectionId: '',
  aiConnectionRole: 'RESTRICTED_QUERIER',
}

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(defaultBrand)

  const updateBrand = (data) => {
    setBrand(prev => ({ ...prev, ...data, configured: true }))
  }

  const resetBrand = () => setBrand(defaultBrand)

  return (
    <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrand must be used within BrandProvider')
  return ctx
}
