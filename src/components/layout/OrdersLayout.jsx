import { Outlet } from 'react-router'
import useOrders from '../../hooks/useOrders.js'
import OrdersGate from '../orders/OrdersGate.jsx'

export default function OrdersLayout() {
  const { notice, dismissNotice } = useOrders()

  return (
    <div className="orders-section-layout">
      {notice && (
        <aside className="operation-notice" role="status" aria-live="polite">
          <p>{notice}</p>
          <button
            type="button"
            className="app-button app-button-secondary"
            onClick={dismissNotice}
          >
            Закрити повідомлення
          </button>
        </aside>
      )}

      <OrdersGate>
        <Outlet />
      </OrdersGate>
    </div>
  )
}