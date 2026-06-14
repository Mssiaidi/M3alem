import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getSellerOrder, updateOrderStatus } from '../../api/sellerService'

const statusSteps = [
  { key: 'confirmed', label: 'Confirmée', icon: 'check' },
  { key: 'processing', label: 'Préparation', icon: 'settings' },
  { key: 'shipped', label: 'Expédiée', icon: 'local_shipping' },
  { key: 'delivered', label: 'Livrée', icon: 'home' },
]

function formatDate(isoDate) {
  if (!isoDate) return '-'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatAmount(amount) {
  return `${Number.parseFloat(amount || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}\u00A0DH`
}

function getOrderStatusIndex(status) {
  return { confirmed: 0, processing: 1, shipped: 2, delivered: 3 }[status] ?? 0
}

function getNextStatus(status) {
  if (status === 'confirmed') return 'processing'
  if (status === 'processing') return 'shipped'
  if (status === 'shipped') return 'delivered'
  return status
}

function getProductImage(item) {
  return item?.product?.images?.[0]?.path || item?.product_image || 'https://via.placeholder.com/60'
}

function buildFallbackOrder(id) {
  return {
    id,
    reference: `ORD-${String(id || '000').padStart(3, '0')}`,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    total_amount: 0,
    customer_name: 'Client M3alem',
    customer_phone: '+212 6 00 00 00 00',
    shipping_address: 'Adresse non disponible',
    shipping_city: 'Maroc',
    shipping_country: 'Maroc',
    user: { name: 'Client M3alem', email: 'client@m3alem.ma' },
    items: [
      {
        id: `${id}-fallback`,
        product_name: 'Produit indisponible',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        product: { name: 'Produit indisponible', images: [{ path: 'https://via.placeholder.com/60' }] },
      },
    ],
  }
}

function SellerOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('confirmed')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true

    getSellerOrder(id)
      .then((response) => {
        if (!active) return
        setOrder(response || buildFallbackOrder(id))
        setStatus(response?.status || 'confirmed')
      })
      .catch(() => {
        if (!active) return
        setOrder(buildFallbackOrder(id))
        setStatus('confirmed')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const items = Array.isArray(order?.items) ? order.items : []
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number.parseFloat(item.total_price || item.unit_price * item.quantity || 0), 0),
    [items],
  )
  const currentStepIndex = getOrderStatusIndex(status)

  const handleSaveStatus = async () => {
    if (!order) return
    setSaving(true)
    try {
      const nextStatus = getNextStatus(status)
      const response = await updateOrderStatus(order.id, nextStatus)
      setOrder((current) => ({ ...current, status: response.status }))
      setStatus(response.status)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="seller-order-detail-loading">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
      </div>
    )
  }

  const customerName = order?.user?.name || order?.customer_name || 'Marc Lefebvre'
  const customerEmail = order?.user?.email || 'marc.lefebvre@email.fr'
  const customerPhone = order?.customer_phone || '+33 6 12 34 56 78'
  const shippingAddress = order?.shipping_address || '14 Rue de la République'
  const shippingCity = order?.shipping_city || '75004 Paris'
  const shippingCountry = order?.shipping_country || 'France'
  const shopName = order?.shop?.name || order?.items?.[0]?.shop?.name || 'M3alem Marketplace'

  return (
    <div className="seller-order-detail-page">
      <div className="seller-order-detail-print-ticket" aria-hidden="true">
        <h1>M3alem Marketplace</h1>
        <p className="seller-order-detail-print-ticket__shop">{shopName}</p>
        <p className="seller-order-detail-print-ticket__meta">
          Commande #{order?.reference || order?.id || 'ORD-2024-001'}
          <br />
          Reçue le {formatDate(order?.created_at)}
        </p>

        <div className="seller-order-detail-print-ticket__block">
          <h2>Client</h2>
          <p>{customerName}</p>
          <p>{customerEmail}</p>
          <p>{customerPhone}</p>
        </div>

        <div className="seller-order-detail-print-ticket__block">
          <h2>Commande</h2>
          {items.map((item) => (
            <div className="seller-order-detail-print-ticket__row" key={item.id}>
              <span>{item.product_name || item.product?.name}</span>
              <span>{String(item.quantity).padStart(2, '0')} x {formatAmount(item.unit_price)}</span>
            </div>
          ))}
        </div>

        <div className="seller-order-detail-print-ticket__block seller-order-detail-print-ticket__block--total">
          <div className="seller-order-detail-print-ticket__row">
            <span>Total TTC</span>
            <strong>{formatAmount(order?.total_amount || subtotal)}</strong>
          </div>
        </div>
      </div>

      <div className="seller-order-detail-main">
        <main className="seller-order-detail-content">
          <div className="seller-order-detail-grid">
            <div className="seller-order-detail-left">
              <section className="seller-order-detail-card">
                <div className="seller-order-detail-card__head">
                  <span className="material-symbols-outlined">assignment</span>
                  <h2>Gérer le Statut de Livraison</h2>
                </div>

                <div className="seller-order-detail-timeline">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index < currentStepIndex
                    const isActive = index === currentStepIndex
                    const isInactive = index > currentStepIndex

                    return (
                      <div className="seller-order-detail-step" key={step.key}>
                        {index < statusSteps.length - 1 ? (
                          <span className={`seller-order-detail-line${index < currentStepIndex ? ' is-completed' : ''}`} />
                        ) : null}
                        <div className={`seller-order-detail-circle${isCompleted || isActive ? ' is-active' : ''}`}>
                          <span className="material-symbols-outlined">{step.icon}</span>
                        </div>
                        <div className={`seller-order-detail-step__label${isInactive ? ' is-inactive' : ''}`}>
                          {step.label}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="seller-order-detail-next">
                  <div className="seller-order-detail-next__icon">
                    <span className="material-symbols-outlined">schedule</span>
                  </div>
                  <div className="seller-order-detail-next__body">
                    <span>Prochaine étape</span>
                    <strong>Passer à l'expédition</strong>
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="seller-order-detail-select">
                      <option value="confirmed">Confirmée</option>
                      <option value="processing">En préparation</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="seller-order-detail-card">
                <h2>Articles Commandés ({items.length})</h2>
                <div className="seller-order-detail-table-header">
                  <span>PRODUIT</span>
                  <span>QUANTITÉ</span>
                  <span>PRIX UNITAIRE</span>
                  <span>TOTAL</span>
                </div>

                <div className="seller-order-detail-products">
                  {items.map((item) => (
                    <div className="seller-order-detail-product-row" key={item.id}>
                      <div className="seller-order-detail-product-info">
                        <div className="seller-order-detail-product-image">
                          <img alt={item.product_name || 'Produit'} src={getProductImage(item)} />
                        </div>
                        <div className="seller-order-detail-product-details">
                          <strong>{item.product_name || item.product?.name}</strong>
                          <span>Finition: Huile Naturelle</span>
                        </div>
                      </div>
                      <div className="seller-order-detail-cell seller-order-detail-cell--center">{String(item.quantity).padStart(2, '0')}</div>
                      <div className="seller-order-detail-cell seller-order-detail-cell--center">{formatAmount(item.unit_price)}</div>
                      <div className="seller-order-detail-cell seller-order-detail-cell--right seller-order-detail-cell--total">
                        {formatAmount(item.total_price || item.unit_price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="seller-order-detail-summary">
                  <div className="seller-order-detail-summary__row">
                    <span>Sous-total</span>
                    <strong>{formatAmount(subtotal)}</strong>
                  </div>
                  <div className="seller-order-detail-summary__row">
                    <span>Frais de port</span>
                    <strong className="seller-order-detail-success">Gratuit</strong>
                  </div>
                  <div className="seller-order-detail-summary__row seller-order-detail-summary__row--total">
                    <span>Total TTC</span>
                    <strong>{formatAmount(order?.total_amount || subtotal)}</strong>
                  </div>
                </div>
              </section>
            </div>

            <div className="seller-order-detail-right">
              <section className="seller-order-detail-card">
                <div className="seller-order-detail-card__head">
                  <span className="material-symbols-outlined">person</span>
                  <h2>Informations Client</h2>
                </div>
                <div className="seller-order-detail-user-card">
                  <div className="seller-order-detail-avatar">ML</div>
                  <div>
                    <strong>{customerName}</strong>
                    <p>Client depuis Octobre 2023</p>
                  </div>
                </div>
                <div className="seller-order-detail-info-block">
                  <div className="seller-order-detail-label">Email</div>
                  <div className="seller-order-detail-value">{customerEmail}</div>
                </div>
                <div className="seller-order-detail-info-block">
                  <div className="seller-order-detail-label">Téléphone</div>
                  <div className="seller-order-detail-value">{customerPhone}</div>
                </div>
              </section>

              <section className="seller-order-detail-card">
                <div className="seller-order-detail-card__head">
                  <span className="material-symbols-outlined">location_on</span>
                  <h2>Adresse de Livraison</h2>
                </div>
                <div className="seller-order-detail-info-block">
                  <div className="seller-order-detail-value seller-order-detail-value--strong">{customerName}</div>
                </div>
                <div className="seller-order-detail-info-block">
                  <div className="seller-order-detail-value">{shippingAddress}</div>
                  <div className="seller-order-detail-value">{shippingCity}</div>
                  <div className="seller-order-detail-value">{shippingCountry}</div>
                </div>
              </section>

              <section className="seller-order-detail-card seller-order-detail-card--soft">
                <div className="seller-order-detail-card__head">
                  <span className="material-symbols-outlined">local_shipping</span>
                  <h2>Méthode de livraison</h2>
                </div>
                <div className="seller-order-detail-shipping">
                  <strong>Livraison Standard</strong>
                  <span>(Gratuit)</span>
                </div>
              </section>

              <section className="seller-order-detail-card">
                <div className="seller-order-detail-card__head">
                  <span className="material-symbols-outlined">edit_note</span>
                  <h2>Notes du vendeur</h2>
                </div>
                <textarea
                  className="seller-order-detail-textarea"
                  rows="4"
                  placeholder="Ajoutez une note interne pour cette commande..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <button className="seller-order-detail-primary seller-order-detail-primary--block" type="button" onClick={handleSaveStatus} disabled={saving}>
                  <span className="material-symbols-outlined">add</span>
                  {saving ? 'Enregistrement...' : 'Enregistrer la note'}
                </button>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SellerOrderDetail
