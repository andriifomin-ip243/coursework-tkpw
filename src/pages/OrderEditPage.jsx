import { useNavigate, useParams } from 'react-router'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderEditPage({ orders, items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return (
      <NotFoundPage
        title="404: Заявку не знайдено"
        message="Запитувана чернетка передзамовлення відсутня серед збережених записів."
      />
    )
  }

  const item = items.find((entry) => entry.id === order.productId)

  if (!item) {
    return (
      <NotFoundPage
        title="404: Дроп вилучено"
        message="Річ, прив'язана до цієї заявки, більше не доступна в каталозі."
      />
    )
  }

  const initialDraft = {
    size: order.size,
    contact: order.contact,
    giftPackaging: order.giftPackaging,
    comment: order.comment,
  }

  return (
    <OrderPage
      key={`edit-${order.id}`}
      title={`Редагування заявки ${order.id}`}
      item={item}
      initialDraft={initialDraft}
      onCancel={() => navigate('/orders')}
      cancelLabel="Повернутися до списку заявок"
    />
  )
}