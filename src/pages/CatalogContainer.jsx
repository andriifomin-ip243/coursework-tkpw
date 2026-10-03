import CatalogPage from './CatalogPage.jsx'
import useProductSelection from '../hooks/useProductSelection.js'

export default function CatalogContainer({ items }) {
  const { selectedId, selectProduct } = useProductSelection()

  return (
    <CatalogPage
      items={items}
      selectedId={selectedId}
      onSelect={selectProduct}
    />
  )
}