import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../lib/api'

export default function UserProfile() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfile().then(user => {
      setForm(prev => ({ ...prev, name: user.name, email: user.email }))
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    try {
      const updated = await updateProfile(form)
      localStorage.setItem('m3alem_user', JSON.stringify(updated))
      setMessage('Profil mis a jour avec succes.')
    } catch (err) {
      alert('Erreur lors de la mise a jour.')
    }
  }

  if (loading) return <p>Chargement...</p>

  return (
    <section className="auth-panel">
      <form className="form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Compte</p>
        <h1>Mon Profil</h1>

        {message && <p className="success-text">{message}</p>}

        <input className="field" placeholder="Nom complet" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />

        <hr style={{ margin: '1rem 0' }} />
        <p className="muted">Changer le mot de passe (laisser vide pour ne pas modifier)</p>

        <input className="field" type="password" placeholder="Nouveau mot de passe" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        <input className="field" type="password" placeholder="Confirmer le mot de passe" value={form.password_confirmation} onChange={e => setForm({...form, password_confirmation: e.target.value})} />

        <button className="button" type="submit">Enregistrer les modifications</button>
      </form>
    </section>
  )
}
