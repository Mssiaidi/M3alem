import { useEffect, useMemo, useState } from 'react'
import { approveShop, getPendingShops, suspendShop } from '../../api/adminService'

function ShopModeration() {
  const [shops, setShops] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        const payload = await getPendingShops()
        if (!active) return
        setShops(payload?.data || payload || [])
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger les boutiques.')
        setShops([])
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const pending = shops.filter((shop) => shop.status === 'pending').length
    const approved = shops.filter((shop) => shop.status === 'approved').length
    const suspended = shops.filter((shop) => shop.status === 'suspended').length
    const processing = shops.length ? `${Math.max(1, Math.round(48 / shops.length) / 10)}h` : '0h'

    return {
      pending,
      approved,
      suspended,
      processing,
    }
  }, [shops])

  const visibleShops = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return shops
    return shops.filter((shop) => {
      const name = `${shop.name || ''} ${shop.user?.name || ''} ${shop.status || ''}`.toLowerCase()
      return name.includes(term)
    })
  }, [query, shops])

  const rows = visibleShops

  const handleDecision = async (shop, action) => {
    try {
      if (action === 'approve') {
        await approveShop(shop.id)
      } else {
        await suspendShop(shop.id)
      }

      const payload = await getPendingShops()
      setShops(payload?.data || payload || [])
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour la boutique.')
    }
  }

  return (
    <div className="shop-moderation-shell admin-shell">
      <header className="shop-moderation-head">
        <div>
          <h1>Modération des Boutiques</h1>
          <p>Contrôlez et validez les nouvelles inscriptions d&apos;artisans.</p>
        </div>

        <div className="action-row">
          <button className="button--ghost button--ghost-dark" type="button">
            <span className="material-symbols-outlined">filter_list</span>
            Filtrer
          </button>
          <button className="button" type="button">
            <span className="material-symbols-outlined">download</span>
            Exporter Rapport
          </button>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="admin-state-note">Chargement des boutiques depuis la base de données...</p> : null}

      <section className="shop-kpi-grid">
        <article className="shop-kpi-card">
          <div className="shop-kpi-card__top">
            <span>Total En Attente</span>
            <span className="material-symbols-outlined">assignment_add</span>
          </div>
          <strong>{stats.pending}</strong>
          <small>Boutiques en attente réelles</small>
        </article>

        <article className="shop-kpi-card">
          <div className="shop-kpi-card__top">
            <span>Risque Élevé</span>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <strong>{String(stats.suspended).padStart(2, '0')}</strong>
          <small>Actions de suspension appliquées</small>
        </article>

        <article className="shop-kpi-card">
          <div className="shop-kpi-card__top">
            <span>Validées Aujourd&apos;hui</span>
            <span className="material-symbols-outlined">verified</span>
          </div>
          <strong>{stats.approved}</strong>
          <small>Entrées approuvées en base</small>
        </article>

        <article className="shop-kpi-card shop-kpi-card--highlight">
          <div className="shop-kpi-card__top">
            <span>Temps de Traitement</span>
            <span className="material-symbols-outlined">timer</span>
          </div>
          <strong>{stats.processing}</strong>
          <small>Estimation basée sur le volume</small>
        </article>
      </section>

      <section className="shop-table-panel">
        <div className="shop-table-panel__head">
          <h2>Files de modération</h2>
          <div className="toolbar__search shop-search">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une boutique..." />
          </div>
        </div>

        <table className="shop-table">
          <thead>
            <tr>
              <th>Boutique & Artisan</th>
              <th>Date Inscription</th>
              <th>Statut</th>
              <th>Risque</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <div className="shop-owner">
                      <div className="shop-owner__thumb" />
                      <div>
                        <strong>{shop.name}</strong>
                        <small>{shop.user?.name || 'Artisan'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{shop.created_at || shop.approved_at || "Aujourd'hui"}</td>
                  <td>
                    <span className={`tag ${shop.status === 'approved' ? 'tag--success' : shop.status === 'suspended' ? 'tag--danger' : 'tag--warn'}`}>
                      {shop.status === 'approved' ? 'Approuvée' : shop.status === 'suspended' ? 'Suspendue' : 'En Attente'}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${shop.status === 'suspended' ? 'tag--danger' : shop.status === 'approved' ? 'tag--success' : 'tag--warn'}`}>
                      {shop.status === 'suspended' ? 'Élevé' : shop.status === 'approved' ? 'Faible' : 'Moyen'}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="button--ghost button--ghost-dark" type="button">
                        Consulter
                      </button>
                      {shop.status === 'suspended' ? (
                        <button className="button button--danger" type="button" onClick={() => handleDecision(shop, 'suspend')}>
                          Rejeter
                        </button>
                      ) : (
                        <button className="button" type="button" onClick={() => handleDecision(shop, 'approve')}>
                          Approuver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="admin-empty-cell">
                  Aucune boutique trouvée dans la base de données.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="shop-table-panel__footer">
          <span>Affichage des boutiques chargées depuis la base de données</span>
          <div className="pagination">
            <button type="button">&lt;</button>
            <button className="is-active" type="button">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">&gt;</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ShopModeration
