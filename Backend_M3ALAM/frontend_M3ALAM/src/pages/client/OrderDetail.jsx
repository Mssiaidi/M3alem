import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { cancelOrder, getOrder } from '../../api/orderService'

const statusSteps = [
  { key: 'en_attente', label: 'En attente', icon: 'schedule' },
  { key: 'confirmee', label: 'Confirmée', icon: 'check' },
  { key: 'en_preparation', label: 'En préparation', icon: 'precision_manufacturing' },
  { key: 'expediee', label: 'Expédiée', icon: 'local_shipping' },
  { key: 'livree', label: 'Livrée', icon: 'package_2' },
]

function normalizeStatus(status) {
  const statusMap = {
    pending: 'en_attente',
    confirmed: 'confirmee',
    processing: 'en_preparation',
    shipped: 'expediee',
    delivered: 'livree',
    cancelled: 'annulee',
  }

  return statusMap[status] ?? status
}

function getStatusIndex(statut) {
  return statusSteps.findIndex((step) => step.key === normalizeStatus(statut))
}

function getStatusBadge(statut) {
  const badges = {
    en_attente: {
      label: 'En attente',
      classes: 'bg-secondary-fixed text-on-secondary-fixed-variant',
      dot: 'bg-secondary',
    },
    confirmee: {
      label: 'Confirmée',
      classes: 'bg-surface-container-high text-primary',
      dot: 'bg-primary',
    },
    en_preparation: {
      label: 'En préparation',
      classes: 'bg-surface-container-high text-primary',
      dot: 'bg-primary',
    },
    expediee: {
      label: 'Expédiée',
      classes: 'bg-primary-fixed text-primary',
      dot: 'bg-primary-container',
    },
    livree: {
      label: 'Livrée',
      classes: 'bg-surface-container-high text-primary',
      dot: 'bg-primary',
    },
    annulee: {
      label: 'Annulée',
      classes: 'bg-error-container text-on-error-container',
      dot: 'bg-error',
    },
  }

  return badges[normalizeStatus(statut)] ?? {
    label: 'Statut inconnu',
    classes: 'bg-surface-container-high text-primary',
    dot: 'bg-primary',
  }
}

function formatDate(date) {
  if (!date) return '-'

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return '-'

  const day = parsedDate.toLocaleDateString('fr-FR', { day: '2-digit' })
  const month = parsedDate.toLocaleDateString('fr-FR', { month: 'long' })
  const year = parsedDate.toLocaleDateString('fr-FR', { year: 'numeric' })

  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}, ${year}`
}

function formatAmount(amount) {
  return `${Number(amount ?? 0).toLocaleString('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`
}

function getProductImage(item) {
  return item.product?.images?.[0]?.path ?? 'https://picsum.photos/seed/m3alem-order/320/320'
}

function normalizeOrder(order) {
  if (!order) return null

  const reference = order.numero ?? order.reference ?? `ORD-${order.id}`

  return {
    ...order,
    numero: reference.startsWith('#') ? reference : `#${reference}`,
    statut: normalizeStatus(order.statut ?? order.status),
    date: order.date ?? order.created_at,
    montant: order.montant ?? order.total_amount,
    customer_name: order.customer_name ?? 'Client M3alem',
    customer_phone: order.customer_phone ?? '-',
    shipping_city: order.shipping_city ?? '-',
    shipping_address: order.shipping_address ?? '-',
    items: Array.isArray(order.items) ? order.items : [],
  }
}

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true

    setLoading(true)
    getOrder(id)
      .then((data) => {
        if (active) {
          setOrder(normalizeOrder(data))
          setError('')
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Impossible de charger la commande.')
          setOrder(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const statusBadge = getStatusBadge(order?.statut)
  const currentStatusIndex = getStatusIndex(order?.statut)
  const subtotal = useMemo(
    () => order?.items.reduce((sum, item) => sum + Number(item.total_price ?? 0), 0) ?? 0,
    [order],
  )

  const handleCancel = async () => {
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) return

    try {
      setCancelling(true)
      await cancelOrder(id)
      setOrder((current) => current ? { ...current, statut: 'annulee', status: 'cancelled' } : current)
    } catch (err) {
      setError(err.message || 'Impossible d’annuler la commande.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" aria-label="Chargement de la commande" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-container-max mx-auto px-md md:px-lg py-xl">
        <div className="bg-error-container text-on-error-container px-lg py-md rounded-xl border border-error mb-md">
          {error}
        </div>
        <button className="flex items-center gap-xs px-md py-sm border border-outline rounded-lg font-label-md text-on-surface hover:bg-surface-container-low transition-all active:scale-95" type="button" onClick={() => navigate('/orders')}>
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Retour aux commandes
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-container-max mx-auto px-md md:px-lg py-xl">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Commande introuvable</h1>
          <button className="flex items-center gap-xs px-md py-sm bg-primary-container text-on-primary rounded-lg font-label-md mx-auto hover:shadow-lg transition-all active:scale-95" type="button" onClick={() => navigate('/orders')}>
            Retour aux commandes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto px-md md:px-lg py-xl">
      <div className="mb-lg">
        <div className="flex items-center gap-xs text-label-sm text-on-surface-variant mb-sm">
          <span>Dashboard</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span>Mes Commandes</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-primary font-bold">Commande {order.numero}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg">Détails de la commande</h1>
            <span className={`${statusBadge.classes} px-md py-1 rounded-full text-label-sm font-bold flex items-center gap-xs w-fit mt-sm`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>
          </div>
          <div className="flex gap-md">
            <button className="flex items-center gap-xs px-md py-sm border border-outline rounded-lg font-label-md text-on-surface hover:bg-surface-container-low transition-all active:scale-95" type="button" onClick={() => navigate('/orders')}>
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Retour
            </button>
            {order.statut === 'en_attente' ? (
              <button className="flex items-center gap-xs px-md py-sm bg-error-container text-on-error-container rounded-lg font-label-md hover:shadow-lg transition-all active:scale-95" type="button" onClick={handleCancel} disabled={cancelling}>
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                {cancelling ? 'Annulation...' : 'Annuler'}
              </button>
            ) : null}
            {order.statut === 'livree' ? (
              <button className="flex items-center gap-xs px-md py-sm bg-primary-container text-on-primary rounded-lg font-label-md hover:shadow-lg transition-all active:scale-95" type="button" onClick={() => navigate(`/orders/${id}/review`)}>
                <span className="material-symbols-outlined text-[20px]">rate_review</span>
                Laisser un avis
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex items-center justify-between mb-xl">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Statut de livraison</p>
                <p className="text-headline-md text-primary mt-xs">{statusBadge.label}</p>
              </div>
              <div className="text-right">
                <p className="text-label-sm text-on-surface-variant">Date de commande</p>
                <p className="font-bold text-on-surface">{formatDate(order.date)}</p>
              </div>
            </div>

            <div className="relative pt-8 pb-4">
              <div className="absolute top-[52px] left-0 w-full h-[2px] bg-surface-container-high" />
              <div className="absolute top-[52px] left-0 h-[2px] bg-secondary-container order-progress-line" style={{ width: `${Math.max(currentStatusIndex, 0) / (statusSteps.length - 1) * 100}%` }} />
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => {
                  const isPast = currentStatusIndex > index
                  const isCurrent = currentStatusIndex === index
                  const circleClass = isCurrent
                    ? 'w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center z-10 shadow-md ring-2 ring-primary animate-pulse'
                    : isPast
                      ? 'w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center z-10 shadow-md'
                      : 'w-10 h-10 rounded-full bg-outline-variant text-on-surface-variant flex items-center justify-center z-10'

                  return (
                    <div className="flex flex-col items-center text-center max-w-[120px]" key={step.key}>
                      <div className={circleClass}>
                        <span className="material-symbols-outlined">{isPast ? 'check' : step.icon}</span>
                      </div>
                      <p className={`mt-sm font-label-md ${isCurrent ? 'text-primary font-bold' : isPast ? 'text-on-surface' : 'text-on-surface-variant'}`}>{step.label}</p>
                      <p className="text-label-sm text-on-surface-variant">{isCurrent ? 'En cours' : isPast ? 'Terminé' : 'À venir'}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h2 className="font-headline-md text-on-surface">Articles commandés ({order.items.length})</h2>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs rounded text-label-sm font-bold">Livraison suivie</span>
            </div>
            <div className="divide-y divide-outline-variant">
              {order.items.map((item) => (
                <div className="p-lg flex gap-lg hover:bg-surface-container-lowest transition-colors" key={item.id}>
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-low">
                    <img alt={item.product_name} className="w-full h-full object-cover" src={getProductImage(item)} />
                  </div>
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-body-lg font-bold text-on-surface">{item.product_name}</h3>
                      <p className="text-body-md text-on-surface-variant">{item.shop?.name ?? 'Boutique artisan'}</p>
                      <span className="inline-block mt-xs bg-tertiary-fixed text-on-tertiary-fixed-variant px-xs py-1 rounded text-[10px] font-bold uppercase">Produit artisanal</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-label-md">Quantité: <span className="font-bold">{item.quantity}</span></p>
                      <div className="text-right">
                        <p className="text-label-sm text-on-surface-variant">Prix unitaire: {formatAmount(item.unit_price)}</p>
                        <p className="font-headline-md text-primary">{formatAmount(item.total_price)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {order.items.length === 0 ? (
                <div className="p-lg text-center text-on-surface-variant">Aucun article trouvé pour cette commande.</div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h2 className="font-headline-md text-on-surface mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Détails Livraison
            </h2>
            <div className="space-y-md">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tight">Adresse de réception</p>
                <p className="text-body-md mt-xs font-bold text-on-surface">{order.customer_name}</p>
                <p className="text-body-md text-on-surface-variant">{order.shipping_address}<br />{order.shipping_city}</p>
                <p className="text-body-md text-on-surface-variant">{order.customer_phone}</p>
              </div>
              <div className="pt-md border-t border-outline-variant">
                <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tight">Méthode de livraison</p>
                <div className="flex items-center gap-sm mt-xs">
                  <span className="material-symbols-outlined text-on-surface-variant">local_post_office</span>
                  <p className="text-body-md text-on-surface">Livraison standard M3alem</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h2 className="font-headline-md text-on-surface mb-md">Résumé du paiement</h2>
            <div className="space-y-sm">
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Sous-total</span>
                <span className="text-on-surface">{formatAmount(subtotal)}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Frais de livraison</span>
                <span className="text-on-surface">{formatAmount(0)}</span>
              </div>
              <div className="pt-md mt-md border-t border-outline-variant flex justify-between items-baseline">
                <span className="text-headline-md">Total TTC</span>
                <span className="text-display-lg text-primary">{formatAmount(order.montant)}</span>
              </div>
            </div>
            <div className="mt-xl pt-md border-t border-outline-variant">
              <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-tight mb-sm">Informations vendeur/boutique</p>
              <div className="space-y-sm">
                {[...new Set(order.items.map((item) => item.shop?.name).filter(Boolean))].map((shopName) => (
                  <div className="flex items-center gap-md p-sm bg-surface-container rounded-lg" key={shopName}>
                    <div className="bg-surface-container-lowest p-1 rounded border border-outline-variant">
                      <span className="material-symbols-outlined text-primary-container">storefront</span>
                    </div>
                    <div>
                      <p className="text-label-md font-bold">{shopName}</p>
                      <p className="text-label-sm text-on-surface-variant">Boutique artisan partenaire</p>
                    </div>
                  </div>
                ))}
                {order.items.every((item) => !item.shop?.name) ? (
                  <div className="flex items-center gap-md p-sm bg-surface-container rounded-lg">
                    <div className="bg-surface-container-lowest p-1 rounded border border-outline-variant">
                      <span className="material-symbols-outlined text-primary-container">storefront</span>
                    </div>
                    <div>
                      <p className="text-label-md font-bold">Boutique artisan</p>
                      <p className="text-label-sm text-on-surface-variant">Informations vendeur non disponibles</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
