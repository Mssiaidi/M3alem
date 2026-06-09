import { useEffect, useMemo, useState } from 'react'
import { deleteAdminReview, getAdminReviews } from '../../api/adminService'

function ReviewModeration() {
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
        const payload = await getAdminReviews()
        if (!active) return
        setReviews(payload?.data || payload || [])
      } catch (err) {
        if (!active) return
        setError(
          err.message === 'Erreur API'
            ? 'Accès refusé. Connectez-vous avec un compte administrateur.'
            : err.message || 'Impossible de charger les avis.',
        )
        setReviews([])
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
    const total = reviews.length
    const flagged = reviews.filter((review) => Number(review.rating || 0) <= 2).length
    const approved = reviews.filter((review) => Number(review.rating || 0) >= 4).length
    const approvalRate = total ? Math.round((approved / total) * 100) : 0
    return { total, flagged, approved, approvalRate }
  }, [reviews])

  const visibleReviews = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return reviews
    return reviews.filter((review) => {
      const haystack = `${review.user?.name || ''} ${review.comment || ''} ${review.order?.reference || ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [query, reviews])

  const topUsers = useMemo(() => {
    const grouped = new Map()
    reviews.forEach((review) => {
      const name = review.user?.name || 'Client'
      const current = grouped.get(name) || { total: 0, count: 0 }
      current.total += Number(review.rating || 0)
      current.count += 1
      grouped.set(name, current)
    })

    return Array.from(grouped.entries())
      .map(([name, info]) => ({
        name,
        score: info.count ? (info.total / info.count).toFixed(1) : '0.0',
        count: info.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
  }, [reviews])

  async function handleDelete(reviewId) {
    try {
      await deleteAdminReview(reviewId)
      setReviews((current) => current.filter((review) => review.id !== reviewId))
    } catch (err) {
      setError(err.message || 'Impossible de supprimer l’avis.')
    }
  }

  return (
    <div className="review-moderation-shell admin-shell">
      <header className="review-moderation-head">
        <div>
          <h1>Modération des Avis</h1>
          <p>Gestion des signalements et validation de la qualité depuis la base de données.</p>
        </div>
        <div className="review-alert-pill">
          <span className="material-symbols-outlined">warning</span>
          {stats.flagged} Signalements en attente
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="admin-state-note">Chargement des avis depuis la base de données...</p> : null}

      <div className="review-moderation-layout">
        <section className="review-feed">
          <div className="review-panel-head">
            <div>
              <h2>File de Modération</h2>
              <p>Les cartes ci-dessous viennent de la base de données.</p>
            </div>
            <div className="toolbar__search review-search">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un avis..." />
            </div>
          </div>

          {visibleReviews.length ? (
            visibleReviews.map((review) => {
              const isFlagged = Number(review.rating || 0) <= 2
              const rating = Number(review.rating || 0)

              return (
                <article className={`review-card ${isFlagged ? 'is-flagged' : ''}`} key={review.id}>
                  {isFlagged ? (
                    <div className="review-badge">
                      <span className="material-symbols-outlined">report</span>
                      SIGNALÉ
                    </div>
                  ) : null}
                  <div className="review-card__head">
                    <div className="review-user">
                      <div className="review-avatar">👤</div>
                      <div>
                        <strong>{review.user?.name || 'Utilisateur'}</strong>
                        <span>{isFlagged ? 'Achat non vérifié' : 'Client vérifié'} · {review.created_at || 'il y a quelques instants'}</span>
                      </div>
                    </div>
                    <div className={`review-stars ${isFlagged ? 'is-flagged' : ''}`}>
                      {'★'.repeat(Math.max(0, rating))}
                      {'☆'.repeat(Math.max(0, 5 - rating))}
                    </div>
                  </div>

                  <h3>{isFlagged ? 'ARNAQUE !!! NE PAS ACHETER' : 'Excellent travail de poterie'}</h3>
                  <p>{review.comment || 'Aucun commentaire'}</p>

                  {isFlagged ? (
                    <div className="review-quote">
                      <strong>Motif du signalement :</strong> Note faible / commentaire sensible
                    </div>
                  ) : null}

                  <div className="review-card__footer">
                    <div>
                      <span>PRODUIT:</span> {review.order?.reference || 'Commande liée'}
                    </div>
                    <div className="review-actions">
                      <button className="button--ghost button--ghost-dark" type="button">
                        <span className="material-symbols-outlined">close</span>
                        Rejeter
                      </button>
                      <button className="button" type="button" onClick={() => handleDelete(review.id)}>
                        <span className="material-symbols-outlined">delete</span>
                        {isFlagged ? 'Supprimer l’avis' : 'Approuver l’avis'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="review-empty-state">Aucun avis trouvé dans la base de données.</div>
          )}
        </section>

        <aside className="review-side">
          <article className="review-side-panel">
            <h2>Statistiques Rapides</h2>
            <div className="review-rate">
              <span>Taux d&apos;approbation</span>
              <strong>{stats.approvalRate}%</strong>
            </div>
            <div className="review-rate-bar">
              <div style={{ width: `${stats.approvalRate}%` }} />
            </div>
            <div className="review-side-stats">
              <div>
                <span>Total</span>
                <strong>{stats.total}</strong>
                <small>Avis reçus</small>
              </div>
              <div>
                <span>Signalés</span>
                <strong>{stats.flagged}</strong>
                <small>Actions requises</small>
              </div>
            </div>
          </article>

          <article className="review-side-panel">
            <h2>Top Artisans du Moment</h2>
            <div className="top-artisans">
              {topUsers.length ? (
                topUsers.map((user) => (
                  <div className="top-artisan" key={user.name}>
                    <div className="top-artisan__thumb" />
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.score}/5 ({user.count} avis)</span>
                    </div>
                    <span className="top-artisan__star">★</span>
                  </div>
                ))
              ) : (
                <div className="review-empty-state">Aucun classement disponible.</div>
              )}
            </div>
            <button className="button--ghost button--ghost-dark review-side-button" type="button">
              Voir tout le classement
            </button>
          </article>
        </aside>
      </div>
    </div>
  )
}

export default ReviewModeration
