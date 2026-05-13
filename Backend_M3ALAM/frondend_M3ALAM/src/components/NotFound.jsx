import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="panel">
      <p className="eyebrow">404</p>
      <h2>Route introuvable</h2>
      <p className="muted">La page React demandee ne correspond a aucun slug connu.</p>
      <Link className="button" to="/">
        Revenir a l'accueil
      </Link>
    </section>
  )
}
