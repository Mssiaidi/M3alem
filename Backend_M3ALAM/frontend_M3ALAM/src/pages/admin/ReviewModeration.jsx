import { useEffect, useMemo, useState } from 'react'
import { apiRequest, unwrapData } from '../../api/api'

function ReviewModeration() {
  const [reviews, setReviews] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const payload = await apiRequest('/admin/reviews')
        if (!active) return
        setReviews(unwrapData(payload))
      } catch (err) {
        if (!active) return
        setError(
          err.message === 'Erreur API'
            ? 'Accès refusé. Connectez-vous avec un compte administrateur.'
            : err.message || 'Impossible de charger les avis.',
        )
        setReviews([])
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = reviews.length || 0
    const flagged = total ? Math.max(1, Math.ceil(total * 0.3)) : 12
    const approved = total ? Math.max(1, total - flagged) : 128
    return {
      total,
      flagged,
      approved,
      approvalRate: total ? Math.round((approved / total) * 100) : 84,
    }
  }, [reviews])

  const topArtisans = [
    ['Atelier Bois Noir', '4.9/5 (128 avis)'],
    ['Céramique d’Azur', '4.8/5 (92 avis)'],
  ]

  return (
    <div className="review-moderation-shell">
      <div className="new-product-breadcrumbs">
        <span>M3alem Marketplace</span>
        <span>›</span>
        <strong>Modération des Avis</strong>
      </div>

      <header className="review-moderation-head">
        <div>
          <h1>File de Modération</h1>
          <p>Gestion des signalements et validation de la qualité.</p>
        </div>
        <div className="review-alert-pill">
          <span className="material-symbols-outlined">warning</span>
          12 Signalements en attente
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <div className="review-moderation-layout">
        <section className="review-feed">
          {(reviews.length ? reviews : [
            {
              id: 1,
              user: { name: 'Jean Dupont' },
              comment:
                'Le vase reçu est magnifique. Les détails sont encore plus beaux en vrai. Cependant, la livraison a pris 3 jours de plus que prévu.',
              rating: 4,
              product_name: 'Vase Azur Artisanal',
              status: 'approved',
              created_at: 'il y a 2 heures',
            },
            {
              id: 2,
              user: { name: 'Utilisateur_4502' },
              comment:
                "C'est une honte, le produit est cassé et le vendeur ne répond pas.",
              rating: 1,
              product_name: 'Table en Noyer Massif',
              status: 'flagged',
              created_at: 'il y a 5 heures',
            },
            {
              id: 3,
              user: { name: 'Marie Claire' },
              comment:
                'Je commande régulièrement et la qualité est toujours au rendez-vous. Le service client est très réactif.',
              rating: 5,
              product_name: 'Service de Table complet',
              status: 'approved',
              created_at: 'il y a 1 jour',
            },
          ]).map((review, index) => {
            const isFlagged = review.status === 'flagged' || index === 1
            const rating = review.rating || (isFlagged ? 1 : 5)

            return (
              <article
                className={`review-card ${isFlagged ? 'is-flagged' : ''}`}
                key={review.id}
              >
                <div className="review-card__head">
                  <div className="review-user">
                    <div className="review-avatar">👤</div>
                    <div>
                      <strong>{review.user?.name || 'Utilisateur'}</strong>
                      <span>Client vérifié · {review.created_at || 'il y a quelques instants'}</span>
                    </div>
                  </div>
                  <div className={`review-stars ${isFlagged ? 'is-flagged' : ''}`}>
                    {'★'.repeat(rating)}
                    {'☆'.repeat(Math.max(0, 5 - rating))}
                  </div>
                </div>

                <h3>{isFlagged ? 'ARNAQUE !!! NE PAS ACHETER' : 'Excellent travail de poterie'}</h3>
                <p>{review.comment}</p>

                {isFlagged ? (
                  <div className="review-quote">
                    <strong>Motif du signalement :</strong> Promotion d&apos;un concurrent / Langage inapproprié
                  </div>
                ) : null}

                <div className="review-card__footer">
                  <div>
                    <span>PRODUIT:</span> {review.product_name || 'Produit lié'}
                  </div>
                  <div className="review-actions">
                    <button className="button--ghost button--ghost-dark" type="button">
                      <span className="material-symbols-outlined">close</span>
                      Rejeter
                    </button>
                    <button className="button" type="button">
                      <span className="material-symbols-outlined">task_alt</span>
                      {isFlagged ? 'Supprimer l’avis' : 'Approuver l’avis'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
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
                <span>Ce mois</span>
                <strong>1.2k</strong>
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
              {topArtisans.map(([name, note]) => (
                <div className="top-artisan" key={name}>
                  <div className="top-artisan__thumb" />
                  <div>
                    <strong>{name}</strong>
                    <span>{note}</span>
                  </div>
                  <span className="top-artisan__star">★</span>
                </div>
              ))}
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
