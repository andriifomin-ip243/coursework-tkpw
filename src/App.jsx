import AppLayout from './components/layout/AppLayout.jsx'
import ProductSelectionProvider from './providers/ProductSelectionProvider.jsx'
import CatalogContainer from './pages/CatalogContainer.jsx'
import RequestContainer from './pages/RequestContainer.jsx'
import { apparelItems } from './data/items.js'

const navLinks = [
  { href: '#about', label: 'Про бренд' },
  { href: '#catalog', label: 'Каталог' },
  { href: '#order', label: 'Замовлення' },
]

export default function App() {
  return (
    <AppLayout title="MERA Apparel" links={navLinks}>
      <ProductSelectionProvider items={apparelItems}>
        <CatalogContainer items={apparelItems} />
        <RequestContainer />
      </ProductSelectionProvider>
    </AppLayout>
  )
}