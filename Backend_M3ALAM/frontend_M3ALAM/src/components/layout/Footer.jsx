import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <h4>M3alem Marketplace</h4>
            <p>
              La plateforme de reference pour l'artisanat marocain authentique
              et moderne.
            </p>
          </div>

          <div className="footer__links">
            <div>
              <h5>Place de marche</h5>
              <Link to="/catalogue">Catalogue</Link>
              <br />
              <Link to="/shops/demo-shop">Boutiques</Link>
              <br />
              <Link to="/register">Devenir vendeur</Link>
            </div>

            <div>
              <h5>Support</h5>
              <Link to="/orders">Commandes</Link>
              <br />
              <Link to="/cart">Panier</Link>
              <br />
              <Link to="/login">Connexion</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>(c) 2024 M3alem Marketplace. Professional Artisan Commerce.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
