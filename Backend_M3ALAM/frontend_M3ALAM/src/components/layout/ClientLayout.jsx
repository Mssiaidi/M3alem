import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logoutLocal } from '../../api/authService'
import Footer from './Footer'
import MarketplaceHeader from './MarketplaceHeader'
import TeamWorkBar from './TeamWorkBar'

function dashboardForRole(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'seller') return '/seller/dashboard'
  return '/login'
}

function ClientLayout({ children }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    if (!getAuthToken()) {
      setStatus('guest')
      navigate('/login')
      return undefined
    }

    getProfile()
      .then((user) => {
        if (!active) return

        if (user.role !== 'client') {
          setStatus('forbidden')
          navigate(dashboardForRole(user.role))
          return
        }

        setStatus('allowed')
      })
      .catch(() => {
        logoutLocal()
        if (active) {
          setStatus('guest')
          navigate('/login')
        }
      })

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <div className="app-shell">
      <TeamWorkBar />
      <MarketplaceHeader />

      <main className="main">
        {status === 'allowed' ? (
          <>
            <nav className="section-tabs" aria-label="Navigation client">
              <Link to="/cart">Panier</Link>
              <Link to="/checkout">Checkout</Link>
              <Link to="/orders">Commandes</Link>
            </nav>
            {children}
          </>
        ) : (
          <p className="muted">
            {status === 'loading' ? 'Verification de votre session...' : 'Redirection en cours...'}
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default ClientLayout
