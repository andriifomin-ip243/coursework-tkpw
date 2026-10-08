import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import ProductStatusBadge from '../components/catalog/ProductStatusBadge.jsx'
import useProductSelection from '../hooks/useProductSelection.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function ProductDetailsPage({ items }) {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { selectProduct } = useProductSelection()

  const item = items.find((entry) => entry.id === productId)

  if (!item) {
    return (
      <NotFoundPage
        title="404: Річ не знайдено"
        message="Запитуваний товар відсутній у каталозі MERA або тираж було завершено."
      />
    )
  }

  function handlePrepareOrder() {
    selectProduct(item.id)
    const search = new URLSearchParams({ productId: item.id })
    navigate(`/orders/new?${search}`)
  }

  return (
    <div className="product-details-page">
      <PageHeading title={item.name} />

      <div className="product-details-card">
        <div className="product-card-header">
          <span className="product-collection">{item.collection}</span>
          <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
        </div>

        <p className="product-description">{item.description}</p>
        <p className="product-price"><strong>Ціна:</strong> {item.price} грн</p>

        <div className="product-details-actions">
          <AppButton onClick={handlePrepareOrder}>
            Вибрати й оформити передзамовлення
          </AppButton>
          <Link to="/catalog" className="app-button app-button-secondary">
            До каталогу без фільтрів
          </Link>
        </div>
      </div>
    </div>
  )
}