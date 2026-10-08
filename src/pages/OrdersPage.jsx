import { useEffect, useRef, useState, Profiler } from 'react'
import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import OrderFilters from '../components/orders/OrderFilters.jsx'
import OrderTable from '../components/orders/OrderTable.jsx'
import useOrders from '../hooks/useOrders.js'
import useOrderFilters from '../hooks/useOrderFilters.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import { failNextMockOrder } from '../services/mockOrderService.js'

function reportRender(id, phase, actualDuration, baseDuration) {
  console.table([{
    component: id,
    phase,
    actualMs: Number(actualDuration.toFixed(2)),
    baseMs: Number(baseDuration.toFixed(2)),
  }])
}

export default function OrdersPage({ items }) {
  const { orders, reload, isMutating } = useOrders()
  const filters = useOrderFilters(orders, items)
  const deleteWithConfirmation = useDeleteOrder(items)
  const [error, setError] = useState('')

  const pageAlive = useRef(false)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  async function handleDelete(order) {
    setError('')
    const result = await deleteWithConfirmation(order)
    if (!pageAlive.current) return
    if (!result.ok && !result.cancelled) {
      setError(result.message)
    }
  }

  return (
    <div className="orders-page">
      <PageHeading title="Передзамовлення MERA" />

      <div className="orders-top-actions">
        <Link to="new" className="app-button app-button-primary">
          Створити нову чернетку
        </Link>
        <AppButton variant="secondary" onClick={() => void reload()} disabled={isMutating}>
          Оновити дані
        </AppButton>

        {import.meta.env.DEV && import.meta.env.VITE_DATA_SOURCE === 'mock' && (
          <AppButton
            variant="secondary"
            onClick={() => {
              failNextMockOrder('getAll')
              void reload()
            }}
            disabled={isMutating}
          >
            Імітувати відмову читання
          </AppButton>
        )}
      </div>

      <OrderFilters
        query={filters.query}
        packaging={filters.packaging}
        sort={filters.sort}
        onQueryChange={filters.setQuery}
        onPackagingChange={filters.setPackaging}
        onSortChange={filters.setSort}
        onReset={filters.resetFilters}
      />

      <div className="orders-status-bar">
        <p className="orders-count-info">
          Показано заявок: <strong>{filters.visibleOrders.length}</strong> із {orders.length}
        </p>
        {isMutating && <p className="field-hint" role="status">Опрацювання зміни…</p>}
      </div>

      {error && <p role="alert" className="field-error">{error}</p>}

      {orders.length === 0 ? (
        <EmptyState title="У поточному сховищі ще немає збережених заявок.">
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
        <Profiler id="OrderTable" onRender={reportRender}>
          <OrderTable
            orders={filters.visibleOrders}
            items={items}
            isMutating={isMutating}
            onDelete={handleDelete}
          />
        </Profiler>
      )}
    </div>
  )
}