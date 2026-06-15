import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logoutLocal } from '../../api/authService'
import DashboardLayout from './DashboardLayout'

const sellerLinks = [
  { label: 'Dashboard', path: '/seller/dashboard' },
  { label: 'Boutique', path: '/seller/shop' },
  { label: 'Produits', path: '/seller/products' },
  { label: 'Nouveau produit', path: '/seller/products/new' },
  { label: 'Commandes', path: '/seller/orders' },
  { label: 'Messages', path: '/seller/messages' },
]

function SellerLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
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

  const isOrderDetail = /^\/seller\/orders\/[^/]+$/.test(location.pathname)
  const topbarLeft = isOrderDetail ? (
    <div className="seller-layout-order-header">
      <button type="button" className="seller-layout-order-header__back" onClick={() => navigate('/seller/orders')}>
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <div>
        <strong>Détails de la Commande</strong>
        <p>Commande #{params.id || 'ORD-001'} • Reçue le 14 juin 2026</p>
      </div>
    </div>
  ) : null

  const topbarRight = isOrderDetail ? (
    <div className="seller-layout-order-actions">
      <button type="button" className="seller-layout-order-actions__secondary" onClick={() => window.print()}>
        <span className="material-symbols-outlined">print</span>
        Imprimer
      </button>
      <button
        type="button"
        className="seller-layout-order-actions__primary"
        onClick={() => navigate(`/seller/orders/${params.id}#contact-client`)}
      >
        <span className="material-symbols-outlined">chat</span>
        Contacter le client
      </button>
      <button
        type="button"
        className="seller-layout-order-actions__secondary"
        onClick={() => navigate(`/seller/orders/${params.id}#contact-admin`)}
      >
        <span className="material-symbols-outlined">admin_panel_settings</span>
        Contacter l&apos;admin
      </button>
      <button
        type="button"
        className="seller-layout-order-actions__secondary"
        onClick={() => navigate('/seller/messages')}
      >
        <span className="material-symbols-outlined">forum</span>
        Voir messages
      </button>
    </div>
  ) : null

  const sidebarFooter = isOrderDetail ? (
    <div className="seller-layout-sidebar-footer">
      <div className="seller-layout-sidebar-footer__avatar">MA</div>
      <div>
        <strong>M3alem Ahmed</strong>
        <p>Maître Artisan</p>
      </div>
    </div>
  ) : null

  return (
    <DashboardLayout
      links={sellerLinks}
      title="Espace vendeur"
      topbarLeft={topbarLeft}
      topbarRight={topbarRight}
      sidebarFooter={sidebarFooter}
    >
      {status === 'allowed' ? children : <p className="muted">Verification de votre session...</p>}
    </DashboardLayout>
  )
}

export default SellerLayout
