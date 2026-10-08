import { useSearchParams } from 'react-router'

export default function useOrderFilters(orders, items) {
  const [searchParams, setSearchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const rawPackaging = searchParams.get('packaging')
  const packaging = ['gift', 'standard'].includes(rawPackaging) ? rawPackaging : 'all'

  const rawSort = searchParams.get('sort')
  const sort = ['quantity-asc', 'quantity-desc'].includes(rawSort)
    ? rawSort
    : 'product'

  const names = new Map(items.map((item) => [item.id, item.name]))
  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleOrders = orders.filter((order) => {
    const productName = names.get(order.productId) ?? ''
    const text = `${productName} ${order.contact} ${order.comment}`.toLocaleLowerCase('uk')

    const matchesPackaging = packaging === 'all'
      || (packaging === 'gift' ? order.giftPackaging : !order.giftPackaging)

    return text.includes(normalizedQuery) && matchesPackaging
  })

  visibleOrders.sort((a, b) => {
    if (sort === 'quantity-asc') {
      return a.quantity - b.quantity || a.id.localeCompare(b.id)
    }
    if (sort === 'quantity-desc') {
      return b.quantity - a.quantity || a.id.localeCompare(b.id)
    }
    const nameA = names.get(a.productId) ?? ''
    const nameB = names.get(b.productId) ?? ''
    return nameA.localeCompare(nameB, 'uk') || a.id.localeCompare(b.id)
  })

  function setParameter(name, value, defaultValue, replace = false) {
    const next = new URLSearchParams(searchParams)
    if (value === defaultValue) {
      next.delete(name)
    } else {
      next.set(name, value)
    }
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