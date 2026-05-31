import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSellerOrders, getSellerOrder, updateOrderStatus } from '../lib/api'

const money = (value) => `${Number(value ?? 0).toLocaleString('fr-MA')} DH`
const imageOf = (item) => 'https://picsum.photos/seed/m3alem/200/200'

export function SellerOrders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    getSellerOrders().then(setOrders).catch(() => setOrders([]))
  }, [])

  return (
    <section className="panel">
      <div className="section__head"><h2>Gestion des commandes</h2></div>
      <div className="orders-table">
        {orders.map((order) => (
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

export function SellerOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = () => getSellerOrder(id).then(setOrder).catch(() => setOrder(null))

  useEffect(() => {
    refresh()
  }, [id])

  if (!order) return <p>Chargement...</p>

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true)
    try {
      await updateOrderStatus(order.id, newStatus)
      refresh()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const statuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <section className="panel">
      <div className="section__head">
        <div>
          <p className="eyebrow">{order.status}</p>
          <h1>Commande {order.reference}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            className="field"
            value={order.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={loading || order.status === 'delivered' || order.status === 'cancelled'}
          >
            <option value="pending" disabled>En attente</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ margin: '1rem 0' }}>
        <h3>Client</h3>
        <p>{order.user?.name} ({order.user?.email})</p>
        <p>{order.customer_phone}</p>
        <p>{order.shipping_address}, {order.shipping_city}</p>
      </div>

      <div className="cart-list">
        {order.items.map((item) => (
          <article className="cart-item" key={item.id}>
             <div className="qty"><span>{item.quantity}x</span></div>
            <div>
              <h3>{item.product_name}</h3>
              <p>Prix unitaire : {money(item.unit_price)}</p>
            </div>
            <strong>{money(item.total_price)}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
