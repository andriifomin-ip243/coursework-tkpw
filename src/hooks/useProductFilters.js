import { useState } from 'react'

export default function useProductFilters(items) {
  const [query, setQuery] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleItems = items.filter((item) => (
    item.name.toLocaleLowerCase('uk').includes(normalizedQuery) &&
    (!availableOnly || item.status === 'available')
  ))

  function resetFilters() {
    setQuery('')
    setAvailableOnly(false)
  }

  return {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
    resetFilters,
  }
}