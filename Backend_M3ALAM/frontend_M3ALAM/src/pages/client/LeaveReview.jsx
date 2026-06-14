import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrder } from '../../api/orderService'
import { submitReview } from '../../api/reviewService'

const maxReviewLength = 1000
const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23d3e4fe'/%3E%3Ctext x='40' y='45' text-anchor='middle' font-family='Arial' font-size='13' fill='%23444653'%3E80 x 80%3C/text%3E%3C/svg%3E"

function formatDate(date) {
  if (!date) return '-'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return '-'

  const day = parsedDate.toLocaleDateString('fr-FR', { day: '2-digit' })
  const month = parsedDate.toLocaleDateString('fr-FR', { month: 'long' })
  const year = parsedDate.toLocaleDateString('fr-FR', { year: 'numeric' })

  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}, ${year}`
}

function normalizeOrder(order) {
  if (!order) return null

  const reference = order.reference ?? order.numero ?? `ORD-${order.id}`

  return {
    ...order,
    reference: reference.startsWith('#') ? reference : `#${reference}`,
    status: order.status ?? order.statut,
    deliveredAt: order.delivered_at ?? order.updated_at ?? order.created_at,
    items: Array.isArray(order.items) ? order.items : [],
  }
}

function getProductImage(item) {
  return item?.product?.images?.[0]?.path ?? placeholderImage
}

function StarRating({ label, rating, onChange, required = false, large = false }) {
  return (
    <div>
      <div className={large ? 'leave-review-rating-title' : 'leave-review-rating-row'}>
        <label className={large ? 'leave-review-overall-label' : 'leave-review-label'}>{label}</label>
        {required ? <span className="leave-review-required">Requis</span> : null}
      </div>

      <div className={large ? 'leave-review-stars leave-review-stars--large' : 'leave-review-stars'}>
        {[1, 2, 3, 4, 5].map((value) => {
          const selected = value <= rating

          return (
            <button
              aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
              className="leave-review-star material-symbols-outlined"
              key={value}
              onClick={() => onChange(value)}
              style={{
                color: selected ? '#ffc107' : '#757684',
                fontVariationSettings: selected ? "'FILL' 1" : "'FILL' 0",
              }}
              type="button"
            >
              star
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LeaveReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [overallRating, setOverallRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [shippingRating, setShippingRating] = useState(0)
  const [communicationRating, setCommunicationRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getOrder(id)
      .then((data) => {
        if (!active) return

        const nextOrder = normalizeOrder(data)
        if (!nextOrder || nextOrder.status !== 'delivered') {
          navigate('/orders', { replace: true })
          return
        }

        setOrder(nextOrder)
        setError('')
      })
      .catch(() => {
        if (active) navigate('/orders', { replace: true })
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, navigate])

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    }
  }, [selectedPhotos])

  const product = useMemo(() => {
    const item = order?.items?.[0]

    return {
      image: getProductImage(item),
      name: item?.product_name ?? item?.product?.name ?? 'Vase Azur Artisanal',
      shop: item?.shop?.name ?? item?.product?.shop?.name ?? 'Atelier Nord',
    }
  }, [order])

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files ?? [])
      .filter((file) => ['image/png', 'image/jpeg'].includes(file.type) && file.size <= 10 * 1024 * 1024)
      .slice(0, 4)

    selectedPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl))
    setSelectedPhotos(files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!overallRating || !qualityRating || !shippingRating || !communicationRating) {
      setError('Veuillez compléter toutes les notes avant d’envoyer votre avis.')
      return
    }

    try {
      setSubmitting(true)
      await submitReview({
        order_id: Number(id),
        rating: overallRating,
        comment: reviewText.trim(),
      })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message || 'Impossible d’envoyer votre avis.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="leave-review-loading">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" aria-label="Chargement de la commande" />
      </div>
    )
  }

  if (submitted) {
    return (
      <main className="leave-review-success-page">
        <div className="leave-review-success-card">
          <div className="leave-review-check-wrap">
            <div className="leave-review-check">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <h1>Merci pour votre retour !</h1>
          <p>
            Votre avis a été publié avec succès ! Votre expérience aide la communauté M3alem à découvrir le meilleur de l'artisanat.
          </p>
          <button className="leave-review-primary-action" onClick={() => navigate('/orders')} type="button">
            Retour aux commandes
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="leave-review-page">
      <div className="leave-review-container">
        <header className="leave-review-header">
          <h1>Partagez votre avis</h1>
          <div className="leave-review-order-meta">
            <span className="material-symbols-outlined">receipt</span>
            <span>Commande {order?.reference}</span>
            <span>•</span>
            <span className="material-symbols-outlined">calendar_today</span>
            <span>Livrée le {formatDate(order?.deliveredAt)}</span>
          </div>
        </header>

        <section className="leave-review-product-card">
          <div className="leave-review-product-media">
            <img alt={product.name} src={product.image} />
          </div>
          <div>
            <div className="leave-review-product-status">Livraison réussie</div>
            <h2>{product.name}</h2>
            <p>
              Créé par <span>{product.shop}</span>
            </p>
          </div>
        </section>

        <form className="leave-review-form-card" onSubmit={handleSubmit}>
          <section className="leave-review-section leave-review-section--overall">
            <StarRating label="Satisfaction générale" large onChange={setOverallRating} rating={overallRating} />
            <p>Cliquez pour noter</p>
          </section>

          <section className="leave-review-section">
            <StarRating label="Qualité du produit" onChange={setQualityRating} rating={qualityRating} required />
          </section>

          <section className="leave-review-section">
            <StarRating label="Vitesse de livraison" onChange={setShippingRating} rating={shippingRating} />
          </section>

          <section className="leave-review-section">
            <StarRating label="Communication de l'artisan" onChange={setCommunicationRating} rating={communicationRating} />
          </section>

          <section className="leave-review-section">
            <label className="leave-review-label">
              Photos <span>(Optionnel)</span>
            </label>
            <input
              accept="image/png,image/jpeg"
              multiple
              onChange={handlePhotoChange}
              ref={fileInputRef}
              type="file"
            />
            <button className="leave-review-upload" onClick={() => fileInputRef.current?.click()} type="button">
              <span className="material-symbols-outlined">photo_camera</span>
              <strong>Partagez une photo de votre article chez vous</strong>
              <small>PNG ou JPG, jusqu'à 10MB</small>
            </button>

            {selectedPhotos.length > 0 ? (
              <div className="leave-review-photo-grid">
                {selectedPhotos.map((photo) => (
                  <img alt={photo.file.name} key={photo.previewUrl} src={photo.previewUrl} />
                ))}
              </div>
            ) : null}
          </section>

          <section className="leave-review-written">
            <label className="leave-review-label" htmlFor="review-text">
              Votre avis écrit
            </label>
            <textarea
              id="review-text"
              maxLength={maxReviewLength}
              onChange={(event) => setReviewText(event.target.value.slice(0, maxReviewLength))}
              placeholder="Décrivez votre expérience avec cet artisanat..."
              rows="6"
              value={reviewText}
            />
            <div className="leave-review-counter">
              {reviewText.length} / {maxReviewLength} caractères
            </div>
            <p>Votre avis sera publié sur le profil de l'artisan.</p>
          </section>

          {error ? <div className="leave-review-error">{error}</div> : null}

          <div className="leave-review-actions">
            <button className="leave-review-cancel" onClick={() => navigate('/orders')} type="button">
              Annuler
            </button>
            <button className="leave-review-submit" disabled={submitting} type="submit">
              <span>{submitting ? 'Envoi...' : 'Envoyer mon avis'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default LeaveReview
