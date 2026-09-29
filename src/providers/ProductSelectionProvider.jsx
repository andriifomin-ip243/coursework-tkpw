import { useState } from 'react'
import { ProductSelectionContext } from '../context/ProductSelectionContext.js'

export default function ProductSelectionProvider({ items, children }) {
  const [selectedId, setSelectedId] = useState(null)
  const selectedItem = items.find((item) => item.id === selectedId)

  function selectProduct(id) {
    if (items.some((item) => item.id === id)) {
      setSelectedId(id)
    }
  }

  function clearSelection() {
    setSelectedId(null)
  }

  const value = {
    selectedId,
    selectedItem,
    selectProduct,
    clearSelection,
  }

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  )
}