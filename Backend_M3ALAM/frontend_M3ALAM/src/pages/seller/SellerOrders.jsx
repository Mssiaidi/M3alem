import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSellerOrders } from '../../api/sellerService'

function formatDate(isoDate) {
  if (!isoDate) return '-'

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '-'

  const day = date.toLocaleDateString('fr-FR', { day: '2-digit' })
  const month = date.toLocaleDateString('fr-FR', { month: 'short' })
  const year = date.toLocaleDateString('fr-FR', { year: 'numeric' })
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1)

  return `${day} ${formattedMonth}, ${year}`
}

function formatAmount(amount) {
  return `${Number.parseFloat(amount || 0).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`
}

function extractOrders(response) {
  if (!response) return []
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response)) return response

  return []
}

function extractPagination(response, orders) {
  return {
    currentPage: response?.current_page ?? 1,
    lastPage: response?.last_page ?? 1,
    from: response?.from ?? (orders.length > 0 ? 1 : 0),
    to: response?.to ?? orders.length,
    total: response?.total ?? orders.length,
  }
}

function getOrderProduct(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]

  return {
    name: firstItem?.product_name || firstItem?.product?.name || 'Produit',
    image: firstItem?.product?.images?.[0]?.path || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200',
  }
}

function getStatusBadge(status) {
  const badges = {
    pending: { label: 'En attente', className: 'seller-orders-badge seller-orders-badge--pending' },
    confirmed: { label: 'Confirmée', className: 'seller-orders-badge seller-orders-badge--progress' },
    preparing: { label: 'En cours', className: 'seller-orders-badge seller-orders-badge--progress' },
    processing: { label: 'En cours', className: 'seller-orders-badge seller-orders-badge--progress' },
    shipped: { label: 'Expédiée', className: 'seller-orders-badge seller-orders-badge--shipped' },
    delivered: { label: 'Livrée', className: 'seller-orders-badge seller-orders-badge--delivered' },
    cancelled: { label: 'Annulée', className: 'seller-orders-badge seller-orders-badge--cancelled' },
  }

  return badges[status] ?? { label: 'Statut', className: 'seller-orders-badge seller-orders-badge--progress' }
}

function getOrderSubtitle(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const firstItem = items[0]
  const extraItems = items.length > 1 ? ` + ${items.length - 1} autre${items.length > 2 ? 's' : ''}` : ''

  return `${firstItem?.product_name || firstItem?.product?.name || 'Commande'}${extraItems}`
}

function getVisiblePageNumbers(currentPage, lastPage) {
  if (lastPage <= 3) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  if (currentPage <= 2) return [1, 2, 3]
  if (currentPage >= lastPage - 1) return [lastPage - 2, lastPage - 1, lastPage]

  return [currentPage - 1, currentPage, currentPage + 1]
}

function SellerOrders() {
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
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMode, setSortMode] = useState('recent')

  useEffect(() => {
    let active = true

    getSellerOrders(page)
      .then((response) => {
        if (!active) return

        const nextOrders = extractOrders(response)
        setOrders(nextOrders)
        setPagination(extractPagination(response, nextOrders))
        setError('')
      })
      .catch((err) => {
        if (!active) return

        setError(err.message || 'Impossible de charger les commandes vendeur.')
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
    const byStatus = (order) => {
      if (activeTab === 'all') return true
      if (activeTab === 'progress') return order.status === 'confirmed' || order.status === 'preparing' || order.status === 'processing'
      if (activeTab === 'delivered') return order.status === 'shipped' || order.status === 'delivered'
      return order.status === activeTab
    }

    const bySearch = (order) => {
      if (!searchTerm.trim()) return true

      const product = getOrderProduct(order)
      const haystack = [
        order.reference,
        order.customer_name,
        order.created_at,
        product.name,
        getOrderSubtitle(order),
        order.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(searchTerm.toLowerCase())
    }

    return [...orders]
      .filter(byStatus)
      .filter(bySearch)
      .sort((a, b) => {
        if (sortMode === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0)
        }

        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [activeTab, orders, searchTerm, sortMode])

  const goToPage = (nextPage) => {
    if (nextPage === page || nextPage < 1 || nextPage > pagination.lastPage) return

    setLoading(true)
    setPage(nextPage)
  }

  const handleView = (orderId) => {
    navigate(`/seller/orders/${orderId}`)
  }

  return (
    <div className="seller-orders-page">
      <header className="seller-orders-top">
        <div>
          <h1>Gestion des Commandes</h1>
          <p>Suivez et gérez les commandes de vos clients efficacement.</p>
        </div>

        <div className="seller-orders-top__tools">
          <button className="seller-orders-icon-button" type="button" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="seller-orders-icon-button" type="button" aria-label="Paramètres">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="seller-orders-icon-button" type="button" aria-label="Aide">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="seller-orders-primary" type="button" onClick={() => navigate('/seller/products/new')}>
            Add New Product
          </button>
        </div>
      </header>

      <section className="seller-orders-stats">
        <article className="seller-orders-stat">
          <div className="seller-orders-stat__head">
            <div className="seller-orders-stat__icon seller-orders-stat__icon--blue">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
            <span className="seller-orders-stat__trend">+12%</span>
          </div>
          <p>Total Commandes</p>
          <strong>{statistics.total}</strong>
        </article>

        <article className="seller-orders-stat">
          <div className="seller-orders-stat__head">
            <div className="seller-orders-stat__icon seller-orders-stat__icon--orange">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="seller-orders-stat__chip">Action requise</span>
          </div>
          <p>En attente</p>
          <strong>{statistics.pending}</strong>
        </article>

        <article className="seller-orders-stat">
          <div className="seller-orders-stat__head">
            <div className="seller-orders-stat__icon seller-orders-stat__icon--red">
              <span className="material-symbols-outlined">paid</span>
            </div>
          </div>
          <p>Chiffre d'Affaires</p>
          <strong>{formatAmount(statistics.totalAmount)}</strong>
        </article>

        <article className="seller-orders-stat">
          <div className="seller-orders-stat__head">
            <div className="seller-orders-stat__icon seller-orders-stat__icon--blue">
              <span className="material-symbols-outlined">star</span>
            </div>
          </div>
          <p>Satisfaction</p>
          <strong>4.9/5</strong>
        </article>
      </section>

      <section className="seller-orders-table-card">
        <div className="seller-orders-table-card__toolbar">
          <div className="seller-orders-tabs" role="tablist" aria-label="Filtrer les commandes">
            <button className={activeTab === 'all' ? 'is-active' : ''} onClick={() => setActiveTab('all')} type="button">
              Toutes
            </button>
            <button className={activeTab === 'pending' ? 'is-active' : ''} onClick={() => setActiveTab('pending')} type="button">
              En attente
            </button>
            <button className={activeTab === 'progress' ? 'is-active' : ''} onClick={() => setActiveTab('progress')} type="button">
              En cours
            </button>
            <button className={activeTab === 'delivered' ? 'is-active' : ''} onClick={() => setActiveTab('delivered')} type="button">
              Livrées
            </button>
          </div>

          <div className="seller-orders-table-card__actions">
            <button
              className="seller-orders-secondary"
              onClick={() => setSortMode((current) => (current === 'recent' ? 'oldest' : 'recent'))}
              type="button"
            >
              <span className="material-symbols-outlined">calendar_month</span>
              Date
            </button>
            <button className="seller-orders-secondary" onClick={() => setShowFilters((current) => !current)} type="button">
              <span className="material-symbols-outlined">filter_list</span>
              Filtres
            </button>
          </div>
        </div>

        {showFilters ? (
          <div className="seller-orders-filters">
            <label>
              <span>Recherche</span>
              <input
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher une commande..."
                type="search"
                value={searchTerm}
              />
            </label>

            <label>
              <span>Trier</span>
              <select onChange={(event) => setSortMode(event.target.value)} value={sortMode}>
                <option value="recent">Les plus récentes</option>
                <option value="oldest">Les plus anciennes</option>
              </select>
            </label>
          </div>
        ) : null}

        {loading ? (
          <div className="seller-orders-loading">
            <div className="w-12 h-12 rounded-full border-4 border-surface-container-highest border-t-primary animate-spin" />
            <span>Chargement...</span>
          </div>
        ) : error ? (
          <div className="seller-orders-error">
            <span>{error}</span>
            <button onClick={() => navigate('/seller/orders')} type="button">
              Retour
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="seller-orders-empty">Aucune commande trouvée</div>
        ) : (
          <>
            <div className="seller-orders-table-wrap">
              <table className="seller-orders-table">
                <thead>
                  <tr>
                    <th>ID Commande</th>
                    <th>Produit</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const badge = getStatusBadge(order.status)
                    const product = getOrderProduct(order)
                    const reference = order.reference?.startsWith('#') ? order.reference : `#${order.reference || `ORD-${order.id}`}`

                    return (
                      <tr key={order.id}>
                        <td className="seller-orders-reference">{reference}</td>
                        <td>
                          <div className="seller-orders-product">
                            <img alt={product.name} src={product.image} />
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td>{order.customer_name || '-'}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td className="seller-orders-amount">{formatAmount(order.total_amount)}</td>
                        <td>
                          <span className={badge.className}>{badge.label}</span>
                        </td>
                        <td>
                          <div className="seller-orders-actions">
                            <button onClick={() => handleView(order.id)} type="button" aria-label={`Voir la commande ${reference}`}>
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                            <button onClick={() => handleView(order.id)} type="button" aria-label={`Modifier la commande ${reference}`}>
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="seller-orders-pagination">
              <p>
                Affichage de {pagination.from} à {pagination.to} sur {pagination.total} commandes
              </p>

              <div className="seller-orders-pagination__controls">
                <button
                  onClick={() => goToPage(page - 1)}
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  aria-label="Page précédente"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {getVisiblePageNumbers(pagination.currentPage, pagination.lastPage).map((pageNumber) => (
                  <button
                    className={pageNumber === pagination.currentPage ? 'is-active' : ''}
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    type="button"
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(page + 1)}
                  type="button"
                  disabled={pagination.currentPage >= pagination.lastPage}
                  aria-label="Page suivante"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default SellerOrders
