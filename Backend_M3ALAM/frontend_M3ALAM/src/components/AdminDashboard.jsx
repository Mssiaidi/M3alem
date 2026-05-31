import { useEffect, useState } from 'react'
import { getAdminDashboard, getPendingShops, approveShop, suspendShop, getAdminReviews, deleteReview } from '../lib/api'

const money = (value) => `${Number(value ?? 0).toLocaleString('fr-MA')} DH`

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pendingShops, setPendingShops] = useState([])
  const [reviews, setReviews] = useState([])

  const refreshStats = () => getAdminDashboard().then(setStats)
  const refreshShops = () => getPendingShops().then(setPendingShops)
  const refreshReviews = () => getAdminReviews().then(setReviews)

  useEffect(() => {
    refreshStats()
    refreshShops()
    refreshReviews()
  }, [])

  const handleApprove = async (id) => {
    await approveShop(id)
    refreshShops()
    refreshStats()
  }

  const handleSuspend = async (id) => {
    await suspendShop(id)
    refreshShops()
    refreshStats()
  }

  const handleDeleteReview = async (id) => {
    await deleteReview(id)
    refreshReviews()
  }

  if (!stats) return <p>Chargement du dashboard admin...</p>

  return (
    <section className="panel">
      <h1>Dashboard Administration</h1>

      <div className="grid" style={{ marginBottom: '2rem' }}>
        <div className="card"><h3>Utilisateurs</h3><h2>{stats.total_users}</h2></div>
        <div className="card"><h3>Boutiques</h3><h2>{stats.total_shops}</h2></div>
        <div className="card"><h3>Commandes</h3><h2>{stats.total_orders}</h2></div>
        <div className="card"><h3>Chiffre d'affaires</h3><h2>{money(stats.total_revenue)}</h2></div>
      </div>

      <div className="grid">
        <div className="panel">
          <h2>Boutiques en attente ({pendingShops.length})</h2>
          {pendingShops.map(shop => (
            <div key={shop.id} className="card" style={{ marginBottom: '1rem' }}>
              <strong>{shop.name}</strong>
              <p>Par: {shop.user?.name} ({shop.user?.email})</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="button" onClick={() => handleApprove(shop.id)}>Approuver</button>
                <button className="button-danger" onClick={() => handleSuspend(shop.id)}>Rejeter</button>
              </div>
            </div>
          ))}
          {pendingShops.length === 0 && <p>Aucune boutique en attente.</p>}
        </div>

        <div className="panel">
          <h2>Derniers Avis</h2>
          {reviews.map(review => (
            <div key={review.id} className="card" style={{ marginBottom: '1rem' }}>
              <strong>Note: {review.rating}/5</strong>
              <p>{review.comment}</p>
              <p className="muted">Par: {review.user?.name} sur Commande {review.order?.reference}</p>
              <button className="link-danger" onClick={() => handleDeleteReview(review.id)}>Supprimer l'avis</button>
            </div>
          ))}
           {reviews.length === 0 && <p>Aucun avis à modérer.</p>}
        </div>
      </div>
    </section>
  )
}
