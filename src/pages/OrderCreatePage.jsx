import { useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useProductSelection from '../hooks/useProductSelection.js'
import useOrders from '../hooks/useOrders.js'
import OrderPage from './OrderPage.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderCreatePage({ items }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { selectedId, clearSelection } = useProductSelection()
  const { createOrder } = useOrders()

  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  const productId = searchParams.get('productId')

  if (productId === null) {
    const search = selectedId
      ? `?${new URLSearchParams({ productId: selectedId })}`
      : null

    return (
      <div className="order-create-empty">
        <PageHeading title="Нова чернетка передзамовлення" />
        <EmptyState title="Спочатку виберіть річ із каталогу.">
          <p><Link to="/catalog">Відкрити каталог MERA</Link></p>
          {search && <p><Link to={search}>Використати останній вибір</Link></p>}
        </EmptyState>
      </div>
    )
  }

  const item = items.find((entry) => entry.id === productId)

  if (!item) {
    return <NotFoundPage title="404: Річ для оформлення не знайдено" />
  }

  async function handleSave(input) {
    const result = await createOrder(input)
    if (result.ok && pageAlive.current) {
      navigate(`/orders/${encodeURIComponent(result.record.id)}`, {
        replace: true,
      })
    }
    return result
  }

  function handleCancel() {
    clearSelection()
    navigate('/catalog', { replace: true })
  }

  return (
    <OrderPage
      key={`new-${item.id}`}
      title="Нова чернетка передзамовлення"
      item={item}
      onSave={handleSave}
      submitLabel="Створити чернетку"
      onCancel={handleCancel}
      cancelLabel="Скасувати й повернутися до каталогу"
    />
  )
}