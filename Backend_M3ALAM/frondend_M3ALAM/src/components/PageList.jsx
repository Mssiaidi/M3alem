import { Link } from 'react-router-dom'

export default function PageList({ pages }) {
  return (
    <section className="panel">
      <div className="panel__head">
        <p className="eyebrow">Contenu dynamique</p>
        <h2>Pages disponibles</h2>
      </div>

      <div className="grid">
        {pages.map((page) => (
          <Link className="card" key={page.slug} to={`/pages/${page.slug}`}>
            <span className="card__tag">/{page.slug}</span>
            <strong>{page.title}</strong>
            <span className="card__hint">Ouvrir la vue detaillee</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
