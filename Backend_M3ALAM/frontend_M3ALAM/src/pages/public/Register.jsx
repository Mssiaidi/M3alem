import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../../api/authService'

const registerImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYSVX9ywMaZjoJ-LnBDZuM3WHwcSq8zi4d9zuzCH9iShQs6mU4PNUyQuMe6P9jlfVi01ylrkhYmY37J7H28TuXt5yXbVDHx-8kw59zUNeG6v74U-XueAoPom_olUkYDd0zSmdnrB7Dp4p8lH3Ri1SzcFw0WyQB7mPJpCQvIm4ew2FRxgDEq8YOZaxubAa6vPPtpOACdM5PMneOyQz5IlUCQNJGrH6zXlA0L8fLgxd1aifQg5wszMNCeocKFRFYSpMuAq1Fqg2NL2o'

function routeForRole(role) {
  if (role === 'seller') return '/seller/dashboard'
  return '/orders'
}

function registerErrorMessage(error) {
  const message = error.message || ''

  if (message.toLowerCase().includes('email')) {
    return 'Cette adresse e-mail est deja utilisee.'
  }

  return message || 'Inscription impossible. Verifiez les informations saisies.'
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    role: 'seller',
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validateForm = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return 'Le prénom et le nom sont obligatoires.'
    }

    if (form.password.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères.'
    }

    if (form.password !== form.passwordConfirmation) {
      return 'La confirmation du mot de passe ne correspond pas.'
    }

    if (!form.terms) {
      return 'Vous devez accepter les conditions pour créer un compte.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationMessage = validateForm()

    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await register({
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
        role: form.role,
      })

      navigate(routeForRole(data.user?.role), { replace: true })
    } catch (registerError) {
      setError(registerErrorMessage(registerError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="register-page">
      <div className="register-card">
        <aside className="register-card__visual">
          <img src={registerImage} alt="Atelier artisanal avec outils et matieres premium" />
          <div>
            <h1>Rejoignez l'élite de l'artisanat.</h1>
            <p>
              Accédez à une plateforme dediée aux créateurs et aux clients qui recherchent
              des pièces artisanales uniques.
            </p>

            <ul>
              <li>
                <span aria-hidden="true">OK</span>
                <div>
                  <strong>Qualite certifiée</strong>
                  <small>Des standards clairs pour chaque produit publié.</small>
                </div>
              </li>
              <li>
                <span aria-hidden="true">OK</span>
                <div>
                  <strong>Accées sécurisées</strong>
                  <small>Un compte protegé pour acheter ou vendre séreinement.</small>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <div className="register-card__form">
          <div className="register-card__intro">
            <h1>Créer un compte</h1>
            <p>Choisissez votre profil pour commencer.</p>
          </div>

          <div className="register-role-group" aria-label="Type de compte">
            <button
              className={form.role === 'seller' ? 'is-active' : ''}
              onClick={() => updateField('role', 'seller')}
              type="button"
            >
              <span className="register-role-icon" aria-hidden="true">V</span>
              <strong>Vendeur</strong>
              <small>Je souhaite vendre mes créations</small>
            </button>
            <button
              className={form.role === 'client' ? 'is-active' : ''}
              onClick={() => updateField('role', 'client')}
              type="button"
            >
              <span className="register-role-icon" aria-hidden="true">C</span>
              <strong>Client</strong>
              <small>Je souhaite acheter des produits</small>
            </button>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form__grid">
              <label>
                <span>Prénom</span>
                <input
                  autoComplete="given-name"
                  onChange={(event) => updateField('firstName', event.target.value)}
                  placeholder="Jean"
                  required
                  type="text"
                  value={form.firstName}
                />
              </label>

              <label>
                <span>Nom</span>
                <input
                  autoComplete="family-name"
                  onChange={(event) => updateField('lastName', event.target.value)}
                  placeholder="Dupont"
                  required
                  type="text"
                  value={form.lastName}
                />
              </label>
            </div>

            <label>
              <span>Adresse e-mail</span>
              <input
                autoComplete="email"
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="jean.dupont@exemple.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label>
              <span>Mot de passe</span>
              <div className="register-password-field">
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
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? 'Masquer' : 'Voir'}
                </button>
              </div>
              <small>Minimum 8 caracteres.</small>
            </label>

            <label>
              <span>Confirmer le mot de passe</span>
              <div className="register-password-field">
                <input
                  autoComplete="new-password"
                  onChange={(event) => updateField('passwordConfirmation', event.target.value)}
                  placeholder="********"
                  required
                  type={showConfirmation ? 'text' : 'password'}
                  value={form.passwordConfirmation}
                />
                <button
                  aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                  onClick={() => setShowConfirmation((current) => !current)}
                  type="button"
                >
                  {showConfirmation ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </label>

            <label className="register-terms">
              <input
                checked={form.terms}
                onChange={(event) => updateField('terms', event.target.checked)}
                type="checkbox"
              />
              <span>
                J'accepte les conditions générales et la politique de confidentialité.
              </span>
            </label>

            {error && <p className="login-error">{error}</p>}

            <button className="login-submit" disabled={loading} type="submit">
              {loading ? 'Creation du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="login-card__signup">
            <p>
              Déja membre ?
              {' '}
              <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Register
