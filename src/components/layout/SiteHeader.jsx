import { Link } from 'react-router'
import MainNav from '../navigation/MainNav.jsx'

export default function SiteHeader({ title, links }) {
  return (
    <header className="site-header">
      <div className="site-header-container">
        <Link to="/" className="site-title">
          {title}
        </Link>
        <MainNav links={links} />
      </div>
    </header>
  )
}