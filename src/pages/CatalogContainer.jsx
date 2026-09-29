import HomePage from './HomePage.jsx'
import useProductSelection from '../hooks/useProductSelection.js'

export default function CatalogContainer({ items }) {
  const { selectedId, selectProduct } = useProductSelection()

  return (
    <HomePage
      items={items}
      selectedId={selectedId}
      onSelect={selectProduct}
    />
  )
}