import { useEffect, useState } from 'react'
import { deleteReview, getAdminReviews } from '../lib/api'

const stars = (rating) => '★★★★★'.slice(0, Math.max(0, Number(rating) || 0))

export default function AdminReviewModeration() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await getAdminReviews()
      setReviews(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleDelete = async (id) => {
    await deleteReview(id)
    refresh()
  }

  return (
    <section className="admin-page">
      <div className="admin-page__shell">
        <aside className="admin-sidebar">
          <div>
            <p className="eyebrow">Artisan Portal</p>
            <h1>Modération des avis</h1>
            <p className="muted">Lecture rapide, suppression ciblée, suivi des signalements.</p>
          </div>
          <div className="admin-sidebar__stats">
            <div className="admin-kpi">
              <span>Avis chargés</span>
              <strong>{reviews.length}</strong>
            </div>
            <div className="admin-kpi">
              <span>Signalement</span>
              <strong>Actif</strong>
            </div>
          </div>
        </aside>

        <main className="admin-content">
          <div className="section__head">
            <div>
              <p className="eyebrow">Avis</p>
              <h2>File de modération</h2>
              <p>{loading ? 'Chargement des avis...' : `${reviews.length} avis à examiner`}</p>
            </div>
          </div>

          <div className="admin-stack">
            {reviews.map((review) => (
              <article className="admin-card" key={review.id}>
                <div className="admin-card__head">
                  <div>
                    <h3>{review.user?.name || 'Client anonyme'}</h3>
                    <p className="muted">Commande {review.order?.reference || `#${review.order_id}`}</p>
                  </div>
                  <span className="pill pill--accent">{stars(review.rating)}</span>
                </div>

                <p className="admin-card__text">{review.comment || 'Aucun commentaire.'}</p>

                <div className="admin-card__meta">
                  <span>Note: {review.rating}/5</span>
                  <span>ID #{review.id}</span>
                </div>

                <div className="admin-card__actions">
                  <button className="button--ghost button--ghost--dark" type="button" onClick={() => handleDelete(review.id)}>
                    Supprimer l'avis
                  </button>
                </div>
              </article>
            ))}

            {!loading && reviews.length === 0 ? <p className="muted">Aucun avis à modérer.</p> : null}
          </div>
        </main>
      </div>
    </section>
  )
}
