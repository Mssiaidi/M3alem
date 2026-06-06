import { useEffect, useState } from 'react'
import { getPendingShops } from '../../api/adminService'

function ShopModeration() {
  const [shops, setShops] = useState([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const payload = await getPendingShops()
        if (!active) return
        setShops(payload)
      } catch (err) {
        if (!active) return
        setShops([])
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="workspace-page">
      <section className="page-hero">
        <div>
          <span className="tag">Modération boutique</span>
          <h1>Validez les nouvelles boutiques avant leur mise en ligne.</h1>
          <p>Une interface claire pour examiner, approuver ou rejeter rapidement.</p>
        </div>

        <div className="surface-card">
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric">
              <span>En attente</span>
              <strong>24</strong>
            </div>
            <div className="metric">
              <span>Risque élevé</span>
              <strong>3</strong>
            </div>
            <div className="metric">
              <span>Validées</span>
              <strong>15</strong>
            </div>
          </div>
        </div>
      </section>

      {!shops.length ? (
        <div className="surface-card">
          <p className="muted" style={{ margin: 0 }}>
            Aucun résultat chargé. Si vous voyez encore une erreur 403 dans la console,
            utilisez un compte administrateur.
          </p>
        </div>
      ) : null}

      <section className="surface-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Boutique</th>
              <th>État</th>
              <th>Risque</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id || shop.name}>
                <td>{shop.name}</td>
                <td>
                  <span className={`tag ${shop.status === 'suspended' ? 'tag--danger' : 'tag--warn'}`}>
                    {shop.status === 'suspended' ? 'Bloquee' : 'En attente'}
                  </span>
                </td>
                <td>{shop.risk || 'Moyen'}</td>
                <td>
                  <div className="action-row">
                    <button className="button--ghost">Consulter</button>
                    <button className="button">Approuver</button>
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

export default ShopModeration
