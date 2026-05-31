import { useEffect, useState } from 'react'
import { getSellerShop, createShop } from '../lib/api'

export default function SellerShop() {
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', city: '', address: '' })

  useEffect(() => {
    getSellerShop().then(data => {
      setShop(data)
      if (data) {
        setForm({ name: data.name, description: data.description || '', city: data.city, address: data.address || '' })
      }
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await createShop(form)
      setShop(data)
      alert('Informations de la boutique enregistrees.')
    } catch (err) {
      alert('Erreur lors de l’enregistrement.')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <section className="auth-panel">
      <form className="form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Ma Boutique</p>
        <h1>Gestion Boutique</h1>

        {shop && (
            <div className={`chip ${shop.status === 'approved' ? 'success' : 'warning'}`} style={{ marginBottom: '1rem' }}>
                Statut : {shop.status === 'approved' ? 'Approuvee' : 'En attente de validation'}
            </div>
        )}

        <input className="field" placeholder="Nom de la boutique" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <textarea className="field" placeholder="Description de votre savoir-faire" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input className="field" placeholder="Ville" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
        <input className="field" placeholder="Adresse physique (optionnel)" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />

        <button className="button" type="submit">{shop ? 'Mettre a jour' : 'Creer ma boutique'}</button>
      </form>
    </section>
  )
}
