import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSellerDashboard } from '../lib/api'

const money = (value) => `${Number(value ?? 0).toLocaleString('fr-MA')} DH`

export default function SellerDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getSellerDashboard().then(setStats).catch(() => setStats(null))
  }, [])

  if (!stats) return <p>Chargement du tableau de bord...</p>

  return (
    <section className="panel">
      <h1>Tableau de bord Vendeur</h1>

      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <p className="eyebrow">Ventes totales</p>
          <h2>{money(stats.total_sales)}</h2>
        </div>
        <div className="card">
          <p className="eyebrow">Commandes en attente</p>
          <h2>{stats.pending_orders}</h2>
        </div>
        <div className="card">
          <p className="eyebrow">Total produits</p>
          <h2>{stats.total_products}</h2>
        </div>
      </div>

      <h2>Commandes récentes</h2>
      <div className="orders-table">
        {stats.recent_orders.map(order => (
          <Link className="order-row" to={`/seller/orders/${order.id}`} key={order.id}>
            <strong>{order.reference}</strong>
            <span>{order.status}</span>
            <span>{money(order.total_amount)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
