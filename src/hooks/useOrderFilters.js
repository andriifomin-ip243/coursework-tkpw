import { useSearchParams } from 'react-router'
import { selectOrders } from '../domain/selectOrders.js'

export default function useOrderFilters(orders, items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const rawPackaging = searchParams.get('packaging')
  const packaging = ['gift', 'standard'].includes(rawPackaging) ? rawPackaging : 'all'

  const rawSort = searchParams.get('sort')
  const sort = ['quantity-asc', 'quantity-desc'].includes(rawSort)
    ? rawSort
    : 'product'

  const visibleOrders = selectOrders(orders, items, { query, packaging, sort })

  function setParameter(name, value, defaultValue, replace = false) {
    const next = new URLSearchParams(searchParams)
    if (value === defaultValue) next.delete(name)
    else next.set(name, value)
    setSearchParams(next, { replace })
  }

  function resetFilters() {
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    next.delete('packaging')
    next.delete('sort')
    setSearchParams(next)
  }

  return {
    query,
    packaging,
    sort,
    visibleOrders,
    setQuery: (value) => setParameter('q', value, '', true),
    setPackaging: (value) => setParameter('packaging', value, 'all'),
    setSort: (value) => setParameter('sort', value, 'product'),
    resetFilters,
  }
}