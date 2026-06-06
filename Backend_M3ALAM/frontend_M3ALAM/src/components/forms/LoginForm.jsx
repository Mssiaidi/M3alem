import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, login } from '../../api/authService'

function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@m3alem.test')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email, password })
      const profile = await getProfile()

      if (profile?.role === 'admin') {
        navigate('/admin/dashboard')
        return
      }

      if (profile?.role === 'seller') {
        navigate('/seller/dashboard')
        return
      }

      navigate('/')
    } catch (err) {
      setError(
        err.message === 'Erreur API'
          ? 'Connexion refusée. Vérifie le rôle du compte ou les identifiants.'
          : err.message || 'Impossible de se connecter.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="static-form" onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
      <label className="static-form__field">
        <span>Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="static-form__field">
        <span>Mot de passe</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="static-form__actions">
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </form>
  )
}

export default LoginForm
