import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAuthToken } from '../../api/api'
import { getProfile, logout, logoutLocal } from '../../api/authService'
import { getCart } from '../../api/cartService'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api/notificationService'

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

function notificationText(notification) {
  const data = notification?.data || {}

  if (data.message) return data.message
  if (data.sender_name) return `${data.sender_name} vous a envoye un message.`
  return 'Nouvelle notification M3alem Marketplace.'
}

function notificationLink(notification, user) {
  const data = notification?.data || {}

  if (data.order_id) {
    if (user?.role === 'seller') return `/seller/orders/${data.order_id}`
    if (user?.role === 'admin') return '/admin/orders'
    return `/orders/${data.order_id}`
  }

  if (data.shop_id) {
    if (user?.role === 'admin') return '/admin/shops'
    if (user?.role === 'seller') return '/seller/messages'
  }

  if (user?.role === 'seller') return '/seller/messages'
  if (user?.role === 'admin') return '/admin/messages'
  return '/orders'
}

function formatNotificationDate(date) {
  if (!date) return ''

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const notificationRef = useRef(null)
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(Boolean(getAuthToken()))
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationLoading, setNotificationLoading] = useState(false)
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
    setNotificationOpen(false)
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
    if (!notificationOpen) return undefined

    const closeOnOutsideClick = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [notificationOpen])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return undefined
    }

    let active = true

    const refreshNotifications = () => {
      setNotificationLoading(true)
      getNotifications()
        .then((payload) => {
          if (!active) return
          setNotifications(payload.data || [])
          setUnreadCount(payload.unread_count || 0)
        })
        .catch(() => {
          if (!active) return
          setNotifications([])
          setUnreadCount(0)
        })
        .finally(() => {
          if (active) setNotificationLoading(false)
        })
    }

    refreshNotifications()

    return () => {
      active = false
    }
  }, [user, location.pathname])

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

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      try {
        await markNotificationRead(notification.id)
        setUnreadCount((current) => Math.max(0, current - 1))
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
        )))
      } catch {
        // Keep navigation available even if marking read fails.
      }
    }

    navigate(notificationLink(notification, user))
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setUnreadCount(0)
      setNotifications((current) => current.map((item) => (
        item.read_at ? item : { ...item, read_at: new Date().toISOString() }
      )))
    } catch {
      // A failed read-state update should not block the user menu.
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
              <div className="notification-menu" ref={notificationRef}>
                <button
                  aria-expanded={notificationOpen}
                  aria-haspopup="menu"
                  aria-label="Notifications"
                  className={unreadCount > 0 ? 'topbar-notification-link has-unread' : 'topbar-notification-link'}
                  onClick={() => setNotificationOpen((open) => !open)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                    <path d="M10 20a2 2 0 0 0 4 0" />
                  </svg>
                  {unreadCount > 0 && <span className="topbar-notification-count">{unreadCount}</span>}
                </button>

                {notificationOpen && (
                  <div className="notification-menu__panel" role="menu">
                    <div className="notification-menu__head">
                      <div>
                        <strong>Notifications</strong>
                        <span>{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} type="button">
                          Tout lire
                        </button>
                      )}
                    </div>

                    <div className="notification-menu__list">
                      {notificationLoading ? (
                        <p>Chargement...</p>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <button
                            className={notification.read_at ? '' : 'is-unread'}
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            role="menuitem"
                            type="button"
                          >
                            <span className="notification-menu__dot" />
                            <span>
                              <strong>{notificationText(notification)}</strong>
                              <small>{formatNotificationDate(notification.created_at)}</small>
                            </span>
                          </button>
                        ))
                      ) : (
                        <p>Aucune notification pour le moment.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
