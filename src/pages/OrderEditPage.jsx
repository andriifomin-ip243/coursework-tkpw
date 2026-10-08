import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'
import useOrders from '../hooks/useOrders.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderEditPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, updateOrder } = useOrders()

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
    return <NotFoundPage title="404: Заявку для редагування не знайдено" />
  }

  const item = items.find((entry) => entry.id === order.productId)

  if (!item) {
    return <NotFoundPage title="404: Річ вилучено з каталогу" />
  }

  async function handleSave(input) {
    const result = await updateOrder(order.id, input)
    if (result.ok && pageAlive.current && activeId.current === order.id) {
      navigate(`/orders/${encodeURIComponent(result.record.id)}`, {
        replace: true,
      })
    }
    return result
  }

  return (
    <OrderPage
      key={`edit-${order.id}`}
      title={`Редагування заявки ${order.id}`}
      item={item}
      initialDraft={{
        contact: order.contact,
        quantity: order.quantity,
        giftPackaging: order.giftPackaging,
        comment: order.comment,
      }}
      onSave={handleSave}
      submitLabel="Зберегти зміни"
      onCancel={() => navigate(`/orders/${encodeURIComponent(order.id)}`)}
      cancelLabel="Скасувати редагування"
    />
  )
}