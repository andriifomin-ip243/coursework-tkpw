import { Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout.jsx'
import OrdersLayout from './components/layout/OrdersLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import CatalogContainer from './pages/CatalogContainer.jsx'
import ProductDetailsPage from './pages/ProductDetailsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OrderCreatePage from './pages/OrderCreatePage.jsx'
import OrderDetailsPage from './pages/OrderDetailsPage.jsx'
import OrderEditPage from './pages/OrderEditPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import { apparelItems } from './data/items.js'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="catalog">
          <Route index element={<CatalogContainer items={apparelItems} />} />
          <Route path=":productId" element={<ProductDetailsPage items={apparelItems} />} />
        </Route>
        <Route path="orders" element={<OrdersLayout />}>
          <Route index element={<OrdersPage items={apparelItems} />} />
          <Route path="new" element={<OrderCreatePage items={apparelItems} />} />
          <Route path=":orderId" element={<OrderDetailsPage items={apparelItems} />} />
          <Route path=":orderId/edit" element={<OrderEditPage items={apparelItems} />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}