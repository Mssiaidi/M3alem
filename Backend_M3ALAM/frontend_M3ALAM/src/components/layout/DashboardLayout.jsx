import { Link, useLocation } from 'react-router-dom'
import { logoutLocal } from '../../api/authService'
import Footer from './Footer'
import TeamWorkBar from './TeamWorkBar'

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

function DashboardLayout({ children, links, title }) {
  const location = useLocation()

  return (
    <div className="app-shell">
      <TeamWorkBar />

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <Link to="/" className="brand">
            M3alem Marketplace
          </Link>
          <h2>{title}</h2>

          <nav className="dashboard-sidebar__nav">
            {links.map((link) => (
              <Link
                className={location.pathname === link.path ? 'is-active' : ''}
                key={link.path}
                to={link.path}
              >
                <span className="material-symbols-outlined dashboard-sidebar__icon">
                  {getLinkIcon(link.label)}
                </span>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="dashboard-layout__body">
          <header className="dashboard-topbar">
            <strong>{title}</strong>
            <Link
              to="/login"
              className="chip"
              onClick={logoutLocal}
            >
              <span className="material-symbols-outlined">logout</span>
              Deconnexion
            </Link>
          </header>

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
