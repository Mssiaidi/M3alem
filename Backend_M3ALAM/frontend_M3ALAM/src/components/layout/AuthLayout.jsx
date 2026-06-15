import Footer from './Footer'

function AuthLayout({ children }) {
  return (
    <div className="app-shell">

      <main className="auth-layout">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default AuthLayout
