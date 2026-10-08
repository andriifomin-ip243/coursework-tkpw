import { useState } from 'react'
import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import OrderFilters from '../components/orders/OrderFilters.jsx'
import OrderTable from '../components/orders/OrderTable.jsx'
import useOrders from '../hooks/useOrders.js'
import useOrderFilters from '../hooks/useOrderFilters.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'

export default function OrdersPage({ items }) {
  const { orders } = useOrders()
  const filters = useOrderFilters(orders, items)
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  function handleDelete(order) {
    setError('')
    const result = deleteWithConfirmation(order)
    if (!result.ok && !result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="orders-page">
      <PageHeading title="Передзамовлення MERA" />
      <p>
        <Link to="new" className="app-button app-button-primary">
          Створити нову чернетку
        </Link>
      </p>

      <OrderFilters
        query={filters.query}
        packaging={filters.packaging}
        sort={filters.sort}
        onQueryChange={filters.setQuery}
        onPackagingChange={filters.setPackaging}
        onSortChange={filters.setSort}
        onReset={filters.resetFilters}
      />

      <p className="orders-count-info">
        Показано заявок: <strong>{filters.visibleOrders.length}</strong> із {orders.length}
      </p>

      {error && <p role="alert" className="field-error">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title="У поточній колекції ще немає збережених заявок.">
          <p>
            <Link to="/catalog">Відкрийте каталог та оберіть річ для замовлення</Link>
          </p>
        </EmptyState>
      ) : filters.visibleOrders.length === 0 ? (
        <EmptyState title="За цими умовами пошуку нічого не знайдено.">
          <AppButton variant="secondary" onClick={filters.resetFilters}>
            Скинути умови та показати всі
          </AppButton>
        </EmptyState>
      ) : (
        <OrderTable
          orders={filters.visibleOrders}
          items={items}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}