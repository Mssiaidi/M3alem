export default function LoadingState() {
  return (
    <section className="panel">
      <p className="eyebrow">Chargement</p>
      <h2>Recuperation des donnees</h2>
      <p className="muted">Le frontend interroge Laravel via `/api/pages`.</p>
    </section>
  )
}
