import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getSellerProducts, deleteProduct } from '../lib/api'

const money = (value) => `${Number(value ?? 0).toLocaleString('fr-MA')} DH`

export default function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    setLoading(true)
    getSellerProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return
    try {
      await deleteProduct(id)
      refresh()
    } catch (e) {
      alert(e.message)
    }
  }

  if (loading && products.length === 0) return <p>Chargement des produits...</p>

  return (
    <section className="panel">
      <div className="section__head">
        <h2>Mes produits</h2>
        <Link className="button" to="/seller/products/new">Nouveau Produit</Link>
      </div>

      <div className="orders-table">
        <div className="order-row head">
          <strong>Produit</strong>
          <span>Categorie</span>
          <span>Prix</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>
        {products.map((product) => (
          <div className="order-row" key={product.id}>
            <strong>{product.name}</strong>
            <span>{product.category?.name}</span>
            <span>{money(product.price)}</span>
            <span>{product.stock}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link className="chip" to={`/seller/products/${product.id}/edit`}>Editer</Link>
              <button className="link-danger" onClick={() => handleDelete(product.id)}>Supprimer</button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p style={{ padding: '2rem', textAlign: 'center' }}>Aucun produit pour le moment.</p>}
      </div>
    </section>
  )
}
