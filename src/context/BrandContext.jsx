import { createContext, useContext, useState } from 'react'

const BrandContext = createContext()

const defaultBrand = {
  configured: false,
  url: 'https://www.portseattle.org/sea-tac',
  name: 'Fishtank Bubble',
  logo: '',
  logoUrl: 'https://www.portseattle.org/themes/portseattleflysea/logo.svg',
  primaryColor: '#F5C518',
  secondaryColor: '#1a1a1a',
  description: '',
  keyMessages: [],
  products: [],
  omniApiKey: 'omni_osk_pZQ8f3R8rHySZX2Y4Q3WRHxNyL4sFLzCKh9EKDs12hO3jgMP1P2x9NgL',
  embedSecret: 'InaPfmh0m0ksEa4i6PZlmzQgnHGmZhWO',
  embedVanityDomain: '',
  embedDashboardPath: '/dashboards/d33cc8c2',
  embedThemeId: '1d0bd701-c8e2-4c42-b5e9-b708955b05bc',
  aiConnectionId: '',
  aiConnectionRole: 'RESTRICTED_QUERIER',
  allConnections: [],
}

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(defaultBrand)
  const [currentUser, setCurrentUser] = useState(null)

  const updateBrand = (data) => {
    setBrand(prev => ({ ...prev, ...data, configured: true }))
  }

  const resetBrand = () => setBrand(defaultBrand)

  return (
    <BrandContext.Provider value={{ brand, updateBrand, resetBrand, currentUser, setCurrentUser }}>
      {children}
    </BrandContext.Provider>
  )
}

export function useBrand() {
  const ctx = useContext(BrandContext)
  if (!ctx) throw new Error('useBrand must be used within BrandProvider')
  return ctx
}
