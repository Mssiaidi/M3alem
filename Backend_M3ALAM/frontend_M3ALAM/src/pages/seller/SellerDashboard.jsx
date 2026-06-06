const sellerKpis = [
  { label: 'Total produits', value: '42' },
  { label: 'Ventes du mois', value: '2,840 MAD' },
  { label: 'Alertes stock', value: '05' },
  { label: 'Note artisan', value: '4.9' },
]

function SellerDashboard() {
  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Dashboard vendeur</span>
          <h1>Pilotez votre boutique avec une vue synthétique.</h1>
          <p>
            Suivi rapide des produits, des ventes et des alertes importantes en un
            seul endroit.
          </p>
        </div>

        <div className="surface-card">
          <div className="metric-grid">
            {sellerKpis.map((kpi) => (
              <div className="metric" key={kpi.label}>
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="static-cards">
        <article className="static-card">
          <h3>Inventaire sain</h3>
          <p>La majorité des produits restent en ligne avec un stock maîtrisé.</p>
        </article>
        <article className="static-card">
          <h3>Alertes à traiter</h3>
          <p>Quelques références demandent une mise à jour de stock ou de visuels.</p>
        </article>
        <article className="static-card">
          <h3>Trafic stable</h3>
          <p>Les visites restent régulières sur les produits les plus visibles.</p>
        </article>
      </section>
    </div>
  )
}

export default SellerDashboard
