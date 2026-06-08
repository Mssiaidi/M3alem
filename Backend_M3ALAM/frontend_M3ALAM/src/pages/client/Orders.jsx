import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOrders } from '../../api/orderService'

function formatDate(isoDate) {
  if (!isoDate) return '-'

  const date = new Date(isoDate)

  if (Number.isNaN(date.getTime())) return '-'

  const day = date.toLocaleDateString('fr-FR', { day: '2-digit' })
  const month = date.toLocaleDateString('fr-FR', { month: 'long' })
  const year = date.toLocaleDateString('fr-FR', { year: 'numeric' })
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1)

  return `${day} ${formattedMonth}, ${year}`
}

function getStatusBadge(status) {
  const badges = {
    pending: {
      label: 'En attente',
      bgColor: 'bg-secondary-fixed',
      textColor: 'text-on-secondary-fixed-variant',
      dotColor: 'bg-secondary',
    },
    confirmed: {
      label: 'Confirmée',
      bgColor: 'bg-surface-container-high',
      textColor: 'text-primary',
      dotColor: 'bg-primary',
    },
    preparing: {
      label: 'En préparation',
      bgColor: 'bg-surface-container-high',
      textColor: 'text-primary',
      dotColor: 'bg-primary',
    },
    shipped: {
      label: 'Expédiée',
      bgColor: 'bg-primary-fixed',
      textColor: 'text-primary',
      dotColor: 'bg-primary-container',
    },
    delivered: {
      label: 'Livrée',
      bgColor: 'bg-surface-container-high',
      textColor: 'text-primary',
      dotColor: 'bg-primary',
    },
  }

  return badges[status] ?? {
    label: 'Statut inconnu',
    bgColor: 'bg-surface-container-high',
    textColor: 'text-primary',
    dotColor: 'bg-primary',
  }
}

function formatAmount(amount) {
  return `${Number.parseFloat(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`
}

function extractOrders(response) {
  const orders = response?.data?.data ?? response?.data ?? response

  return Array.isArray(orders) ? orders : []
}

function Orders() {
  useParams()

  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getOrders()
      .then((response) => {
        if (!active) return

        setOrders(extractOrders(response))
        setError('')
      })
      .catch((err) => {
        if (!active) return

        setError(err.message || 'Impossible de charger vos commandes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const statistics = useMemo(() => {
    const totalAmount = orders.reduce((sum, order) => sum + Number.parseFloat(order.total_amount || 0), 0)

    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === 'pending').length,
      totalAmount,
    }
  }, [orders])

  if (loading) {
    return (
      <div className="min-h-[420px] flex flex-col items-center justify-center gap-md text-on-surface-variant">
        <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" aria-label="Chargement des commandes" />
        <span className="text-body-md">Chargement...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-container-max mx-auto">
        <div className="bg-error-container text-on-error-container px-lg py-md rounded-xl border border-error flex flex-col gap-md">
          <span>{error}</span>
          <button
            className="w-fit bg-surface-container-lowest text-on-error-container px-md py-2 rounded-lg font-label-md hover:bg-surface-container-low transition-colors"
            type="button"
            onClick={() => navigate(-1)}
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-container-max mx-auto">
      <header className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Historique des commandes</h1>
          <p className="text-body-md text-on-surface-variant">Suivez et gérez l'ensemble de vos transactions et services.</p>
        </div>
        <div className="flex gap-md">
          <button className="bg-surface-container-highest text-on-surface px-md py-2 rounded-lg font-label-md flex items-center gap-sm hover:bg-surface-variant transition-colors" type="button">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filtrer
          </button>
          <button className="bg-surface-container-highest text-on-surface px-md py-2 rounded-lg font-label-md flex items-center gap-sm hover:bg-surface-variant transition-colors" type="button">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Exporter CSV
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <section className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-md mb-md">
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Total Commandes</span>
            <span className="font-display-lg text-headline-lg text-primary">{statistics.total}</span>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">En attente</span>
            <span className="font-display-lg text-headline-lg text-secondary">{statistics.pending}</span>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Chiffre d'affaires</span>
            <span className="font-display-lg text-headline-lg text-on-surface">{formatAmount(statistics.totalAmount)}</span>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col gap-xs">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Taux de satisfaction</span>
            <span className="font-display-lg text-headline-lg text-primary-container">-</span>
          </div>
        </section>

        <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="px-lg py-xl text-center text-on-surface-variant">
              Aucune commande trouvée
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Commande</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Client</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Date</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Montant</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Statut</th>
                    <th className="px-lg py-md font-label-md text-on-surface-variant uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {orders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    const orderReference = order.reference || `ORD-${order.id}`
                    const reference = orderReference.startsWith('#') ? orderReference : `#${orderReference}`

                    return (
                      <tr className="hover:bg-surface-container-low transition-colors group" key={order.id}>
                        <td className="px-lg py-lg">
                          <div className="flex items-center gap-md">
                            <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary">receipt_long</span>
                            </div>
                            <div>
                              <div className="font-bold text-on-surface">{reference}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-lg text-body-md text-on-surface font-medium">{order.customer_name || '-'}</td>
                        <td className="px-lg py-lg text-body-md text-on-surface-variant">{formatDate(order.created_at)}</td>
                        <td className="px-lg py-lg font-bold text-on-surface">{formatAmount(order.total_amount)}</td>
                        <td className="px-lg py-lg">
                          <span className={`${badge.bgColor} ${badge.textColor} px-md py-1 rounded-full text-label-sm font-bold flex items-center gap-xs w-fit`}>
                            <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-lg py-lg">
                          <button
                            className="text-primary-container p-2 hover:bg-primary-fixed rounded-lg transition-all active:scale-95"
                            type="button"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            aria-label={`Voir la commande ${reference}`}
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
