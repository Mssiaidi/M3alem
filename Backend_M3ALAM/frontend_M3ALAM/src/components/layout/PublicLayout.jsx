import Footer from './Footer'
import MarketplaceHeader from './MarketplaceHeader'
import TeamWorkBar from './TeamWorkBar'

function PublicLayout({ children }) {
  return (
    <div className="app-shell">
      <TeamWorkBar />
      <MarketplaceHeader />

      <main className="main">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default PublicLayout
