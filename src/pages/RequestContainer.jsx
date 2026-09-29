import OrderPage from './OrderPage.jsx'
import useProductSelection from '../hooks/useProductSelection.js'

export default function RequestContainer() {
  const { selectedId, selectedItem, clearSelection } = useProductSelection()

  return (
    <OrderPage
      key={selectedId ?? 'empty'}
      item={selectedItem}
      onClearSelection={clearSelection}
    />
  )
}