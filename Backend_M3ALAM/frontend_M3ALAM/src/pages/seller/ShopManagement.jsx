function ShopManagement() {
  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Gestion boutique</span>
          <h1>Pilotez votre vitrine et vos informations publiques.</h1>
          <p>
            Une page prête à recevoir les données de boutique, logo, bannière, statut et
            paramètres de visibilité.
          </p>
        </div>

        <div className="surface-card">
          <div className="metric-grid">
            <div className="metric">
              <span>Statut</span>
              <strong>Approuvée</strong>
            </div>
            <div className="metric">
              <span>Produits</span>
              <strong>24</strong>
            </div>
            <div className="metric">
              <span>Ville</span>
              <strong>Fès</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="static-cards">
        <article className="static-card">
          <h3>Profil boutique</h3>
          <p>Description, image de couverture et logo de la boutique.</p>
        </article>
        <article className="static-card">
          <h3>Configuration</h3>
          <p>Statut, visibilité et données essentielles liées à l&apos;activité.</p>
        </article>
        <article className="static-card">
          <h3>Actions rapides</h3>
          <p>Modifier, archiver ou mettre à jour les informations de boutique.</p>
        </article>
      </section>
    </div>
  )
}

export default ShopManagement
