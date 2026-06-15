import Footer from './Footer'
import MarketplaceHeader from './MarketplaceHeader'

function PublicLayout({ children }) {
  return (
    <div className="app-shell">
      <MarketplaceHeader />

      <main className="main">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default PublicLayout
