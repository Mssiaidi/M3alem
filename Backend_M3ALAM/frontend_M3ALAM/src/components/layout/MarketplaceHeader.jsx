import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logout, logoutLocal } from '../../api/authService'
import { getCart } from '../../api/cartService'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function roleLabel(role) {
  if (role === 'admin') return 'Admin'
  if (role === 'seller') return 'Vendeur'
  return 'Client'
}

function dashboardLink(user) {
  if (user?.role === 'admin') return '/admin/dashboard'
  if (user?.role === 'seller') return '/seller/dashboard'
  return '/orders'
}

function dashboardText(user) {
  if (user?.role === 'admin') return 'Dashboard admin'
  if (user?.role === 'seller') return 'Espace vendeur'
  return 'Mes commandes'
}

function countCartItems(cart) {
  return (cart?.items || []).reduce((total, item) => total + Number(item.quantity || 0), 0)
}

function menuLinks(user) {
  if (user?.role === 'admin') {
    return [
      { label: 'Gestion utilisateurs', path: '/admin/users' },
      { label: 'Moderation boutiques', path: '/admin/shops' },
      { label: 'Moderation avis', path: '/admin/reviews' },
      { label: 'Gestion categories', path: '/admin/categories' },
    ]
  }

  if (user?.role === 'seller') {
    return [
      { label: 'Gestion boutique', path: '/seller/shop' },
      { label: 'Produits vendeur', path: '/seller/products' },
      { label: 'Nouveau produit', path: '/seller/products/new' },
      { label: 'Commandes vendeur', path: '/seller/orders' },
    ]
  }

  return [
    { label: 'Panier', path: '/cart' },
  ]
}

function MarketplaceHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(Boolean(getAuthToken()))
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartPulse, setCartPulse] = useState(false)
  const [cartIncrement, setCartIncrement] = useState(null)

  useEffect(() => {
    let active = true

    if (!getAuthToken()) {
      setUser(null)
      setLoadingUser(false)
      return undefined
    }

    setLoadingUser(true)
    getProfile()
      .then((profile) => {
        if (active) setUser(profile)
      })
      .catch(() => {
        logoutLocal()
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoadingUser(false)
      })

    return () => {
      active = false
    }
  }, [location.pathname])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [menuOpen])

  useEffect(() => {
    if (user?.role !== 'client') {
      setCartCount(0)
      return undefined
    }

    let active = true

    const refreshCartCount = () => {
      getCart()
        .then((cart) => {
          if (active) setCartCount(countCartItems(cart))
        })
        .catch(() => {
          if (active) setCartCount(0)
        })
    }

    refreshCartCount()

    const onCartUpdated = (event) => {
      const quantity = Number(event.detail?.quantity || 1)

      if (!event.detail?.silent) {
        setCartPulse(false)
        setCartIncrement(`+${quantity}`)
        window.setTimeout(() => setCartPulse(true), 0)
        window.setTimeout(() => {
          setCartPulse(false)
          setCartIncrement(null)
        }, 900)
      }

      refreshCartCount()
    }

    window.addEventListener('cart:updated', onCartUpdated)

    return () => {
      active = false
      window.removeEventListener('cart:updated', onCartUpdated)
    }
  }, [user?.role])

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      logoutLocal()
    } finally {
      setUser(null)
      setMenuOpen(false)
      navigate('/', { replace: true })
    }
  }

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="brand">
          M3alem Marketplace
        </Link>

        <div className="topbar__actions">
          {loadingUser ? (
            <span className="chip">Chargement...</span>
          ) : user ? (
            <>
              {user.role === 'client' && (
                <Link
                  aria-label="Voir le panier"
                  className={[
                    'topbar-cart-link',
                    location.pathname === '/cart' ? 'is-active' : '',
                    cartPulse ? 'is-pulsing' : '',
                  ].filter(Boolean).join(' ')}
                  to="/cart"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M6.3 8h14l-1.4 7.2a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.7L5.8 5H3" />
                    <circle cx="9.5" cy="20" r="1.3" />
                    <circle cx="17" cy="20" r="1.3" />
                  </svg>
                  {cartCount > 0 && <span className="topbar-cart-count">{cartCount}</span>}
                  {cartIncrement && <span className="topbar-cart-increment">{cartIncrement}</span>}
                </Link>
              )}

              <div className="user-menu" ref={menuRef}>
                <button
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  className="user-menu__trigger"
                  onClick={() => setMenuOpen((open) => !open)}
                  title={user.email}
                  type="button"
                >
                  <span className="user-chip__avatar">{initials(user.name)}</span>
                </button>

                {menuOpen && (
                  <div className="user-menu__panel" role="menu">
                    <div className="user-menu__profile">
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{roleLabel(user.role)}</small>
                      </div>
                    </div>

                    <div className="user-menu__section">
                      <Link
                        to={dashboardLink(user)}
                        className={location.pathname === dashboardLink(user) ? 'is-active' : ''}
                        role="menuitem"
                      >
                        {dashboardText(user)}
                      </Link>
                      {menuLinks(user).map((link) => (
                        <Link
                          className={location.pathname === link.path ? 'is-active' : ''}
                          key={link.path}
                          role="menuitem"
                          to={link.path}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    <button className="user-menu__logout" onClick={handleLogout} role="menuitem" type="button">
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="chip">Connexion</Link>
              <Link to="/register" className="chip">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default MarketplaceHeader
