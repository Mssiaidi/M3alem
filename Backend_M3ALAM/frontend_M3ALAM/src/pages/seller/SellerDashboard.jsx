import { useRef, useState } from 'react'

const recentOrders = [
  {
    icon: 'shopping_bag',
    name: 'Table en chêne sculptée',
    meta: 'Commande #9921 • il y a 2 heures',
    amount: '8,500.00 DH',
    status: 'En préparation',
    statusClass: 'seller-dashboard-status--processing',
  },
  {
    icon: 'brush',
    name: 'Service céramique personnalisé',
    meta: 'Commande #9918 • il y a 5 heures',
    amount: '1,200.00 DH',
    status: 'Expédiée',
    statusClass: 'seller-dashboard-status--shipped',
  },
  {
    icon: 'diamond',
    name: 'Bague artisanale en argent',
    meta: 'Commande #9915 • hier',
    amount: '3,400.00 DH',
    status: 'Livrée',
    statusClass: 'seller-dashboard-status--delivered',
  },
]

function SellerDashboard() {
  const documentInputRef = useRef(null)
  const [documentName, setDocumentName] = useState('')

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0]
    setDocumentName(file?.name ?? '')
  }

  return (
    <div className="seller-dashboard-page">
      <section className="seller-dashboard-kpis">
        <article className="seller-dashboard-card seller-dashboard-kpi">
          <div>
            <span>Total Revenue</span>
            <h2>42,500 DH</h2>
          </div>
          <div className="seller-dashboard-trend">
            <span className="material-symbols-outlined">trending_up</span>
            +12.5% from last month
          </div>
        </article>

        <article className="seller-dashboard-card seller-dashboard-kpi">
          <div>
            <span>Active Orders</span>
            <h2>24</h2>
          </div>
          <div>
            <span className="seller-dashboard-urgent">
              <span className="material-symbols-outlined">priority_high</span>
              3 Urgent
            </span>
          </div>
        </article>

        <article className="seller-dashboard-card seller-dashboard-kpi">
          <div>
            <span>Store Rating</span>
            <h2>4.9</h2>
          </div>
          <div className="seller-dashboard-stars">
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star_half</span>
          </div>
        </article>

        <article className="seller-dashboard-verified">
          <span className="material-symbols-outlined">verified</span>
          <h3>Verified Master</h3>
          <p>Top 5% Artisan Tier</p>
          <strong>LEVEL 4</strong>
        </article>
      </section>

      <section className="seller-dashboard-grid">
        <article className="seller-dashboard-orders">
          <header>
            <h3>Recent Orders</h3>
            <button type="button">View All</button>
          </header>

          <div className="seller-dashboard-order-list">
            {recentOrders.map((order) => (
              <div className="seller-dashboard-order" key={order.meta}>
                <div className="seller-dashboard-order-main">
                  <div className="seller-dashboard-order-icon">
                    <span className="material-symbols-outlined">{order.icon}</span>
                  </div>
                  <div>
                    <p>{order.name}</p>
                    <small>{order.meta}</small>
                  </div>
                </div>
                <div className="seller-dashboard-order-side">
                  <strong>{order.amount}</strong>
                  <span className={order.statusClass}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="seller-dashboard-side">
          <article className="seller-dashboard-alert">
            <span className="material-symbols-outlined">warning</span>
            <div>
              <h4>Profile Verification Update</h4>
              <p>Your "Vérifié" status expires in 5 days. Please update your master certification documents.</p>
              <input
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleDocumentChange}
                ref={documentInputRef}
                type="file"
              />
              <button onClick={() => documentInputRef.current?.click()} type="button">Upload Documents</button>
              {documentName ? <small>Document sélectionné : {documentName}</small> : null}
            </div>
          </article>

          <article className="seller-dashboard-capacity">
            <h4>Workshop Capacity</h4>
            <div className="seller-dashboard-progress-row">
              <div>
                <span>Woodworking 101</span>
                <span>85% Full</span>
              </div>
              <div className="seller-dashboard-progress">
                <span style={{ width: '85%' }} />
              </div>
            </div>
            <div className="seller-dashboard-progress-row">
              <div>
                <span>Advanced Pottery</span>
                <span>40% Full</span>
              </div>
              <div className="seller-dashboard-progress">
                <span style={{ width: '40%' }} />
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}

export default SellerDashboard
