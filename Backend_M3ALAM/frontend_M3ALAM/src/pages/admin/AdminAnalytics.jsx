import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard } from '../../api/adminService'

function currency(value) {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

export default function AdminAnalytics() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAdminDashboard('month')
      .then((payload) => {
        if (active) setDashboard(payload)
      })
      .catch((err) => {
        if (active) setError(err.message || 'Impossible de charger les analytics.')
      })

    return () => {
      active = false
    }
  }, [])

  const trend = Array.isArray(dashboard?.trend) ? dashboard.trend : []

  const summary = useMemo(() => {
    const revenue = trend.reduce((sum, entry) => sum + Number(entry.revenue || 0), 0)
    const orders = trend.reduce((sum, entry) => sum + Number(entry.orders || 0), 0)
    const shops = trend.reduce((sum, entry) => sum + Number(entry.shops || 0), 0)
    const reviews = trend.reduce((sum, entry) => sum + Number(entry.reviews || 0), 0)

    return { revenue, orders, shops, reviews }
  }, [trend])

  const peak = Math.max(...trend.map((entry) => Number(entry.revenue || 0)), 1)

  return (
    <div className="admin-analytics">
      <header className="admin-analytics__hero">
        <div>
          <p className="eyebrow">Admin Analytics</p>
          <h1>Performance snapshot</h1>
          <p>Here is a month-level view of the main operational signals.</p>
        </div>
        <Link className="admin-analytics__back" to="/admin/dashboard">
          Back to dashboard
        </Link>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="admin-analytics__summary">
        <article>
          <span>Total revenue</span>
          <strong>{currency(summary.revenue)}</strong>
        </article>
        <article>
          <span>Total orders</span>
          <strong>{summary.orders}</strong>
        </article>
        <article>
          <span>New shops</span>
          <strong>{summary.shops}</strong>
        </article>
        <article>
          <span>Reviews</span>
          <strong>{summary.reviews}</strong>
        </article>
      </section>

      <section className="admin-analytics__chart">
        {trend.map((entry) => (
          <div className="admin-analytics__column" key={entry.date}>
            <div className="admin-analytics__bar-wrap">
              <div
                className="admin-analytics__bar"
                style={{ height: `${Math.max(12, Math.round((Number(entry.revenue || 0) / peak) * 100))}%` }}
                title={`${entry.label}: ${currency(entry.revenue)}`}
              />
            </div>
            <strong>{entry.label}</strong>
            <small>{currency(entry.revenue)}</small>
          </div>
        ))}
      </section>
    </div>
  )
}
