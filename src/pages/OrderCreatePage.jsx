import { Link, useNavigate, useSearchParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useProductSelection from '../hooks/useProductSelection.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderCreatePage({ items }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { selectedId, clearSelection } = useProductSelection()
  const productId = searchParams.get('productId')

  if (productId === null) {
    const lastSelectionSearch = selectedId
      ? `?${new URLSearchParams({ productId: selectedId })}`
      : null

    return (
      <div className="order-create-empty">
        <PageHeading title="Створення передзамовлення" />
        <EmptyState title="Річ для оформлення ще не вибрана">
          <p>
            Будь ласка, перейдіть до каталогу та оберіть потрібний дроп.
          </p>
          <div className="empty-actions">
            <Link to="/catalog" className="app-button app-button-primary">
              Відкрити каталог
            </Link>
            {lastSelectionSearch && (
              <Link
                to={`/orders/new${lastSelectionSearch}`}
                className="app-button app-button-secondary"
              >
                Використати останній вибір із вітрини
              </Link>
            )}
          </div>
        </EmptyState>
      </div>
    )
  }

  const item = items.find((entry) => entry.id === productId)

  if (!item) {
    return (
      <NotFoundPage
        title="404: Дроп не знайдено"
        message="Вказаний у посиланні товар відсутній у каталозі."
      />
    )
  }

  function handleCancel() {
    clearSelection()
    navigate('/catalog', { replace: true })
  }

  return (
    <OrderPage
      key={`new-${item.id}`}
      title="Нове передзамовлення"
      item={item}
      onCancel={handleCancel}
      cancelLabel="Скасувати вибір і повернутися до каталогу"
    />
  )
}