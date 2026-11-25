import { NavLink } from 'react-router'

export default function MainNav({ links }) {
  return (
    <nav aria-label="Основна навігація">
      <style>{`
        .nav-list .nav-link {
          transition: background-color 0.24s cubic-bezier(0.22, 1, 0.36, 1),
                      color 0.2s ease,
                      box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.14s ease;
        }
        .nav-list .nav-link:active {
          transform: scale(0.97);
        }
        .nav-list .nav-link.active {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
        }
      `}</style>
      <ul className="nav-list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => (
                isActive ? 'nav-link active' : 'nav-link'
              )}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}