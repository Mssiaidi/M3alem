import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductById, getCategories, createProduct, updateProduct } from '../lib/api'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    is_active: true,
    images: []
  })

  useEffect(() => {
    getCategories().then(setCategories)
    if (isEdit) {
      getProductById(id).then(data => {
        setForm({
          name: data.name,
          description: data.description || '',
          price: data.price,
          stock: data.stock,
          category_id: data.category_id,
          is_active: data.is_active,
          images: data.images?.map(img => img.path) || []
        })
        setLoading(false)
      })
    }
  }, [id, isEdit])

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateProduct(id, form)
      } else {
        await createProduct(form)
      }
      navigate('/seller/products')
    } catch (err) {
      alert('Erreur lors de l’enregistrement du produit.')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <section className="auth-panel">
      <form className="form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Produit</p>
        <h1>{isEdit ? 'Modifier le produit' : 'Nouveau Produit'}</h1>

        <input className="field" placeholder="Nom du produit" value={form.name} onChange={e => update('name', e.target.value)} required />

        <select className="field" value={form.category_id} onChange={e => update('category_id', e.target.value)} required>
          <option value="">Choisir une categorie</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <textarea className="field" placeholder="Description" value={form.description} onChange={e => update('description', e.target.value)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <input className="field" type="number" placeholder="Prix (DH)" value={form.price} onChange={e => update('price', e.target.value)} required />
          <input className="field" type="number" placeholder="Stock" value={form.stock} onChange={e => update('stock', e.target.value)} required />
        </div>

        <div style={{ margin: '1rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => update('is_active', e.target.checked)} />
                <span>Produit actif (visible dans le catalogue)</span>
            </label>
        </div>

        <button className="button" type="submit">Enregistrer</button>
      </form>
    </section>
  )
}
