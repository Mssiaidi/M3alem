import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/authService'

const inspirationImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuACginxueXGGk0VmT2bFVKCyRTT4UU4ryjBLKpLK7nAGnB8mGZnUEhI9-HUVfxQkXaHNGfHgLn6Cha_5_0KcchmQWj_pE4z86o_cNv7Z0p3EdNXX2DSqtYxBXD8F_T47vM8mA-Nn835YoyWnGXFrdIpQzS2Gy9PbHQizqAXb-oOq6n4-gunN9Sdj7Ea3rQMtg0mmPSXaolF2wwL14GPVSb78rJA-VLNuk8bSAJu7DLk-nklnfSsarIZ4QBWHZ32PY05hpMC35JoPrU'

function routeForRole(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'seller') return '/seller/dashboard'
  return '/orders'
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await login(
        {
          email: form.email,
          password: form.password,
        },
        form.remember,
      )

      navigate(routeForRole(data.user?.role), { replace: true })
    } catch (loginError) {
      setError(loginError.message || 'Connexion impossible. Verifiez vos identifiants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-card__form">
          <div className="login-card__intro">
            <h1>M3alem Marketplace</h1>
            <p>Accédez a votre portail artisan professionnel.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>Adresse e-mail</span>
              <div className="login-field">
                <span className="login-field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M4 6h16v12H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </span>
                <input
                  autoComplete="off"
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="artisan@exemple.com"
                  required
                  type="email"
                  value={form.email}
                />
              </div>
            </label>

            <label>
              <span>Mot de passe</span>
              <div className="login-field">
                <span className="login-field__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder="********"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                />
                <button
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="login-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </label>

            <div className="login-form__options">
              <label className="login-remember">
                <input
                  checked={form.remember}
                  onChange={(event) => updateField('remember', event.target.checked)}
                  type="checkbox"
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/login">Mot de passe oublié ?</Link>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button className="login-submit" disabled={loading} type="submit">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="login-card__signup">
            <p>
              Nouveau sur la plateforme ?
              {' '}
              <Link to="/register">Créer un compte</Link>
            </p>
          </div>
        </div>

        <aside className="login-card__visual">
          <img src={inspirationImage} alt="Atelier artisanal avec outils et bois sculpte" />
          <div>
            <span>Qualite Certifiee</span>
            <h2>"L'excellence se cache dans les details de chaque geste."</h2>
            <p>- Maitre Artisan, M3alem Network</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Login
