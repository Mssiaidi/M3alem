import { Link } from 'react-router-dom'

export default function PageView({ page }) {
  if (!page) {
    return (
      <section className="panel">
        <p className="eyebrow">Erreur</p>
        <h2>Page introuvable</h2>
        <p className="muted">La route demandee ne retourne aucune ressource API.</p>
        <Link className="button" to="/">
          Retour
        </Link>
      </section>
    )
  }

  return (
    <section className="panel panel--focus">
      <div className="panel__head">
        <p className="eyebrow">/{page.slug}</p>
        <h2>{page.title}</h2>
      </div>

      <article
        className="content"
        dangerouslySetInnerHTML={{ __html: page.content ?? '' }}
      />
    </section>
  )
}
