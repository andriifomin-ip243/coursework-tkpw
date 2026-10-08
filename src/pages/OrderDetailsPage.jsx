import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderDetailsPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders } = useOrders()
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return <NotFoundPage title="404: Заявку не знайдено" />
  }

  const item = items.find((entry) => entry.id === order.productId)

  function handleDelete() {
    setError('')
    const result = deleteWithConfirmation(order)
    if (result.ok) {
      navigate('/orders', { replace: true })
    } else if (!result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="order-details-page">
      <PageHeading title={`Заявка ${order.id}`} />
      {error && <p role="alert" className="field-error">{error}</p>}

      <div className="order-details-card">
        <dl>
          <dt>Виріб</dt>
          <dd><strong>{item?.name ?? 'Річ вилучено з каталогу'}</strong></dd>

          <dt>Контакт для зв'язку</dt>
          <dd>{order.contact}</dd>

          <dt>Кількість одиниць</dt>
          <dd>{order.quantity} шт.</dd>

          <dt>Фірмове пакування MERA</dt>
          <dd>{order.giftPackaging ? 'Потрібне (безкоштовний фірмовий бокс)' : 'Стандартне'}</dd>

          <dt>Деталі / Розмір / Адреса</dt>
          <dd>{order.comment}</dd>
        </dl>

        <p className="field-hint">
          Збережена чернетка фіксує ваш запит у локальній пам’яті браузера до перезавантаження.
        </p>

        <div className="order-details-actions">
          <Link
            to={`/orders/${encodeURIComponent(order.id)}/edit`}
            className="app-button app-button-primary"
          >
            Редагувати заявку
          </Link>

          <AppButton variant="secondary" onClick={handleDelete}>
            Видалити заявку
          </AppButton>

          <Link to="/orders" className="app-button app-button-secondary">
            До списку передзамовлень
          </Link>
        </div>
      </div>
    </div>
  )
}