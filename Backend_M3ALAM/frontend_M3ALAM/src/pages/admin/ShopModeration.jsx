import { useEffect, useMemo, useState } from 'react'
import { approveShop, getPendingShops, suspendShop } from '../../api/adminService'

function ShopModeration() {
  const [shops, setShops] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const payload = await getPendingShops()
        if (!active) return
        setShops(payload)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger les boutiques.')
        setShops([])
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = shops.length || 24
    const riskHigh = shops.filter((shop) => shop.status === 'suspended').length || 3
    const validated = Math.max(0, 15 - riskHigh)
    return {
      pending: total,
      riskHigh,
      validated,
      processing: '4.2h',
    }
  }, [shops])

  const fallbackShops = [
    {
      id: 1,
      name: 'Atelier Maroquinerie Atlas',
      user: { name: 'Yassine El Fassi' },
      created_at: '14 Oct 2023, 09:45',
      status: 'pending',
      risk: 'Faible',
    },
    {
      id: 2,
      name: 'Céramique de Safi Design',
      user: { name: 'Laila Benjelloun' },
      created_at: '13 Oct 2023, 16:20',
      status: 'pending',
      risk: 'Moyen',
    },
    {
      id: 3,
      name: 'Tissage Berbère Authentique',
      user: { name: 'Inconnu (Doc. manquants)' },
      created_at: '13 Oct 2023, 14:05',
      status: 'pending',
      risk: 'Élevé',
    },
  ]

  const rows = shops.length ? shops : fallbackShops

  return (
    <div className="shop-moderation-shell">
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

      <section className="shop-kpi-grid">
        <article className="shop-kpi-card">
          <div className="shop-kpi-card__top">
            <span>Total En Attente</span>
            <span className="material-symbols-outlined">assignment_add</span>
          </div>
          <strong>{stats.pending}</strong>
          <small>+12% cette semaine</small>
        </article>

        <article className="shop-kpi-card">
          <div className="shop-kpi-card__top">
            <span>Risque Élevé</span>
            <span className="material-symbols-outlined">warning</span>
          </div>
          <strong>{String(stats.riskHigh).padStart(2, '0')}</strong>
          <small>Action immédiate requise</small>
        </article>

        <article className="shop-kpi-card">
          <div className="shop-kpi-card__top">
            <span>Validés Aujourd&apos;hui</span>
            <span className="material-symbols-outlined">verified</span>
          </div>
          <strong>{stats.validated}</strong>
          <small>Performance stable</small>
        </article>

        <article className="shop-kpi-card shop-kpi-card--highlight">
          <div className="shop-kpi-card__top">
            <span>Temps de Traitement</span>
            <span className="material-symbols-outlined">timer</span>
          </div>
          <strong>{stats.processing}</strong>
          <small>-20m vs hier</small>
        </article>
      </section>

      <section className="shop-table-panel">
        <div className="shop-table-panel__head">
          <h2>Files de modération</h2>
          <div className="toolbar__search shop-search">
            <input placeholder="Rechercher une boutique..." />
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
            {rows.map((shop) => (
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
                <td>{shop.created_at || "Aujourd'hui"}</td>
                <td>
                  <span className="tag tag--warn">En Attente</span>
                </td>
                <td>
                  <span className={`tag ${shop.risk === 'Élevé' ? 'tag--danger' : shop.risk === 'Moyen' ? 'tag--warn' : 'tag--success'}`}>
                    {shop.risk || 'Faible'}
                  </span>
                </td>
                <td>
                  <div className="action-row">
                    <button className="button--ghost button--ghost-dark" type="button">
                      Consulter
                    </button>
                    {shop.risk === 'Élevé' ? (
                      <button className="button button--danger" type="button" onClick={() => suspendShop(shop.id)}>
                        Rejeter
                      </button>
                    ) : (
                      <button className="button" type="button" onClick={() => approveShop(shop.id)}>
                        Approuver
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="shop-table-panel__footer">
          <span>Affichage de 1-3 sur 24 boutiques</span>
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
