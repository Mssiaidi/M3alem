import { Link, useLocation } from 'react-router-dom'
import Footer from './Footer'
import MarketplaceHeader from './MarketplaceHeader'

function getLinkIcon(label) {
  switch (label) {
    case 'Dashboard':
      return 'dashboard'
    case 'Boutique':
      return 'store'
    case 'Produits':
    case 'Nouveau produit':
      return 'inventory_2'
    case 'Commandes':
      return 'receipt_long'
    case 'Messages':
      return 'chat'
    case 'Utilisateurs':
      return 'group'
    case 'Categories':
      return 'category'
    case 'Avis':
      return 'rate_review'
    default:
      return 'circle'
  }
}

function DashboardLayout({
  children,
  links,
  title,
  topbarLeft,
  topbarRight,
  sidebarFooter,
  hideSidebarHeader = false,
  hideLinkIcons = false,
  hideTopbar = false,
}) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <MarketplaceHeader />

      <div className="dashboard-layout">
        <aside className={hideLinkIcons ? 'dashboard-sidebar dashboard-sidebar--plain' : 'dashboard-sidebar'}>
          {!hideSidebarHeader && (
            <>
              <Link to="/" className="brand">
                M3alem Marketplace
              </Link>
              <h2>{title}</h2>
            </>
          )}

          <nav className="dashboard-sidebar__nav">
            {links.map((link) => (
              <Link
                className={location.pathname === link.path ? 'is-active' : ''}
                key={link.path}
                to={link.path}
              >
                {!hideLinkIcons && (
                  <span className="material-symbols-outlined dashboard-sidebar__icon">
                    {getLinkIcon(link.label)}
                  </span>
                )}
                {link.label}
              </Link>
            ))}
          </nav>

          {sidebarFooter ? <div className="dashboard-sidebar__footer">{sidebarFooter}</div> : null}
        </aside>

        <div className="dashboard-layout__body">
          {!hideTopbar && (
            <header className="dashboard-topbar">
              <div className="dashboard-topbar__left">
                {topbarLeft || <strong>{title}</strong>}
              </div>
              <div className="dashboard-topbar__right">
                {topbarRight}
              </div>
            </header>
          )}

          <main className="dashboard-main">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default DashboardLayout
