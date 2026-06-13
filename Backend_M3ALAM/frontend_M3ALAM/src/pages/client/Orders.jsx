import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    processing: {
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
    completed: {
      label: 'Terminée',
      bgColor: 'bg-surface-container-high',
      textColor: 'text-primary',
      dotColor: 'bg-primary',
    },
    cancelled: {
      label: 'Annulée',
      bgColor: 'bg-error-container',
      textColor: 'text-on-error-container',
      dotColor: 'bg-error',
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
  })} DH`
}

function formatCsvAmount(amount) {
  return Number.parseFloat(amount || 0).toFixed(2)
}

function extractOrders(response) {
  const orders = response?.data?.data ?? response?.data ?? response

  return Array.isArray(orders) ? orders : []
}

function extractPagination(response) {
  const orders = extractOrders(response)
  const paginator = response?.data?.data ? response.data : response

  return {
    currentPage: paginator?.current_page ?? 1,
    lastPage: paginator?.last_page ?? 1,
    from: paginator?.from ?? (orders.length > 0 ? 1 : 0),
    to: paginator?.to ?? orders.length,
    total: paginator?.total ?? orders.length,
  }
}

function getVisiblePageNumbers(currentPage, lastPage) {
  if (lastPage <= 3) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  if (currentPage <= 2) return [1, 2, 3]
  if (currentPage >= lastPage - 1) return [lastPage - 2, lastPage - 1, lastPage]

  return [currentPage - 1, currentPage, currentPage + 1]
}

function getOrderSubtitle(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]
  const productName = firstItem?.product_name || 'Commande multi-produits'
  const extraItems = items.length > 1 ? ` + ${items.length - 1} autre${items.length > 2 ? 's' : ''}` : ''

  return `${productName}${extraItems}`
}

function getOrderIcon(order) {
  const icons = {
    pending: 'carpenter',
    confirmed: 'palette',
    preparing: 'auto_fix',
    processing: 'auto_fix',
    shipped: 'local_shipping',
    delivered: 'task_alt',
    completed: 'task_alt',
    cancelled: 'cancel',
  }

  return icons[order.status] || 'receipt_long'
}

function escapeCsvValue(value) {
  const text = String(value ?? '').replace(/"/g, '""')
  return `"${text}"`
}

function buildOrdersCsv(orders) {
  const headers = ['Commande', 'Client', 'Date', 'Montant', 'Statut', 'Produit']
  const rows = orders.map((order) => {
    const badge = getStatusBadge(order.status)

    return [
      order.reference || `ORD-${order.id}`,
      order.customer_name || '-',
      formatDate(order.created_at),
      `${formatCsvAmount(order.total_amount)} DH`,
      badge.label,
      getOrderSubtitle(order),
    ]
  })

  return [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
}

function ArtisanSidebar() {
  return (
    <aside className="orders-sidebar">
      <div className="orders-sidebar__header">
        <h2>Artisan Portal</h2>
        <p>Manage your craft</p>
      </div>
      <nav className="orders-sidebar__nav">
        <Link className="orders-sidebar__link" to="/seller/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        <Link className="orders-sidebar__link" to="/seller/products">
          <span className="material-symbols-outlined">shopping_bag</span>
          <span>My Products</span>
        </Link>
        <Link className="orders-sidebar__link orders-sidebar__link--active" to="/orders">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <span>Orders</span>
        </Link>
        <Link className="orders-sidebar__link" to="/seller/shop">
          <span className="material-symbols-outlined">palette</span>
          <span>Workshops</span>
        </Link>
        <Link className="orders-sidebar__link" to="/seller/dashboard">
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Analytics</span>
        </Link>
      </nav>
      <div className="orders-sidebar__action">
        <Link className="orders-sidebar__add" to="/seller/products/new">
          <span className="material-symbols-outlined">add</span>
          List New Item
        </Link>
      </div>
    </aside>
  )
}

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    from: 0,
    to: 0,
    total: 0,
  })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    let active = true

    getOrders(page)
      .then((response) => {
        if (!active) return

        setOrders(extractOrders(response))
        setPagination(extractPagination(response))
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
  }, [page])

  const statistics = useMemo(() => {
    const totalAmount = orders.reduce((sum, order) => sum + Number.parseFloat(order.total_amount || 0), 0)

    return {
      total: pagination.total || orders.length,
      pending: orders.filter((order) => order.status === 'pending').length,
      totalAmount,
    }
  }, [orders, pagination.total])

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders
    if (statusFilter === 'in_progress') {
      return orders.filter((order) => order.status === 'processing' || order.status === 'preparing')
    }

    return orders.filter((order) => order.status === statusFilter)
  }, [orders, statusFilter])

  const goToPage = (nextPage) => {
    if (nextPage === page || nextPage < 1 || nextPage > pagination.lastPage) return

    setLoading(true)
    setPage(nextPage)
  }

  const handleExportCsv = () => {
    const csv = buildOrdersCsv(filteredOrders)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `commandes-page-${pagination.currentPage}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="orders-dashboard-shell">
      <ArtisanSidebar />

      <div className="orders-dashboard-main">
        {loading ? (
          <div className="min-h-[420px] flex flex-col items-center justify-center gap-md text-on-surface-variant">
            <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" aria-label="Chargement des commandes" />
            <span className="text-body-md">Chargement...</span>
          </div>
        ) : error ? (
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
        ) : (
          <>
            <header className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Historique des commandes</h1>
                <p className="text-body-md text-on-surface-variant">Suivez et gérez l'ensemble de vos transactions et services.</p>
              </div>
              <div className="flex gap-md">
                <button
                  className="bg-surface-container-highest text-on-surface px-md py-2 rounded-lg font-label-md flex items-center gap-sm hover:bg-surface-variant transition-colors"
                  type="button"
                  onClick={() => setShowFilters((isVisible) => !isVisible)}
                  aria-expanded={showFilters}
                >
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                  Filtrer
                </button>
                <button
                  className="bg-surface-container-highest text-on-surface px-md py-2 rounded-lg font-label-md flex items-center gap-sm hover:bg-surface-variant transition-colors"
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredOrders.length === 0}
                >
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
                  <span className="font-display-lg text-headline-lg text-primary-container">4.9/5</span>
                </div>
              </section>

              <div className="lg:col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
                {showFilters && (
                  <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex items-center gap-md">
                    <label className="font-label-md text-on-surface-variant" htmlFor="orders-status-filter">Statut</label>
                    <select
                      className="bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-md py-2 font-label-md"
                      id="orders-status-filter"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="in_progress">En préparation</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="completed">Terminée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                )}

                {filteredOrders.length === 0 ? (
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
                        {filteredOrders.map((order) => {
                          const badge = getStatusBadge(order.status)
                          const orderReference = order.reference || `ORD-${order.id}`
                          const reference = orderReference.startsWith('#') ? orderReference : `#${orderReference}`

                          return (
                            <tr className="hover:bg-surface-container-low transition-colors group" key={order.id}>
                              <td className="px-lg py-lg">
                                <div className="flex items-center gap-md">
                                  <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">{getOrderIcon(order)}</span>
                                  </div>
                                  <div>
                                    <div className="font-bold text-on-surface">{reference}</div>
                                    <div className="text-label-sm text-on-surface-variant">{getOrderSubtitle(order)}</div>
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

                {filteredOrders.length > 0 && (
                  <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">
                      Affichage de {pagination.from} à {pagination.to} sur {pagination.total} commandes
                    </span>
                    <div className="flex gap-sm">
                      <button
                        className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-50"
                        type="button"
                        disabled={pagination.currentPage <= 1}
                        onClick={() => goToPage(page - 1)}
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      {getVisiblePageNumbers(pagination.currentPage, pagination.lastPage).map((pageNumber) => (
                        <button
                          className={
                            pagination.currentPage === pageNumber
                              ? 'px-md py-2 bg-primary-container text-on-primary rounded-lg font-label-md'
                              : 'px-md py-2 hover:bg-surface-container-low rounded-lg font-label-md'
                          }
                          key={pageNumber}
                          type="button"
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low disabled:opacity-50"
                        type="button"
                        disabled={pagination.currentPage >= pagination.lastPage}
                        onClick={() => goToPage(page + 1)}
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Orders
