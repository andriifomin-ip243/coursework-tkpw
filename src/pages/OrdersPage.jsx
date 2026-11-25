import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import EmptyState from '../components/ui/EmptyState.jsx'
import OrderTable from '../components/orders/OrderTable.jsx'
import useOrders from '../hooks/useOrders.js'
import useOrderFilters from '../hooks/useOrderFilters.js'

export default function OrdersPage({ items }) {
  const { orders, isMutating } = useOrders()
  const filters = useOrderFilters(orders, items)
  const location = useLocation()
  const highlightId = location?.state?.highlightId || null

  const [activeTab, setActiveTab] = useState('all')

  const tabFilteredOrders = filters.visibleOrders.filter(order => {
    const status = (order.status || 'in_progress').toLowerCase()
    if (activeTab === 'in_progress') {
      return status === 'in_progress' || status === 'pending' || status === 'waiting'
    }
    if (activeTab === 'completed') {
      return status === 'completed' || status === 'done' || status === 'delivered'
    }
    return true
  })

  return (
    <div className="orders-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>

      {/* ЕДИНА ПАНЕЛЬ КЕРУВАННЯ: Вкладки + Пошук посередині + Кнопка справа */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
          background: '#fff',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >

        {/* 1. Вкладки статусів зліва */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Усі замовлення' },
            { id: 'in_progress', label: 'В роботі / Очікують' },
            { id: 'completed', label: 'Виконані' }
          ].map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? '#7c3aed' : '#f5f3ff',
                  color: isActive ? '#fff' : '#5b21b6',
                  border: isActive ? '1px solid #7c3aed' : '1px solid #ddd6fe',
                  borderRadius: '30px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none'
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* 2. Пошуковий рядок посередині */}
        <div style={{ flex: 1, maxWidth: '380px', minWidth: '240px' }}>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => filters.setQuery(e.target.value)}
            placeholder="Пошук передзамовлень (назва, контакт)..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              fontSize: '13px',
              outline: 'none',
              background: '#fff',
              color: '#111',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* 3. Кнопка створення замовлення справа */}
        <div>
          <Link
            to="/catalog"
            style={{
              textDecoration: 'none',
              padding: '10px 18px',
              borderRadius: '30px',
              background: '#7c3aed',
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            + Нове замовлення
          </Link>
        </div>
      </div>

      {/* КОНТЕНТ ЗАМОВЛЕНЬ */}
      {orders.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px 24px',
            border: '1px solid #eaeaea',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}
        >
          <EmptyState title="У поточному сховищі ще немає збережених заявок.">
            <p style={{ marginTop: '12px', marginBottom: 0 }}>
              <Link
                to="/catalog"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  background: '#7c3aed',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                }}
              >
                Відкрити каталог та обрати річ для замовлення
              </Link>
            </p>
          </EmptyState>
        </div>
      ) : tabFilteredOrders.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px 24px',
            border: '1px solid #eaeaea',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}
        >
          <EmptyState title="За цими умовами та обраним статусом нічого не знайдено.">
            <div style={{ marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  filters.resetFilters()
                  setActiveTab('all')
                }}
                style={{
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  border: '1px solid #ddd6fe',
                  borderRadius: '30px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Скинути фільтри та показати всі
              </button>
            </div>
          </EmptyState>
        </div>
      ) : (
        <OrderTable
          orders={tabFilteredOrders}
          items={items}
          isMutating={isMutating}
          highlightId={highlightId}
        />
      )}
    </div>
  )
}