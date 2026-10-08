export function selectOrders(orders, items, { query, packaging, sort }) {
  const names = new Map(items.map((item) => [item.id, item.name]))
  const normalizedQuery = query.trim().toLocaleLowerCase('uk')

  const visibleOrders = orders.filter((order) => {
    const productName = names.get(order.productId) ?? ''
    const text = `${productName} ${order.contact} ${order.comment}`.toLocaleLowerCase('uk')
    const matchesPackaging = packaging === 'all'
      || (packaging === 'gift' ? order.giftPackaging : !order.giftPackaging)

    return text.includes(normalizedQuery) && matchesPackaging
  })

  return visibleOrders.sort((a, b) => {
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
}