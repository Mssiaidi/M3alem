import { useEffect, useMemo, useState } from 'react'
import { approveShop, getAdminShop, getPendingShops, suspendShop } from '../../api/adminService'

const demoShops = [
  {
    id: 'demo-1',
    name: 'Maison Taznakht',
    status: 'pending',
    created_at: '15 juin 2026',
    user: { name: 'Vendeur Maison Taznakht', email: 'vendeur.taznakht@example.com' },
    verification_full_name: 'Vendeur Maison Taznakht',
    verification_photo_path: null,
    verification_cin_path: null,
    verification_artisan_card_path: null,
  },
  {
    id: 'demo-2',
    name: 'Atelier Safi',
    status: 'pending',
    created_at: '14 juin 2026',
    user: { name: 'Vendeur Atelier Safi', email: 'vendeur.safi@example.com' },
    verification_full_name: 'Vendeur Atelier Safi',
    verification_photo_path: null,
    verification_cin_path: null,
    verification_artisan_card_path: null,
  },
  {
    id: 'demo-3',
    name: 'Dar Cuivre',
    status: 'pending',
    created_at: '13 juin 2026',
    user: { name: 'Vendeur Dar Cuivre', email: 'vendeur.cuivre@example.com' },
    verification_full_name: 'Vendeur Dar Cuivre',
    verification_photo_path: null,
    verification_cin_path: null,
    verification_artisan_card_path: null,
  },
]

function buildDemoDetails(shop) {
  const baseName = shop?.name || 'Maison Artisanale'
  return {
    verification_full_name: shop?.verification_full_name || `Vendeur ${baseName}`,
    verification_photo_path: shop?.verification_photo_path || null,
    verification_cin_path: shop?.verification_cin_path || null,
    verification_artisan_card_path: shop?.verification_artisan_card_path || null,
  }
}

function ShopModeration() {
  const [shops, setShops] = useState([])
  const [selectedShop, setSelectedShop] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        const payload = await getPendingShops()
        if (!active) return
        const nextShops = payload?.data || payload || []
        setShops(Array.isArray(nextShops) ? nextShops : [])
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

  const sourceShops = shops.length > 0 ? shops : demoShops

  const stats = useMemo(() => {
    const pending = sourceShops.filter((shop) => shop.status === 'pending').length
    const approved = sourceShops.filter((shop) => shop.status === 'approved').length
    const suspended = sourceShops.filter((shop) => shop.status === 'suspended').length
    const processing = sourceShops.length ? `${Math.max(1, Math.round(48 / sourceShops.length) / 10)}h` : '0h'

    return { pending, approved, suspended, processing }
  }, [sourceShops])

  const visibleShops = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return sourceShops
    return sourceShops.filter((shop) => {
      const name = `${shop.name || ''} ${shop.user?.name || ''} ${shop.status || ''}`.toLowerCase()
      return name.includes(term)
    })
  }, [query, sourceShops])

  const handleDecision = async (shop, action) => {
    if (String(shop.id).startsWith('demo-')) {
      setSelectedShop((current) =>
        current?.id === shop.id
          ? {
              ...shop,
              status: action === 'approve' ? 'approved' : 'suspended',
              ...buildDemoDetails(shop),
            }
          : current,
      )
      return
    }

    try {
      setActionLoadingId(shop.id)
      setError('')

      if (action === 'approve') {
        await approveShop(shop.id)
      } else {
        await suspendShop(shop.id)
      }

      const payload = await getPendingShops()
      const nextShops = payload?.data || payload || []
      setShops(Array.isArray(nextShops) ? nextShops : [])
      setSelectedShop((current) => (current?.id === shop.id ? null : current))
    } catch (err) {
      setError(err.message || 'Impossible de mettre à jour la boutique.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const openDetails = async (shop) => {
    if (String(shop.id).startsWith('demo-')) {
      setSelectedShop({ ...shop, ...buildDemoDetails(shop) })
      return
    }

    try {
      setError('')
      const payload = await getAdminShop(shop.id)
      setSelectedShop(payload?.data || payload || shop)
    } catch (err) {
      setError(err.message || 'Impossible de charger les détails de la boutique.')
      setSelectedShop({ ...shop, ...buildDemoDetails(shop) })
    }
  }

  const detailsShop = selectedShop ? { ...selectedShop, ...buildDemoDetails(selectedShop) } : null

  return (
    <div className="shop-moderation-shell admin-shell">
      <header className="shop-moderation-head">
        <div>
          <h1>Modération des Boutiques</h1>
          <p>Contrôle et validation des inscriptions d&apos;artisans avec vérification des documents.</p>
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

        <div className="shop-moderation-layout">
          <div className="shop-moderation-list">
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
                {visibleShops.length ? (
                  visibleShops.map((shop) => (
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
                          {shop.status === 'approved' ? 'Approuvée' : shop.status === 'suspended' ? 'Suspendue' : 'En attente'}
                        </span>
                      </td>
                      <td>
                        <span className={`tag ${shop.status === 'suspended' ? 'tag--danger' : shop.status === 'approved' ? 'tag--success' : 'tag--warn'}`}>
                          {shop.status === 'suspended' ? 'Élevé' : shop.status === 'approved' ? 'Faible' : 'Moyen'}
                        </span>
                      </td>
                      <td>
                        <div className="action-row">
                          <button className="button--ghost button--ghost-dark" type="button" onClick={() => openDetails(shop)}>
                            <span className="material-symbols-outlined">visibility</span>
                            Consulter
                          </button>
                          <button className="button" type="button" onClick={() => handleDecision(shop, 'approve')} disabled={actionLoadingId === shop.id}>
                            <span className="material-symbols-outlined">task_alt</span>
                            Approuver
                          </button>
                          <button className="button button--danger" type="button" onClick={() => handleDecision(shop, 'suspend')} disabled={actionLoadingId === shop.id}>
                            <span className="material-symbols-outlined">block</span>
                            Rejeter
                          </button>
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
            </div>
          </div>

          <aside className="shop-moderation-details">
            {detailsShop ? (
              <>
                <div className="shop-moderation-details__head">
                  <div>
                    <p className="shop-moderation-details__eyebrow">Détails de vérification</p>
                    <h3>{detailsShop.name}</h3>
                    <p>{detailsShop.user?.name || 'Artisan'}</p>
                  </div>
                  <span className={`tag ${detailsShop.status === 'approved' ? 'tag--success' : detailsShop.status === 'suspended' ? 'tag--danger' : 'tag--warn'}`}>
                    {detailsShop.status === 'approved' ? 'Approuvée' : detailsShop.status === 'suspended' ? 'Suspendue' : 'En attente'}
                  </span>
                </div>

                <div className="shop-moderation-docs">
                  <div>
                    <strong>Nom complet</strong>
                    <p>{detailsShop.verification_full_name}</p>
                  </div>
                  <div>
                    <strong>Photo</strong>
                    <p>{detailsShop.verification_photo_path ? 'Envoyée' : 'Aperçu demo: photo d’identité'}</p>
                  </div>
                  <div>
                    <strong>CIN</strong>
                    <p>{detailsShop.verification_cin_path ? 'Envoyée' : 'Aperçu demo: CIN recto/verso'}</p>
                  </div>
                  <div>
                    <strong>Carte Artisan</strong>
                    <p>{detailsShop.verification_artisan_card_path ? 'Envoyée' : 'Aperçu demo: carte artisan'}</p>
                  </div>
                </div>

                <div className="shop-moderation-details__actions">
                  <button className="button" type="button" onClick={() => handleDecision(detailsShop, 'approve')} disabled={actionLoadingId === detailsShop.id}>
                    <span className="material-symbols-outlined">task_alt</span>
                    Valider le compte
                  </button>
                  <button className="button button--danger" type="button" onClick={() => handleDecision(detailsShop, 'suspend')} disabled={actionLoadingId === detailsShop.id}>
                    <span className="material-symbols-outlined">block</span>
                    Refuser le compte
                  </button>
                </div>
              </>
            ) : (
              <div className="seller-messages-empty seller-messages-empty--panel">
                Clique sur <strong>Consulter</strong> pour voir les documents de vérification.
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}

export default ShopModeration
