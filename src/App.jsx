import AppLayout from './components/layout/AppLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import OrderPage from './pages/OrderPage.jsx'
import { apparelItems } from './data/items.js'

const navLinks = [
  { href: '#about', label: 'Про бренд' },
  { href: '#catalog', label: 'Каталог' },
  { href: '#order', label: 'Замовлення' },
]

export default function App() {
  const featuredItem = apparelItems[0]

  return (
    <AppLayout title="MERA Apparel" links={navLinks}>
      <HomePage />
      <OrderPage item={featuredItem} />
    </AppLayout>
  )
}