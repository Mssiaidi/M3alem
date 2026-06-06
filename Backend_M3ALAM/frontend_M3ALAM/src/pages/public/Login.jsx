import LoginForm from '../../components/forms/LoginForm'

function Login() {
  return (
    <div className="auth-panel">
      <section className="form-card">
        <span className="tag">Connexion</span>
        <h1>Accédez à votre espace M3alem</h1>
        <p className="muted">
          Pour tester l’espace admin, utilisez le compte de démonstration du seeder.
        </p>
        <div className="static-list" style={{ marginTop: '0.75rem' }}>
          <div className="static-list__item">
            <span>Email admin</span>
            <strong>admin@m3alem.test</strong>
          </div>
          <div className="static-list__item">
            <span>Mot de passe</span>
            <strong>password</strong>
          </div>
        </div>
        <LoginForm />
      </section>
    </div>
  )
}

export default Login
