function SellerOrderDetail() {
  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Détail commande vendeur</span>
          <h1>Vue détaillée d&apos;une commande.</h1>
          <p>
            Cet écran peut accueillir le client, les articles commandés, le statut logistique et
            les actions rapides du vendeur.
          </p>
        </div>

        <div className="surface-card">
          <div className="metric-grid">
            <div className="metric">
              <span>Commande</span>
              <strong>#1042</strong>
            </div>
            <div className="metric">
              <span>Total</span>
              <strong>640 MAD</strong>
            </div>
            <div className="metric">
              <span>Statut</span>
              <strong>Préparation</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="static-cards">
        <article className="static-card">
          <h3>Articles</h3>
          <p>Afficher ici les produits vendus, les quantités et les sous-totaux.</p>
        </article>
        <article className="static-card">
          <h3>Client</h3>
          <p>Coordonnées, adresse de livraison et notes de commande.</p>
        </article>
        <article className="static-card">
          <h3>Actions</h3>
          <p>Préparer, expédier, contacter le client ou imprimer un bordereau.</p>
        </article>
      </section>
    </div>
  )
}

export default SellerOrderDetail
