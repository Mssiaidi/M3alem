import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logoutLocal } from '../../api/authService'
import DashboardLayout from './DashboardLayout'

const sellerLinks = [
  { label: 'Dashboard', path: '/seller/dashboard' },
  { label: 'Boutique', path: '/seller/shop' },
  { label: 'Produits', path: '/seller/products' },
  { label: 'Nouveau produit', path: '/seller/products/new' },
  { label: 'Commandes', path: '/seller/orders' },
]

function SellerLayout({ children }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true

    if (!getAuthToken()) {
      setStatus('guest')
      navigate('/login', { replace: true })
      return undefined
    }

    getProfile()
      .then((user) => {
        if (!active) return

        if (user?.role !== 'seller' && user?.role !== 'admin') {
          setStatus('forbidden')
          logoutLocal()
          navigate('/login', { replace: true })
          return
        }

        setStatus('allowed')
      })
      .catch(() => {
        logoutLocal()
        if (active) {
          setStatus('guest')
          navigate('/login', { replace: true })
        }
      })

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <DashboardLayout links={sellerLinks} title="Espace vendeur">
      {status === 'allowed' ? children : <p className="muted">Verification de votre session...</p>}
    </DashboardLayout>
  )
}

export default SellerLayout
