import Footer from './Footer'
import TeamWorkBar from './TeamWorkBar'

function AuthLayout({ children }) {
  return (
    <div className="app-shell">
      <TeamWorkBar />

      <main className="auth-layout">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default AuthLayout
