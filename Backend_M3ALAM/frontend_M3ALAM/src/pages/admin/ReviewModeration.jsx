import { useEffect, useState } from 'react'
import { apiRequest, unwrapData } from '../../api/api'

function ReviewModeration() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const payload = await apiRequest('/admin/reviews')
        if (!active) return
        setReviews(unwrapData(payload))
      } catch (err) {
        if (!active) return
        setReviews([])
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
          <span className="tag">Modération avis</span>
          <h1>Gardez la confiance avec une revue rapide des commentaires.</h1>
          <p>
            Triez les avis litigieux, validez les retours légitimes et réduisez les
            faux positifs.
          </p>
        </div>

        <div className="surface-card">
          <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric">
              <span>À traiter</span>
              <strong>46</strong>
            </div>
            <div className="metric">
              <span>Signalements</span>
              <strong>12</strong>
            </div>
            <div className="metric">
              <span>Validés</span>
              <strong>128</strong>
            </div>
          </div>
        </div>
      </section>

      {!reviews.length ? (
        <div className="surface-card">
          <p className="muted" style={{ margin: 0 }}>
            Aucun avis chargé. Un accès administrateur est nécessaire pour consulter
            cette page.
          </p>
        </div>
      ) : null}

      <section className="surface-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Boutique</th>
              <th>État</th>
              <th>Motif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>#{review.id}</td>
                <td>{review.user?.name || 'Utilisateur'}</td>
                <td>
                  <span className="tag tag--warn">En attente</span>
                </td>
                <td>{review.comment || 'Aucun commentaire'}</td>
                <td>
                  <div className="action-row">
                    <button className="button--ghost">Inspecter</button>
                    <button className="button--ghost">Archiver</button>
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

export default ReviewModeration
