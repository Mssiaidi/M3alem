import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link className="footer__logo" to="/">M3alem Marketplace</Link>
            <p>
              La plateforme de reference pour l'artisanat marocain authentique
              et moderne.
            </p>
          </div>

          <div className="footer__links">
            <nav aria-label="Place de marche">
              <h5>Place de marche</h5>
              <Link to="/catalogue">Catalogue</Link>
              <Link to="/catalogue">Categories</Link>
              <Link to="/register">Devenir vendeur</Link>
            </nav>

            <nav aria-label="Espace client">
              <h5>Espace client</h5>
              <Link to="/cart">Panier</Link>
              <Link to="/orders">Mes commandes</Link>
              <Link to="/login">Connexion</Link>
            </nav>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 M3alem Marketplace. Tous droits reserves.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
