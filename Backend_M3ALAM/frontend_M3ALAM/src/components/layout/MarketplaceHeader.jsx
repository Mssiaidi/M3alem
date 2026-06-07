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
            <span className="material-symbols-outlined">home</span>
            Accueil
          </Link>
          <Link to="/catalogue">
            <span className="material-symbols-outlined">storefront</span>
            Catalogue
          </Link>
          <Link to="/cart">
            <span className="material-symbols-outlined">shopping_cart</span>
            Panier
          </Link>
          <Link to="/orders">
            <span className="material-symbols-outlined">receipt_long</span>
            Commandes
          </Link>
          <Link to="/seller/dashboard">
            <span className="material-symbols-outlined">store</span>
            Vendeur
          </Link>
          <Link to="/admin/dashboard">
            <span className="material-symbols-outlined">admin_panel_settings</span>
            Admin
          </Link>
        </nav>

        <div className="topbar__actions">
          <Link to="/login" className="chip">
            <span className="material-symbols-outlined">login</span>
            Connexion
          </Link>
          <Link to="/register" className="chip">
            <span className="material-symbols-outlined">person_add</span>
            Inscription
          </Link>
        </div>
      </div>
    </header>
  )
}

export default MarketplaceHeader
