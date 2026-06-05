import { Link, useLocation } from 'react-router-dom'

function MarketplaceHeader() {
  const location = useLocation()

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="brand">
          M3alem Marketplace
        </Link>

        <nav className="nav">
          <Link className={location.pathname === '/' ? 'is-active' : ''} to="/">
            Accueil
          </Link>
          <Link to="/catalogue">Catalogue</Link>
          <Link to="/cart">Panier</Link>
          <Link to="/orders">Commandes</Link>
          <Link to="/seller/dashboard">Vendeur</Link>
          <Link to="/admin/dashboard">Admin</Link>
        </nav>

        <div className="topbar__actions">
          <Link to="/login" className="chip">Connexion</Link>
          <Link to="/register" className="chip">Inscription</Link>
        </div>
      </div>
    </header>
  )
}

export default MarketplaceHeader
