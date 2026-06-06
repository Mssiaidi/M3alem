const users = [
  ['Amina', 'Client', 'Actif', '12 commandes'],
  ['Yassine', 'Vendeur', 'À vérifier', '3 boutiques'],
  ['Sofia', 'Client', 'Suspendu', '2 signalements'],
]

function UserManagement() {
  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Gestion utilisateurs</span>
          <h1>Suivez les comptes et gardez un espace sain.</h1>
          <p>Recherche, statut, suspension et consultation rapide des profils.</p>
        </div>

        <div className="surface-card">
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric">
              <span>Actifs</span>
              <strong>1,120</strong>
            </div>
            <div className="metric">
              <span>À vérifier</span>
              <strong>34</strong>
            </div>
            <div className="metric">
              <span>Suspensions</span>
              <strong>8</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-card">
        <div className="toolbar" style={{ marginBottom: '1rem' }}>
          <div>
            <h2>Comptes</h2>
            <p>Accédez rapidement aux profils utilisateurs.</p>
          </div>
          <div className="toolbar__search">
            <input placeholder="Rechercher un utilisateur" />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Indicateur</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(([name, role, status, note]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{role}</td>
                <td>
                  <span
                    className={`tag ${
                      status === 'Suspendu'
                        ? 'tag--danger'
                        : status === 'À vérifier'
                          ? 'tag--warn'
                          : 'tag--success'
                    }`}
                  >
                    {status}
                  </span>
                </td>
                <td>{note}</td>
                <td>
                  <div className="action-row">
                    <button className="button--ghost">Voir</button>
                    <button className="button--ghost">Gérer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default UserManagement
