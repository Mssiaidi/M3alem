import { Link, useLocation } from 'react-router-dom'
import Footer from './Footer'
import TeamWorkBar from './TeamWorkBar'

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
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="dashboard-layout__body">
          <header className="dashboard-topbar">
            <strong>{title}</strong>
            <Link to="/login" className="chip">Deconnexion</Link>
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
