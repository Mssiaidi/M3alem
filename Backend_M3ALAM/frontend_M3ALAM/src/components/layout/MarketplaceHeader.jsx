import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logout, logoutLocal } from '../../api/authService'

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
