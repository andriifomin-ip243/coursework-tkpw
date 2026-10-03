import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'

export default function NotFoundPage({
  title = '404: сторінку не знайдено',
  message = 'Перевірте правильність адреси або поверніться до каталогу дропів.',
}) {
  return (
    <div className="not-found-page">
      <PageHeading title={title} />
      <p>{message}</p>
      <div className="not-found-actions">
        <Link to="/catalog" className="app-button app-button-primary">
          Відкрити каталог
        </Link>
        <Link to="/" className="app-button app-button-secondary">
          На головну
        </Link>
      </div>
    </div>
  )
}