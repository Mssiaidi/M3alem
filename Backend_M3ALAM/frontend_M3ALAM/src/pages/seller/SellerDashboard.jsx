import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerDashboard } from '../../api/sellerService'

const fallbackVerification = {
  title: 'Verified Master',
  tier: 'Top 5% Artisan Tier',
  level: 'LEVEL 4',
  is_verified: true,
}

const fallbackCapacity = [
  { label: 'Produits actifs', used: 0, capacity: 10, percentage: 0 },
  { label: 'Ateliers secondaires', used: 0, capacity: 10, percentage: 0 },
]

const statusConfig = {
  pending: {
    label: 'En attente',
    className: 'seller-dashboard-status--pending',
  },
  confirmed: {
    label: 'Confirmée',
    className: 'seller-dashboard-status--processing',
  },
  processing: {
    label: 'En préparation',
    className: 'seller-dashboard-status--processing',
  },
  shipped: {
    label: 'Expédiée',
    className: 'seller-dashboard-status--shipped',
  },
  delivered: {
    label: 'Livrée',
    className: 'seller-dashboard-status--delivered',
  },
  cancelled: {
    label: 'Annulée',
    className: 'seller-dashboard-status--cancelled',
  },
}

function formatAmount(value) {
  return `${Number.parseFloat(value || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`
}

function formatDateLabel(date) {
  if (!date) return 'Récemment'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Récemment'

  return parsedDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  })
}

function getOrderLabel(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]

  return firstItem?.product_name || firstItem?.product?.name || order.reference || `Commande #${order.id}`
}

function getOrderSubtitle(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]
  const reference = order.reference || `ORD-${order.id}`
  const dateLabel = formatDateLabel(order.created_at)

  return `${firstItem?.product_name || firstItem?.product?.name || 'Commande'} • ${reference} • ${dateLabel}`
}

function getOrderIcon(order) {
  if (order.status === 'delivered') return 'task_alt'
  if (order.status === 'shipped') return 'local_shipping'
  if (order.status === 'processing') return 'auto_fix'
  if (order.status === 'confirmed') return 'check_circle'

  return 'shopping_bag'
}

function getStatusBadge(order) {
  return statusConfig[order.status] ?? statusConfig.pending
}

function SellerDashboard() {
  const navigate = useNavigate()
  const documentInputRef = useRef(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [documentName, setDocumentName] = useState('')

  useEffect(() => {
    let active = true

    getSellerDashboard()
      .then((data) => {
        if (!active) return
        setDashboard(data)
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

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0]
    setDocumentName(file?.name ?? '')
  }

  const verification = dashboard?.verification ?? fallbackVerification
  const capacityRows = Array.isArray(dashboard?.workshop_capacity) && dashboard.workshop_capacity.length > 0
    ? dashboard.workshop_capacity
    : fallbackCapacity
  const recentOrders = Array.isArray(dashboard?.recent_orders) ? dashboard.recent_orders : []

  if (loading) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" aria-label="Chargement du dashboard vendeur" />
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

        <article
          className={`seller-dashboard-verified${verification.is_verified ? '' : ' seller-dashboard-verified--pending'}`}
        >
          <span className="material-symbols-outlined">
            {verification.is_verified ? 'verified' : 'hourglass_top'}
          </span>
          <h3>{verification.title}</h3>
          <p>{verification.tier}</p>
          <strong>{verification.level}</strong>
        </article>
      </section>

      <section className="seller-dashboard-grid">
        <article className="seller-dashboard-orders">
          <header>
            <h3>Recent Orders</h3>
            <button onClick={() => navigate('/seller/orders')} type="button">View All</button>
          </header>

          <div className="seller-dashboard-order-list">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusBadge = getStatusBadge(order)

                return (
                  <div className="seller-dashboard-order" key={order.id}>
                    <div className="seller-dashboard-order-main">
                      <div className="seller-dashboard-order-icon">
                        <span className="material-symbols-outlined">{getOrderIcon(order)}</span>
                      </div>
                      <div>
                        <p>{getOrderLabel(order)}</p>
                        <small>{getOrderSubtitle(order)}</small>
                      </div>
                    </div>
                    <div className="seller-dashboard-order-side">
                      <strong>{formatAmount(order.total_amount)}</strong>
                      <span className={statusBadge.className}>{statusBadge.label}</span>
                    </div>
                  </div>
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
          <article className="seller-dashboard-alert">
            <span className="material-symbols-outlined">warning</span>
            <div>
              <h4>Profile Verification Update</h4>
              <p>Your “Verified” status can be reviewed. Please update your master certification documents.</p>
              <input
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleDocumentChange}
                ref={documentInputRef}
                type="file"
              />
              <button onClick={() => documentInputRef.current?.click()} type="button">Upload Documents</button>
              {documentName ? <small>Document sélectionné : {documentName}</small> : null}
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
