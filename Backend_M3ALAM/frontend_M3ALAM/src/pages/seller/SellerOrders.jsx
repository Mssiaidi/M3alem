function SellerOrders() {
  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Commandes vendeur</span>
          <h1>Suivez les commandes et leurs statuts.</h1>
          <p>
            Un espace prêt à connecter les commandes backend avec les états de préparation,
            expédition et livraison.
          </p>
        </div>

        <div className="surface-card">
          <div className="metric-grid">
            <div className="metric">
              <span>En attente</span>
              <strong>12</strong>
            </div>
            <div className="metric">
              <span>En cours</span>
              <strong>07</strong>
            </div>
            <div className="metric">
              <span>Livrées</span>
              <strong>31</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="static-cards">
        <article className="static-card">
          <h3>Priorité du jour</h3>
          <p>Les commandes les plus récentes doivent être préparées en premier.</p>
        </article>
        <article className="static-card">
          <h3>Expédition</h3>
          <p>Relier ici le suivi de colis et les délais de livraison estimés.</p>
        </article>
        <article className="static-card">
          <h3>Historique</h3>
          <p>Un listing paginé pourra afficher les commandes terminées et archivées.</p>
        </article>
      </section>
    </div>
  )
}

export default SellerOrders
