import { useEffect, useState } from 'react'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../lib/api'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', is_active: true })

  const refresh = () => getAdminCategories().then(setCategories)

  useEffect(() => {
    refresh()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateCategory(editing.id, form)
      } else {
        await createCategory(form)
      }
      setEditing(null)
      setForm({ name: '', description: '', is_active: true })
      refresh()
    } catch (err) {
      alert(err.message)
    }
  }

  const startEdit = (cat) => {
    setEditing(cat)
    setForm({ name: cat.name, description: cat.description || '', is_active: cat.is_active })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette categorie ?')) return
    try {
      await deleteCategory(id)
      refresh()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <section className="panel">
      <h1>Gestion des Categories</h1>

      <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <h3>{editing ? 'Modifier' : 'Ajouter'} une categorie</h3>
        <input className="field" placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <textarea className="field" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
            <span>Active</span>
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="button" type="submit">{editing ? 'Mettre a jour' : 'Creer'}</button>
          {editing && <button className="button--ghost" type="button" onClick={() => { setEditing(null); setForm({name:'', description:'', is_active: true}); }}>Annuler</button>}
        </div>
      </form>

      <div className="orders-table">
        <div className="order-row head">
          <strong>Nom</strong>
          <span>Description</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {categories.map(cat => (
          <div className="order-row" key={cat.id}>
            <strong>{cat.name}</strong>
            <span>{cat.description}</span>
            <span>{cat.is_active ? 'Active' : 'Inactive'}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="chip" onClick={() => startEdit(cat)}>Editer</button>
              <button className="link-danger" onClick={() => handleDelete(cat.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
