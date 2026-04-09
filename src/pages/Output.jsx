import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '../context/BrandContext'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'

export default function Output() {
  const { brand } = useBrand()
  const navigate = useNavigate()
  const [loggedIn, setLoggedIn] = useState(false)

  if (!brand.configured) {
    return (
      <div className="output-empty">
        <h2>No brand configured</h2>
        <p>Please configure a brand first.</p>
        <button className="btn btn-primary" onClick={() => navigate('/config')}>
          Go to Configuration
        </button>
      </div>
    )
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return <Dashboard onLogout={() => setLoggedIn(false)} />
}
