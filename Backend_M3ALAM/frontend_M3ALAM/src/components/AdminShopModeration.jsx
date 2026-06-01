import { useEffect, useState } from 'react'
import { approveShop, getPendingShops, suspendShop } from '../lib/api'

const money = (value) => `${Number(value ?? 0).toLocaleString('fr-MA')} DH`

export default function AdminShopModeration() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await getPendingShops()
      setShops(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleApprove = async (id) => {
    await approveShop(id)
    refresh()
  }

  const handleSuspend = async (id) => {
    await suspendShop(id)
    refresh()
  }

  return (
    <section className="admin-page">
      <div className="admin-page__shell">
        <aside className="admin-sidebar">
          <div>
            <p className="eyebrow">Artisan Portal</p>
            <h1>Modération des boutiques</h1>
            <p className="muted">Validation des demandes et contrôle qualité.</p>
          </div>
          <div className="admin-sidebar__stats">
            <div className="admin-kpi">
              <span>En attente</span>
              <strong>{shops.length}</strong>
            </div>
            <div className="admin-kpi">
              <span>Décision rapide</span>
              <strong>2 actions</strong>
            </div>
          </div>
        </aside>

        <main className="admin-content">
          <div className="section__head">
            <div>
              <p className="eyebrow">Boutiques</p>
              <h2>File de validation</h2>
              <p>{loading ? 'Chargement des boutiques...' : `${shops.length} boutique(s) en attente`}</p>
            </div>
          </div>

          <div className="admin-stack">
            {shops.map((shop) => (
              <article className="admin-card" key={shop.id}>
                <div className="admin-card__head">
                  <div>
                    <h3>{shop.name}</h3>
                    <p className="muted">
                      {shop.city || 'Ville non renseignée'} - {shop.user?.name} ({shop.user?.email})
                    </p>
                  </div>
                  <span className="pill pill--warning">{shop.status}</span>
                </div>

                <p className="admin-card__text">{shop.description || 'Aucune description fournie.'}</p>

                <div className="admin-card__meta">
                  <span>Ventes estimées: {money(shop.revenue ?? 0)}</span>
                  <span>ID #{shop.id}</span>
                </div>

                <div className="admin-card__actions">
                  <button className="button" type="button" onClick={() => handleApprove(shop.id)}>
                    Approuver
                  </button>
                  <button className="button--ghost button--ghost--dark" type="button" onClick={() => handleSuspend(shop.id)}>
                    Suspendre
                  </button>
                </div>
              </article>
            ))}

            {!loading && shops.length === 0 ? <p className="muted">Aucune boutique en attente pour le moment.</p> : null}
          </div>
        </main>
      </div>
    </section>
  )
}
