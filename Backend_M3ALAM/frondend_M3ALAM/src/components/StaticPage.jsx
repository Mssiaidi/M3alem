export default function StaticPage({ page }) {
  if (!page) return null

  const renderSection = (section, index) => {
    if (!section?.type) return null

    if (section.type === 'toolbar') {
      return (
        <section className="static-section" key={`section-${index}`}>
          <div className="static-toolbar">
            <div className="static-toolbar__group">
              {(section.left ?? []).map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className="static-toolbar__group">
              {(section.right ?? []).map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      )
    }

    if (section.type === 'rows') {
      return (
        <section className="static-section" key={`section-${index}`}>
          {section.title ? (
            <div className="section__head">
              <div>
                <h2>{section.title}</h2>
              </div>
            </div>
          ) : null}
          <div className="static-ops">
            {(section.items ?? []).map((item) => (
              <article className="static-ops__item" key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                  {item.meta ? <p>{item.meta}</p> : null}
                </div>
                <div className="static-ops__actions">
                  {item.status ? <span className="chip">{item.status}</span> : null}
                  {(item.actions ?? []).map((action) => (
                    <span className="chip" key={`${item.title}-${action}`}>
                      {action}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (section.type === 'form') {
      return (
        <section className="static-section" key={`section-${index}`}>
          <div className="section__head">
            <div>
              <h2>{section.title}</h2>
            </div>
          </div>
          <div className="static-form">
            {(section.fields ?? []).map((field) => (
              <label className="static-form__field" key={field}>
                <span>{field}</span>
                <input disabled type="text" value="" readOnly />
              </label>
            ))}
            <div className="static-form__actions">
              {(section.actions ?? []).map((action, actionIndex) => (
                <span
                  className={actionIndex === 0 ? 'button' : 'button--ghost'}
                  key={`${section.title}-${action}`}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
        </section>
      )
    }

    return null
  }

  return (
    <div className="static-page">
      <section className={`static-hero ${page.theme ?? ''}`}>
        <div className="static-hero__content">
          <p className="eyebrow">{page.kicker}</p>
          <h1>{page.title}</h1>
          <p className="static-hero__lead">{page.lead}</p>
          {page.actions?.length ? (
            <div className="hero__actions">
              {page.actions.map((action) =>
                action.href ? (
                  <a key={action.label} className={action.variant ?? 'button'} href={action.href}>
                    {action.label}
                  </a>
                ) : null,
              )}
            </div>
          ) : null}
        </div>

        {page.heroAside ? (
          <aside className="static-hero__aside">
            {page.heroAside.map((item) => (
              <div key={item.label} className="static-metric">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </aside>
        ) : null}
      </section>

      {page.cards?.length ? (
        <section className="static-section">
          <div className="section__head">
            <div>
              <h2>{page.sectionTitle ?? 'Apercu'}</h2>
              {page.sectionLead ? <p>{page.sectionLead}</p> : null}
            </div>
          </div>

          <div className="static-cards">
            {page.cards.map((card) => (
              <article key={card.title} className="static-card">
                {card.tag ? <p className="eyebrow">{card.tag}</p> : null}
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {page.list?.length ? (
        <section className="static-section">
          <div className="section__head">
            <div>
              <h2>{page.listTitle ?? 'Contenu'}</h2>
              {page.listLead ? <p>{page.listLead}</p> : null}
            </div>
          </div>

          <div className="static-list">
            {page.list.map((item) => (
              <div key={item.title} className="static-list__item">
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {page.table ? (
        <section className="static-section">
          <div className="section__head">
            <div>
              <h2>{page.table.title}</h2>
              {page.table.lead ? <p>{page.table.lead}</p> : null}
            </div>
          </div>

          <div className="static-table">
            <div className="static-table__row static-table__head">
              {page.table.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            {page.table.rows.map((row, index) => (
              <div key={`${row[0]}-${index}`} className="static-table__row">
                {row.map((cell, cellIndex) => (
                  <span key={`${cell}-${cellIndex}`}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {page.sections?.length ? page.sections.map((section, index) => renderSection(section, index)) : null}
    </div>
  )
}
