import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminCategories, getAdminDashboard, getAdminOrders, getAdminReviews, getPendingShops } from '../../api/adminService'

function currency(value) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function withinRange(dateValue, days) {
  if (!dateValue || !days) return true
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return true
  return Date.now() - parsed.getTime() <= days * 24 * 60 * 60 * 1000
}

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [range, setRange] = useState('day')
  const [chartMenuOpen, setChartMenuOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [dashboardPayload, shopsPayload, reviewsPayload, categoriesPayload, ordersPayload] = await Promise.all([
          getAdminDashboard(),
          getPendingShops(),
          getAdminReviews(),
          getAdminCategories(),
          getAdminOrders(),
        ])

        if (!active) return

        setDashboard(dashboardPayload)
        setShops(shopsPayload?.data || shopsPayload || [])
        setReviews(reviewsPayload?.data || reviewsPayload || [])
        setCategories(categoriesPayload?.data || categoriesPayload || [])
        setOrders(ordersPayload?.data || ordersPayload || [])
      } catch (err) {
        if (!active) return
        setError(err.message || 'Impossible de charger le dashboard admin.')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const rangeDays = range === 'day' ? 1 : range === 'week' ? 7 : 30

  const filteredShops = useMemo(
    () => shops.filter((shop) => withinRange(shop.created_at || shop.approved_at, rangeDays)),
    [shops, rangeDays],
  )

  const filteredReviews = useMemo(
    () => reviews.filter((review) => withinRange(review.created_at, rangeDays)),
    [reviews, rangeDays],
  )

  const filteredCategories = useMemo(
    () => categories.filter((category) => withinRange(category.created_at, rangeDays)),
    [categories, rangeDays],
  )

  const reviewStats = useMemo(() => {
    const visibleReviews = filteredReviews.length ? filteredReviews : reviews
    const total = visibleReviews.length
    const avgRating = total
      ? visibleReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 4.9

    return {
      avgRating: avgRating.toFixed(1),
      totalCustomers: dashboard?.total_users ?? 0,
      pendingModeration: dashboard?.pending_shops ?? 0,
    }
  }, [dashboard, filteredReviews, reviews])

  const metricCards = useMemo(
    () => [
      { label: 'Total Revenue', value: currency(dashboard?.total_revenue), icon: 'payments' },
      { label: 'Active Customers', value: reviewStats.totalCustomers, icon: 'group' },
      { label: 'Pending Moderation', value: `${reviewStats.pendingModeration} Alerts`, icon: 'warning', accent: true },
      { label: 'Avg. Rating', value: `${reviewStats.avgRating} / 5.0`, icon: 'star' },
    ],
    [dashboard, reviewStats],
  )

  const salesBars = useMemo(() => {
    const orderCount = Array.isArray(orders) ? orders.length : 0
    const shopCount = filteredShops.length
    const reviewCount = filteredReviews.length
    const categoryCount = filteredCategories.length
    const base = Math.max(10, orderCount * 4 + shopCount * 3 + reviewCount * 2 + categoryCount)

    return [
      { label: 'Mon', value: Math.max(8, Math.round(base * 0.55)), percent: 42, tone: 'neutral' },
      { label: 'Tue', value: Math.max(10, Math.round(base * 0.7)), percent: 58, tone: 'neutral' },
      { label: 'Wed', value: Math.max(14, Math.round(base * 0.95)), percent: 86, tone: 'primary' },
      { label: 'Thu', value: Math.max(10, Math.round(base * 0.72)), percent: 60, tone: 'neutral' },
      { label: 'Fri', value: Math.max(12, Math.round(base * 0.82)), percent: 72, tone: 'neutral' },
      { label: 'Sat', value: Math.max(16, Math.round(base * 1.1)), percent: 96, tone: 'secondary' },
    ]
  }, [filteredCategories.length, filteredReviews.length, filteredShops.length, orders])

  const recentOrders = useMemo(() => {
    if (orders.length) {
      return orders.slice(0, 2).map((order) => ({
        product:
          order.items?.[0]?.product?.name ||
          order.items?.[0]?.product_name ||
          order.reference ||
          `Order #${order.id}`,
        customer: order.user?.name || order.customer_name || 'Customer',
        status: order.status || 'pending',
        amount: currency(order.total_amount || order.total || 0),
      }))
    }

    return [
      ['Leather Satchel', 'Sarah Williams', 'Completed', '$120.00'],
      ['Ceramic Vase', 'John Doe', 'Processing', '$85.00'],
    ].map(([product, customer, status, amount]) => ({ product, customer, status, amount }))
  }, [orders])

  const alerts = [
    {
      title: 'Review Required',
      text: 'New listing "Hand-carved Oak Table" needs quality verification.',
      tone: 'warn',
      icon: 'report',
    },
    {
      title: 'Server Healthy',
      text: 'System synchronization completed successfully at 04:00 AM.',
      tone: 'info',
      icon: 'check_circle',
    },
    {
      title: 'Payout Delayed',
      text: 'Verification needed for transaction #882193-TX.',
      tone: 'warn',
      icon: 'notification_important',
    },
  ]

  return (
    <div className="admin-dashboard-clean">
      <header className="admin-dashboard-clean__header">
        <div>
          <h1>Performance Overview</h1>
          <p>Welcome back, M3alem. Here&apos;s what&apos;s happening today.</p>
        </div>

        <div className="admin-dashboard-clean__switch">
          <button className={range === 'day' ? 'is-active' : ''} type="button" onClick={() => setRange('day')}>
            Day
          </button>
          <button className={range === 'week' ? 'is-active' : ''} type="button" onClick={() => setRange('week')}>
            Week
          </button>
          <button className={range === 'month' ? 'is-active' : ''} type="button" onClick={() => setRange('month')}>
            Month
          </button>
        </div>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="admin-dashboard-clean__kpis">
        {metricCards.map((card) => (
          <article className={`admin-dashboard-clean__kpi ${card.accent ? 'is-accent' : ''}`} key={card.label}>
            <div className="admin-dashboard-clean__kpi-top">
              <span className="material-symbols-outlined" aria-hidden="true">
                {card.icon}
              </span>
              <span className="admin-dashboard-clean__trend">+12.5%</span>
            </div>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-clean__grid">
        <article className="admin-dashboard-clean__card admin-dashboard-clean__chart">
          <div className="admin-dashboard-clean__card-head">
            <h2>Sales Growth</h2>
            <div className="admin-dashboard-clean__chart-actions">
              <button
                type="button"
                className="admin-dashboard-clean__icon-button"
                onClick={() => setChartMenuOpen((current) => !current)}
                aria-expanded={chartMenuOpen}
                aria-label="Chart options"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  more_vert
                </span>
              </button>
              {chartMenuOpen ? (
                <div className="admin-dashboard-clean__menu">
                  <button type="button" onClick={() => setChartMenuOpen(false)}>
                    Refresh data
                  </button>
                  <button type="button" onClick={() => setChartMenuOpen(false)}>
                    Export report
                  </button>
                  <Link to="/admin/reviews" onClick={() => setChartMenuOpen(false)}>
                    View analytics
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          <div className="admin-dashboard-clean__bars">
            {salesBars.map((bar) => (
              <div
                className={`admin-dashboard-clean__bar ${bar.tone === 'primary' ? 'is-primary' : bar.tone === 'secondary' ? 'is-secondary' : ''}`}
                key={bar.label}
                style={{ height: `${bar.percent}%` }}
                title={`${bar.label}: ${bar.value}k`}
              >
                <span className="admin-dashboard-clean__bar-tooltip">{bar.value}k</span>
              </div>
            ))}
          </div>

          <div className="admin-dashboard-clean__days">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </article>

        <article className="admin-dashboard-clean__card admin-dashboard-clean__alerts">
          <h2>System Alerts</h2>
          <div className="admin-dashboard-clean__alert-list">
            {alerts.map((alert) => (
              <div className={`admin-dashboard-clean__alert ${alert.tone}`} key={alert.title}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  {alert.icon}
                </span>
                <div>
                  <strong>{alert.title}</strong>
                  <p>{alert.text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link className="admin-dashboard-clean__link" to="/admin/reviews">
            View All Notifications
          </Link>
        </article>
      </section>

      <section className="admin-dashboard-clean__table-card">
        <div className="admin-dashboard-clean__card-head">
          <h2>Recent Orders</h2>
          <Link className="admin-dashboard-clean__mini-link" to="/seller/orders">
            View All Orders
          </Link>
        </div>

        <table className="admin-dashboard-clean__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={`${order.product}-${order.customer}`}>
                <td>{order.product}</td>
                <td>{order.customer}</td>
                <td>
                  <span className={`admin-dashboard-clean__badge ${String(order.status).toLowerCase()}`}>{order.status}</span>
                </td>
                <td>
                  <strong>{order.amount}</strong>
                </td>
                <td>
                  <Link className="admin-dashboard-clean__action" to="/seller/orders" aria-label={`View order for ${order.product}`}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      visibility
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-dashboard-clean__bottom">
        <article className="admin-dashboard-clean__mini-card">
          <div className="admin-dashboard-clean__card-head">
            <h2>Pending Shops</h2>
            <Link className="admin-dashboard-clean__mini-link" to="/admin/shops">
              Open
            </Link>
          </div>
          <div className="admin-dashboard-clean__stack">
            {filteredShops.length ? (
              filteredShops.slice(0, 3).map((shop) => (
                <div className="admin-dashboard-clean__row" key={shop.id}>
                  <div>
                    <strong>{shop.name}</strong>
                    <span>{shop.user?.name || 'Artisan'}</span>
                  </div>
                  <span>{shop.status || 'pending'}</span>
                </div>
              ))
            ) : (
              <p className="admin-dashboard-clean__empty">No pending shops.</p>
            )}
          </div>
        </article>

        <article className="admin-dashboard-clean__mini-card">
          <div className="admin-dashboard-clean__card-head">
            <h2>Latest Reviews</h2>
            <Link className="admin-dashboard-clean__mini-link" to="/admin/reviews">
              Open
            </Link>
          </div>
          <div className="admin-dashboard-clean__stack">
            {filteredReviews.length ? (
              filteredReviews.slice(0, 3).map((review) => (
                <div className="admin-dashboard-clean__row" key={review.id}>
                  <div>
                    <strong>{review.user?.name || 'Client'}</strong>
                    <span>{review.comment || 'No comment'}</span>
                  </div>
                  <span>{review.rating ? `${review.rating}/5` : 'N/A'}</span>
                </div>
              ))
            ) : (
              <p className="admin-dashboard-clean__empty">No reviews loaded.</p>
            )}
          </div>
        </article>

        <article className="admin-dashboard-clean__mini-card">
          <div className="admin-dashboard-clean__card-head">
            <h2>Categories</h2>
            <Link className="admin-dashboard-clean__mini-link" to="/admin/categories">
              Open
            </Link>
          </div>
          <div className="admin-dashboard-clean__stack">
            {filteredCategories.length ? (
              filteredCategories.slice(0, 3).map((category) => (
                <div className="admin-dashboard-clean__row" key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <span>{category.description || 'No description'}</span>
                  </div>
                  <span>{category.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              ))
            ) : (
              <p className="admin-dashboard-clean__empty">No categories loaded.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

export default AdminDashboard
