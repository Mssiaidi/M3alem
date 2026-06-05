import { Link, useLocation } from 'react-router-dom'
import { pageLinkGroups } from '../../router/pageLinks'

function isActivePath(currentPath, linkPath) {
  if (linkPath === '/') return currentPath === '/'
  return currentPath === linkPath
}

function TeamWorkBar() {
  const location = useLocation()

  return (
    <aside className="team-work-bar" aria-label="Routes temporaires de travail">
      <div className="team-work-bar__inner">
        <div className="team-work-bar__intro">
          <strong>Travail en groupe</strong>
          <span>Navigation temporaire pour tester les 23 pages.</span>
        </div>

        <div className="team-work-bar__groups">
          {pageLinkGroups.map((group) => (
            <section className="team-work-bar__group" key={group.title}>
              <h2>{group.title}</h2>
              <div className="team-work-bar__links">
                {group.links.map((link) => (
                  <Link
                    className={isActivePath(location.pathname, link.path) ? 'is-active' : ''}
                    key={link.path}
                    to={link.path}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default TeamWorkBar
