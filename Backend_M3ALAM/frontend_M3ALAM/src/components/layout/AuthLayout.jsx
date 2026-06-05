import { Link } from 'react-router-dom'
import Footer from './Footer'
import TeamWorkBar from './TeamWorkBar'

function AuthLayout({ children }) {
  return (
    <div className="app-shell">
      <TeamWorkBar />

      <main className="auth-layout">
        <Link to="/" className="brand auth-layout__brand">
          M3alem Marketplace
        </Link>
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default AuthLayout
