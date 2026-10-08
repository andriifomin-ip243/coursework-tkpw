import { Outlet } from 'react-router'
import SiteHeader from './SiteHeader.jsx'
import ProductSelectionProvider from '../../providers/ProductSelectionProvider.jsx'
import OrdersProvider from '../../providers/OrdersProvider.jsx'
import { apparelItems } from '../../data/items.js'

const navigationLinks = [
  { to: '/', label: 'Головна', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/orders', label: 'Передзамовлення' },
]

export default function AppLayout() {
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Перейти до вмісту
      </a>
      <SiteHeader title="MERA Apparel" links={navigationLinks} />

      <main id="main-content" className="site-main" tabIndex={-1}>
        <ProductSelectionProvider items={apparelItems}>
          <OrdersProvider items={apparelItems}>
            <Outlet />
          </OrdersProvider>
        </ProductSelectionProvider>
      </main>

      <footer className="site-footer">
        <p>© 2026 MERA Apparel. Авторський streetwear обмеженого тиражу.</p>
      </footer>
    </div>
  )
}