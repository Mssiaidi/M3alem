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
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setRefreshing(true)
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
      } finally {
        if (active) setRefreshing(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const handleRefreshDashboard = async () => {
    setError('')
    setChartMenuOpen(false)
    setRefreshing(true)

    try {
      const [dashboardPayload, shopsPayload, reviewsPayload, categoriesPayload, ordersPayload] = await Promise.all([
        getAdminDashboard(),
        getPendingShops(),
        getAdminReviews(),
        getAdminCategories(),
        getAdminOrders(),
      ])

      setDashboard(dashboardPayload)
      setShops(shopsPayload?.data || shopsPayload || [])
      setReviews(reviewsPayload?.data || reviewsPayload || [])
      setCategories(categoriesPayload?.data || categoriesPayload || [])
      setOrders(ordersPayload?.data || ordersPayload || [])
    } catch (err) {
      setError(err.message || 'Impossible de rafraîchir le dashboard admin.')
    } finally {
      setRefreshing(false)
    }
  }

  const handleExportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Generated at', new Date().toISOString()],
      ['Total users', dashboard?.total_users ?? 0],
      ['Total shops', dashboard?.total_shops ?? 0],
      ['Pending shops', dashboard?.pending_shops ?? 0],
      ['Total products', dashboard?.total_products ?? 0],
      ['Total orders', dashboard?.total_orders ?? 0],
      ['Total revenue', dashboard?.total_revenue ?? 0],
      ['Alerts', alerts.length],
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setChartMenuOpen(false)
  }

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
    const metrics = [
      {
        label: 'Revenue',
        value: Number(dashboard?.total_revenue || 0),
        tone: 'primary',
      },
      {
        label: 'Orders',
        value: Number(dashboard?.total_orders || orders.length || 0),
        tone: 'neutral',
      },
      {
        label: 'Shops',
        value: Number(dashboard?.total_shops || filteredShops.length || 0),
        tone: 'neutral',
      },
      {
        label: 'Reviews',
        value: Number(filteredReviews.length || reviews.length || 0),
        tone: 'secondary',
      },
      {
        label: 'Categories',
        value: Number(filteredCategories.length || categories.length || 0),
        tone: 'neutral',
      },
      {
        label: 'Users',
        value: Number(dashboard?.total_users || 0),
        tone: 'neutral',
      },
    ]

    const maxValue = Math.max(...metrics.map((metric) => metric.value), 1)

    return metrics.map((metric) => ({
      ...metric,
      percent: Math.max(12, Math.round((metric.value / maxValue) * 100)),
    }))
  }, [categories.length, dashboard, filteredCategories.length, filteredReviews.length, filteredShops.length, orders.length, reviews.length])

  const trendSummary = useMemo(() => {
    const trend = Array.isArray(dashboard?.trend) ? dashboard.trend : []
    if (trend.length < 2) {
      return { label: '+0.0%', tone: 'neutral' }
    }

    const firstValue = Number(trend[0]?.revenue || 0)
    const lastValue = Number(trend[trend.length - 1]?.revenue || 0)
    const base = firstValue || 1
    const delta = ((lastValue - firstValue) / base) * 100
    const rounded = Math.abs(delta).toFixed(1)

    if (delta > 0) {
      return { label: `+${rounded}%`, tone: 'positive' }
    }

    if (delta < 0) {
      return { label: `-${rounded}%`, tone: 'negative' }
    }

    return { label: '+0.0%', tone: 'neutral' }
  }, [dashboard])

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

  const alerts = useMemo(() => {
    const pendingShopsCount = dashboard?.pending_shops ?? 0
    const recentReviewsCount = filteredReviews.length || reviews.length || 0
    const pendingOrdersCount = orders.filter((order) => ['pending', 'processing', 'paid'].includes(String(order.status || '').toLowerCase())).length

    const items = [
      pendingShopsCount
        ? {
            title: 'Review Required',
            text: `${pendingShopsCount} shop${pendingShopsCount > 1 ? 's' : ''} still need approval.`,
            tone: 'warn',
            icon: 'report',
          }
        : {
            title: 'Shops Updated',
            text: 'No pending shop approvals right now.',
            tone: 'info',
            icon: 'check_circle',
          },
      recentReviewsCount
        ? {
            title: 'Recent Activity',
            text: `${recentReviewsCount} review${recentReviewsCount > 1 ? 's' : ''} loaded for moderation.`,
            tone: 'info',
            icon: 'rate_review',
          }
        : {
            title: 'No Reviews',
            text: 'There are no reviews in the selected range.',
            tone: 'info',
            icon: 'highlight_off',
          },
      pendingOrdersCount
        ? {
            title: 'Orders Waiting',
            text: `${pendingOrdersCount} order${pendingOrdersCount > 1 ? 's' : ''} need follow-up.`,
            tone: 'warn',
            icon: 'notification_important',
          }
        : {
            title: 'Orders Healthy',
            text: 'No pending orders need immediate action.',
            tone: 'info',
            icon: 'check_circle',
          },
    ]

    return items
  }, [dashboard?.pending_shops, filteredReviews.length, orders, reviews.length])

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
              <span className={`admin-dashboard-clean__trend is-${trendSummary.tone}`}>{trendSummary.label}</span>
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
                className={`admin-dashboard-clean__icon-button ${refreshing ? 'is-loading' : ''}`}
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
                  <button type="button" onClick={handleRefreshDashboard} disabled={refreshing}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {refreshing ? 'progress_activity' : 'refresh'}
                    </span>
                    {refreshing ? 'Refreshing...' : 'Refresh data'}
                  </button>
                  <button type="button" onClick={handleExportReport}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      download
                    </span>
                    Export report
                  </button>
                  <Link to="/admin/analytics" onClick={() => setChartMenuOpen(false)}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      monitoring
                    </span>
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
                title={`${bar.label}: ${bar.value}`}
              >
                <span className="admin-dashboard-clean__bar-tooltip">{bar.value}</span>
              </div>
            ))}
          </div>

          <div className="admin-dashboard-clean__days">
            {salesBars.map((bar) => (
              <span key={bar.label}>{bar.label}</span>
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
