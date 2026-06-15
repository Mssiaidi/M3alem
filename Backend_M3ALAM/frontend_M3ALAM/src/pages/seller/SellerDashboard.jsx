import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerDashboard, submitSellerVerificationDocuments } from '../../api/sellerService'

const fallbackCapacity = [
  { label: 'Produits actifs', used: 0, capacity: 10, percentage: 0 },
  { label: 'Ateliers secondaires', used: 0, capacity: 10, percentage: 0 },
]

const statusConfig = {
  pending: { label: 'En attente', className: 'seller-dashboard-status--pending' },
  confirmed: { label: 'Confirmée', className: 'seller-dashboard-status--processing' },
  processing: { label: 'En préparation', className: 'seller-dashboard-status--processing' },
  shipped: { label: 'Expédiée', className: 'seller-dashboard-status--shipped' },
  delivered: { label: 'Livrée', className: 'seller-dashboard-status--delivered' },
  cancelled: { label: 'Annulée', className: 'seller-dashboard-status--cancelled' },
}

function formatAmount(value) {
  return `${Number.parseFloat(value || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}\u00A0DH`
}

function formatDateLabel(date) {
  if (!date) return 'Récemment'
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Récemment'
  return parsedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function getOrderLabel(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]
  return firstItem?.product_name || firstItem?.product?.name || order.reference || `Commande #${order.id}`
}

function getStatusBadge(order) {
  return statusConfig[order.status] ?? statusConfig.pending
}

function SellerDashboard() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [verificationStatus, setVerificationStatus] = useState('unverified')
  const [fullName, setFullName] = useState('')
  const [photoName, setPhotoName] = useState('')
  const [cinName, setCinName] = useState('')
  const [artisanCardName, setArtisanCardName] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [submittingVerification, setSubmittingVerification] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [cinFile, setCinFile] = useState(null)
  const [artisanFile, setArtisanFile] = useState(null)

  useEffect(() => {
    let active = true

    getSellerDashboard()
      .then((data) => {
        if (!active) return
        setDashboard(data)
        setVerificationStatus(data?.verification?.status || (data?.verification?.is_verified ? 'verified' : 'unverified'))
        setError('')
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Impossible de charger le dashboard vendeur.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const verification = dashboard?.verification ?? {}
  const capacityRows =
    Array.isArray(dashboard?.workshop_capacity) && dashboard.workshop_capacity.length > 0
      ? dashboard.workshop_capacity
      : fallbackCapacity
  const recentOrders = Array.isArray(dashboard?.recent_orders) ? dashboard.recent_orders : []
  const verificationTitle =
    verificationStatus === 'verified'
      ? 'Statut vérifié'
      : verificationStatus === 'pending_review'
        ? 'Statut en cours'
        : 'Statut non vérifié'
  const verificationTier =
    verificationStatus === 'verified'
      ? verification.tier || 'Documents validés'
      : verificationStatus === 'pending_review'
        ? 'Documents en cours de vérification'
        : 'Aucun document envoyé'
  const verificationLevel = verificationStatus === 'verified' ? verification.level || 'LEVEL 1' : 'LEVEL 1'

  const handleVerificationSubmit = async () => {
    if (!fullName || !photoFile || !cinFile || !artisanFile) {
      setVerificationMessage('Veuillez compléter le nom et tous les documents avant l’envoi.')
      return
    }

    const payload = new FormData()
    payload.append('full_name', fullName)
    payload.append('photo', photoFile)
    payload.append('cin', cinFile)
    payload.append('artisan_card', artisanFile)

    try {
      setSubmittingVerification(true)
      setVerificationMessage('')
      const response = await submitSellerVerificationDocuments(payload)
      setVerificationStatus(response?.verification_status || 'pending_review')
      setDashboard((current) =>
        current
          ? {
              ...current,
              verification: {
                ...(current.verification || {}),
                status: response?.verification_status || 'pending_review',
                title: 'Statut en cours',
                tier: 'Documents en cours de vérification',
                level: current.verification?.level || 'LEVEL 1',
                is_verified: false,
              },
            }
          : current,
      )
      setVerificationMessage('Documents envoyés à l’admin.')
      setFullName('')
      setPhotoName('')
      setCinName('')
      setArtisanCardName('')
      setPhotoFile(null)
      setCinFile(null)
      setArtisanFile(null)
    } catch (err) {
      setVerificationMessage(err.message || 'Impossible d’envoyer les documents.')
    } finally {
      setSubmittingVerification(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div
          className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin"
          aria-label="Chargement du dashboard vendeur"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-container-max mx-auto px-md md:px-lg py-xl">
        <div className="bg-error-container text-on-error-container px-lg py-md rounded-xl border border-error mb-md">
          {error}
        </div>
        <button
          className="flex items-center gap-xs px-md py-sm border border-outline rounded-lg font-label-md text-on-surface hover:bg-surface-container-low transition-all active:scale-95"
          onClick={() => navigate('/seller/dashboard')}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="seller-dashboard-page">
      <section className="seller-dashboard-kpis">
        <article className="seller-dashboard-card seller-dashboard-kpi">
          <div className="seller-dashboard-kpi__body">
            <span>Total Revenue</span>
            <h2>{formatAmount(dashboard?.total_sales)}</h2>
          </div>
          <div className="seller-dashboard-trend">
            <span className="material-symbols-outlined">trending_up</span>
            Données du backend
          </div>
        </article>

        <article className="seller-dashboard-card seller-dashboard-kpi">
          <div className="seller-dashboard-kpi__body">
            <span>Active Orders</span>
            <h2>{dashboard?.pending_orders ?? 0}</h2>
          </div>
          <div>
            <span className="seller-dashboard-urgent">
              <span className="material-symbols-outlined">priority_high</span>
              En attente
            </span>
          </div>
        </article>

        <article className="seller-dashboard-card seller-dashboard-kpi">
          <div className="seller-dashboard-kpi__body">
            <span>Total Products</span>
            <h2>{dashboard?.total_products ?? 0}</h2>
          </div>
          <div className="seller-dashboard-trend">
            <span className="material-symbols-outlined">inventory_2</span>
            Boutique active
          </div>
        </article>

        <article className={`seller-dashboard-verified${verificationStatus === 'verified' ? '' : ' seller-dashboard-verified--pending'}`}>
          <span className="material-symbols-outlined">
            {verificationStatus === 'verified' ? 'verified' : verificationStatus === 'pending_review' ? 'hourglass_top' : 'verified_user'}
          </span>
          <h3>{verificationTitle}</h3>
          <p>{verificationTier}</p>
          <strong>{verificationLevel}</strong>
        </article>
      </section>

      <section className="seller-dashboard-grid">
        <article className="seller-dashboard-orders">
          <header>
            <h3>Recent Orders</h3>
            <button onClick={() => navigate('/seller/orders')} type="button">
              View All
            </button>
          </header>

          <div className="seller-dashboard-order-list">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusBadge = getStatusBadge(order)
                return (
                  <button
                    className="seller-dashboard-order"
                    key={order.id}
                    type="button"
                    onClick={() => navigate(`/seller/orders/${order.id}`)}
                  >
                    <div className="seller-dashboard-order-main">
                      <p>{getOrderLabel(order)}</p>
                    </div>
                    <div className="seller-dashboard-order-side">
                      <strong>{formatAmount(order.total_amount)}</strong>
                      <small>{formatDateLabel(order.created_at)}</small>
                      <span className={statusBadge.className}>{statusBadge.label}</span>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="p-lg text-center text-on-surface-variant">
                Aucune commande récente pour le moment.
              </div>
            )}
          </div>
        </article>

        <aside className="seller-dashboard-side">
          <article className="seller-dashboard-alert seller-dashboard-verification-card">
            <span className="material-symbols-outlined seller-dashboard-verification-card__icon">warning</span>
            <div className="seller-dashboard-verification-card__content">
              <h4>Vérification du Profil</h4>

              <label className="seller-dashboard-verification-card__field">
                <span>Nom complet</span>
                <input
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Votre nom complet"
                  type="text"
                  value={fullName}
                />
              </label>

              <div className="seller-dashboard-verification-card__section-title">Documents requis</div>

              <label className="seller-dashboard-upload-row">
                <span className="seller-dashboard-upload-row__leading">
                  <span className="material-symbols-outlined">account_circle</span>
                  <span>Photo de profil</span>
                </span>
                <span className="material-symbols-outlined seller-dashboard-upload-row__trailing">upload</span>
                <input
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setPhotoName(file?.name ?? '')
                    setPhotoFile(file)
                  }}
                  type="file"
                />
              </label>
              {photoName ? <small className="seller-dashboard-verification-card__file">{photoName}</small> : null}

              <label className="seller-dashboard-upload-row">
                <span className="seller-dashboard-upload-row__leading">
                  <span className="material-symbols-outlined">badge</span>
                  <span>CIN (identité)</span>
                </span>
                <span className="material-symbols-outlined seller-dashboard-upload-row__trailing">upload</span>
                <input
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setCinName(file?.name ?? '')
                    setCinFile(file)
                  }}
                  type="file"
                />
              </label>
              {cinName ? <small className="seller-dashboard-verification-card__file">{cinName}</small> : null}

              <label className="seller-dashboard-upload-row">
                <span className="seller-dashboard-upload-row__leading">
                  <span className="material-symbols-outlined">description</span>
                  <span>Carte d'Artisan</span>
                </span>
                <span className="material-symbols-outlined seller-dashboard-upload-row__trailing">upload</span>
                <input
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setArtisanCardName(file?.name ?? '')
                    setArtisanFile(file)
                  }}
                  type="file"
                />
              </label>
              {artisanCardName ? <small className="seller-dashboard-verification-card__file">{artisanCardName}</small> : null}

              <button
                className="seller-dashboard-verification-card__submit"
                type="button"
                onClick={handleVerificationSubmit}
                disabled={submittingVerification}
              >
                {submittingVerification ? 'Envoi...' : 'Envoyer pour vérification'}
              </button>
              <p className="seller-dashboard-verification-card__note">
                Vos documents seront examinés par notre équipe administrative.
              </p>
              <strong className="seller-dashboard-verification-card__level">{verificationLevel}</strong>
              {verificationMessage ? <small className="seller-dashboard-verification-card__file">{verificationMessage}</small> : null}
            </div>
          </article>

          <article className="seller-dashboard-capacity">
            <h4>Workshop Capacity</h4>
            {capacityRows.map((row) => (
              <div className="seller-dashboard-progress-row" key={row.label}>
                <div>
                  <span>{row.label}</span>
                  <span>{row.percentage}% Used</span>
                </div>
                <div className="seller-dashboard-progress" aria-label={`${row.label} capacity`}>
                  <span style={{ width: `${row.percentage}%` }} />
                </div>
                <div className="seller-dashboard-progress-meta">
                  <span>{row.used} utilisés</span>
                  <span>{row.capacity} places</span>
                </div>
              </div>
            ))}
          </article>
        </aside>
      </section>
    </div>
  )
}

export default SellerDashboard
