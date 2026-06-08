import { useEffect, useState } from 'react'
import { getAdminDashboard } from '../../api/adminService'

const kpis = [
  { label: 'Total Revenue', key: 'total_revenue', format: 'money' },
  { label: 'Active Customers', key: 'total_users' },
  { label: 'Pending Moderation', key: 'pending_shops', suffix: ' Alerts', highlight: true },
  { label: 'Avg. Rating', key: null, value: '4.9 / 5.0', accent: true },
]

const alerts = [
  {
    title: 'Review Required',
    text: 'New listing "Hand-carved Oak Table" needs quality verification.',
    tone: 'warn',
  },
  {
    title: 'Server Healthy',
    text: 'System synchronization completed successfully at 04:00 AM.',
    tone: 'info',
  },
  {
    title: 'Payout Delayed',
    text: 'Verification needed for transaction #882193-TX.',
    tone: 'warn',
  },
]

const recentOrders = [
  ['Leather Satchel', 'Sarah Williams', 'Completed', '$120.00'],
  ['Ceramic Vase', 'John Doe', 'Processing', '$85.00'],
]

function formatKpi(card, stats) {
  if (card.value) return card.value
  const value = stats?.[card.key]

  if (card.format === 'money') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(value || 0))
  }

  if (card.suffix) {
    return `${value || 0}${card.suffix}`
  }

  return value ?? '0'
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const payload = await getAdminDashboard()
        if (!active) return
        setStats(payload)
      } catch (err) {
        if (!active) return
        setError(
          err.message === 'Erreur API'
            ? 'Accès refusé. Connectez-vous avec un compte administrateur.'
            : err.message || 'Impossible de charger le dashboard.',
        )
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="admin-dashboard-shell">
      <section className="admin-overview-head">
        <div>
          <h1>Performance Overview</h1>
          <p>Welcome back, M3alem. Here's what's happening today.</p>
        </div>
        <div className="admin-range-toggle">
          <button className="is-active" type="button">Day</button>
          <button type="button">Week</button>
          <button type="button">Month</button>
        </div>
      </section>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="admin-kpi-grid">
        {kpis.map((card) => (
          <article
            className={`admin-kpi-card ${card.highlight ? 'is-highlight' : ''} ${card.accent ? 'is-accent' : ''}`}
            key={card.label}
          >
            <div className="admin-kpi-card__top">
              <span className="admin-kpi-card__icon">{card.label.charAt(0)}</span>
              <small>{card.highlight ? 'URGENT' : 'Steady'}</small>
            </div>
            <p>{card.label}</p>
            <strong>{formatKpi(card, stats)}</strong>
          </article>
        ))}
      </section>

      <section className="admin-main-grid">
        <article className="admin-panel admin-chart-panel">
          <div className="admin-panel__head">
            <h2>Sales Growth</h2>
            <span>⋮</span>
          </div>
          <div className="admin-chart" aria-hidden="true">
            <span style={{ height: '30%' }} />
            <span style={{ height: '48%' }} />
            <span className="is-active" style={{ height: '72%' }} />
            <span style={{ height: '45%' }} />
            <span style={{ height: '60%' }} />
            <span className="is-accent" style={{ height: '80%' }} />
          </div>
          <div className="admin-chart-labels">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
        </article>

        <article className="admin-panel admin-alerts-panel">
          <div className="admin-panel__head">
            <h2>System Alerts</h2>
          </div>
          <div className="admin-alert-list">
            {alerts.map((alert) => (
              <div className={`admin-alert admin-alert--${alert.tone}`} key={alert.title}>
                <strong>{alert.title}</strong>
                <p>{alert.text}</p>
              </div>
            ))}
          </div>
          <button className="button button--dark" type="button">View All Notifications</button>
        </article>
      </section>

      <section className="admin-panel admin-orders-panel">
        <div className="admin-panel__head">
          <h2>Recent Orders</h2>
          <a href="/seller/orders">View All Orders</a>
        </div>
        <table className="admin-orders-table">
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
            {recentOrders.map(([product, customer, status, amount]) => (
              <tr key={`${product}-${customer}`}>
                <td>{product}</td>
                <td>{customer}</td>
                <td>
                  <span className={`admin-status admin-status--${status.toLowerCase()}`}>
                    {status}
                  </span>
                </td>
                <td><strong>{amount}</strong></td>
                <td>◉</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default AdminDashboard
