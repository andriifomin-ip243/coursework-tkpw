import { Outlet } from 'react-router'
import OrdersGate from '../orders/OrdersGate.jsx'

export default function OrdersLayout() {
  return (
    <div className="orders-section-layout">
      <OrdersGate>
        <Outlet />
      </OrdersGate>
    </div>
  )
}