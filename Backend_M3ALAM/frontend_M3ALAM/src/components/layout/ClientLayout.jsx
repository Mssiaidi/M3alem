import { Link } from 'react-router-dom'
import Footer from './Footer'
import MarketplaceHeader from './MarketplaceHeader'
import TeamWorkBar from './TeamWorkBar'

function ClientLayout({ children }) {
  return (
    <div className="app-shell">
      <TeamWorkBar />
      <MarketplaceHeader />

      <main className="main">
        <nav className="section-tabs" aria-label="Navigation client">
          <Link to="/cart">Panier</Link>
          <Link to="/checkout">Checkout</Link>
          <Link to="/orders">Commandes</Link>
        </nav>
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default ClientLayout
