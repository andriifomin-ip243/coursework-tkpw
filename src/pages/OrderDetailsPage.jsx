import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderDetailsPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, isMutating } = useOrders()
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  const pageAlive = useRef(false)
  const activeId = useRef(orderId)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  useEffect(() => {
    activeId.current = orderId
    return () => {
      activeId.current = null
    }
  }, [orderId])

  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return <NotFoundPage title="404: Заявку не знайдено" />
  }

  const item = items.find((entry) => entry.id === order.productId)

  async function handleDelete() {
    if (isMutating) return
    setError('')
    const result = await deleteWithConfirmation(order)
    if (!pageAlive.current || activeId.current !== order.id) return

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
          {isMutating ? 'Опрацювання зміни…' : 'Дані синхронізовано з обраним сервісом.'}
        </p>

        <div className="order-details-actions">
          <Link
            to={`/orders/${encodeURIComponent(order.id)}/edit`}
            className={`app-button app-button-primary ${isMutating ? 'disabled' : ''}`}
            aria-disabled={isMutating}
          >
            Редагувати заявку
          </Link>

          <AppButton variant="secondary" onClick={handleDelete} disabled={isMutating}>
            {isMutating ? 'Видалення…' : 'Видалити заявку'}
          </AppButton>

          <Link to="/orders" className="app-button app-button-secondary">
            До списку передзамовлень
          </Link>
        </div>
      </div>
    </div>
  )
}