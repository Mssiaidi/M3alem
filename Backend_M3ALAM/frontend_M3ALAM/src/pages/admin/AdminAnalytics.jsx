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

function getMonthLabel(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
}

function getMonthKey(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildSnapshot(orders, reviews, shops, categories) {
  const orderedBuckets = {}
  const now = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
    orderedBuckets[key] = {
      key,
      label: new Intl.DateTimeFormat('fr', { month: 'short' }).format(month),
      revenue: 0,
      orders: 0,
      reviews: 0,
      shops: 0,
    }
  }

  orders.forEach((order) => {
    const key = getMonthKey(order.created_at)
    if (!key || !orderedBuckets[key]) return
    orderedBuckets[key].orders += 1
    if (String(order.status || '').toLowerCase() === 'delivered') {
      orderedBuckets[key].revenue += Number(order.total_amount || order.total || 0)
    }
  })

  reviews.forEach((review) => {
    const key = getMonthKey(review.created_at)
    if (!key || !orderedBuckets[key]) return
    orderedBuckets[key].reviews += 1
  })

  shops.forEach((shop) => {
    const key = getMonthKey(shop.created_at || shop.approved_at)
    if (!key || !orderedBuckets[key]) return
    orderedBuckets[key].shops += 1
  })

  const trend = Object.values(orderedBuckets)
  const peakRevenue = Math.max(...trend.map((entry) => entry.revenue), 1)

  return {
    trend,
    peakRevenue,
    totals: {
      revenue: trend.reduce((sum, entry) => sum + entry.revenue, 0),
      orders: trend.reduce((sum, entry) => sum + entry.orders, 0),
      reviews: trend.reduce((sum, entry) => sum + entry.reviews, 0),
      shops: trend.reduce((sum, entry) => sum + entry.shops, 0),
      categories: categories.length,
    },
  }
}

export default function AdminAnalytics() {
  const [dashboard, setDashboard] = useState(null)
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [shops, setShops] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        setLoading(true)
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
        if (active) setError(err.message || 'Impossible de charger les analytics.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const snapshot = useMemo(() => buildSnapshot(orders, reviews, shops, categories), [categories, orders, reviews, shops])

  const summaryCards = useMemo(
    () => [
      { label: 'Total revenue', value: currency(snapshot.totals.revenue), tone: 'primary' },
      { label: 'Orders', value: snapshot.totals.orders, tone: 'neutral' },
      { label: 'Reviews', value: snapshot.totals.reviews, tone: 'secondary' },
      { label: 'Shops', value: snapshot.totals.shops, tone: 'neutral' },
      { label: 'Categories', value: snapshot.totals.categories, tone: 'neutral' },
      { label: 'Active shops', value: dashboard?.total_shops ?? 0, tone: 'neutral' },
    ],
    [dashboard?.total_shops, snapshot],
  )

  const topMonth = snapshot.trend.reduce((best, entry) => (entry.revenue > best.revenue ? entry : best), snapshot.trend[0] || {
    label: '-',
    revenue: 0,
    orders: 0,
    reviews: 0,
    shops: 0,
  })

  const avgRevenue = snapshot.trend.length ? snapshot.totals.revenue / snapshot.trend.length : 0

  return (
    <div className="admin-analytics">
      <header className="admin-analytics__hero">
        <div>
          <p className="eyebrow">Admin Analytics</p>
          <h1>Performance snapshot</h1>
          <p>Vue consolidée des revenus, commandes, avis et boutiques sur les 6 derniers mois.</p>
        </div>
        <Link className="admin-analytics__back" to="/admin/dashboard">
          Back to dashboard
        </Link>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p className="admin-state-note">Chargement du snapshot de performance...</p> : null}

      <section className="admin-analytics__summary">
        {summaryCards.map((card) => (
          <article key={card.label} className={`admin-analytics__summary-card is-${card.tone}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-analytics__layout">
        <article className="admin-analytics__panel admin-analytics__panel--chart">
          <div className="admin-analytics__panel-head">
            <div>
              <h2>Revenue trend</h2>
              <p>Graphique mensuel basé sur les commandes livrées.</p>
            </div>
          </div>

          <div className="admin-analytics__chart">
            {snapshot.trend.map((entry) => (
              <div className="admin-analytics__column" key={entry.key}>
                <div className="admin-analytics__bar-wrap">
                  <div
                    className="admin-analytics__bar"
                    style={{ height: `${Math.max(12, Math.round((entry.revenue / snapshot.peakRevenue) * 100))}%` }}
                    title={`${entry.label}: ${currency(entry.revenue)}`}
                  >
                    <span>{currency(entry.revenue)}</span>
                  </div>
                </div>
                <strong>{entry.label}</strong>
                <small>{entry.orders} orders · {entry.reviews} reviews</small>
              </div>
            ))}
          </div>
        </article>

        <aside className="admin-analytics__side">
          <article className="admin-analytics__panel">
            <div className="admin-analytics__panel-head">
              <div>
                <h2>Snapshot details</h2>
                <p>Key numbers from the same database payloads.</p>
              </div>
            </div>

            <div className="admin-analytics__detail-list">
              <div>
                <span>Best month</span>
                <strong>{topMonth.label}</strong>
              </div>
              <div>
                <span>Best revenue</span>
                <strong>{currency(topMonth.revenue)}</strong>
              </div>
              <div>
                <span>Average monthly revenue</span>
                <strong>{currency(avgRevenue)}</strong>
              </div>
              <div>
                <span>Pending shops</span>
                <strong>{dashboard?.pending_shops ?? 0}</strong>
              </div>
            </div>
          </article>

          <article className="admin-analytics__panel">
            <div className="admin-analytics__panel-head">
              <div>
                <h2>Operational mix</h2>
                <p>Quick view of the activity distribution.</p>
              </div>
            </div>

            <div className="admin-analytics__mix">
              {snapshot.trend.map((entry) => {
                const total = entry.orders + entry.reviews + entry.shops
                const share = total ? Math.round((entry.reviews / total) * 100) : 0
                return (
                  <div className="admin-analytics__mix-row" key={entry.key}>
                    <div>
                      <strong>{entry.label}</strong>
                      <span>{entry.orders} orders · {entry.shops} shops</span>
                    </div>
                    <div className="admin-analytics__mix-bar">
                      <span style={{ width: `${Math.min(100, Math.max(18, share))}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}
