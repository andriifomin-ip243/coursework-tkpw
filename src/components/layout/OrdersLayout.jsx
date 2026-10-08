import { NavLink, Outlet } from 'react-router'
import OrderNotice from '../orders/OrderNotice.jsx'

export default function OrdersLayout() {
  return (
    <div className="orders-section-layout">
      <nav aria-label="Навігація розділу передзамовлень" className="sub-nav">
        <ul className="sub-nav-list">
          <li>
            <NavLink
              to="."
              end
              className={({ isActive }) => (
                isActive ? 'sub-nav-link active' : 'sub-nav-link'
              )}
            >
              Список заявок
            </NavLink>
          </li>
          <li>
            <NavLink
              to="new"
              className={({ isActive }) => (
                isActive ? 'sub-nav-link active' : 'sub-nav-link'
              )}
            >
              Нова чернетка
            </NavLink>
          </li>
        </ul>
      </nav>

      <p className="field-hint">Локальні дані зберігаються в пам'яті до перезавантаження сторінки.</p>
      <OrderNotice />

      <Outlet />
    </div>
  )
}