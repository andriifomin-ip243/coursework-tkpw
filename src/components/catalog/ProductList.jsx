import ProductCard from './ProductCard.jsx'
import EmptyState from '../ui/EmptyState.jsx'

export default function ProductList({
  items,
  selectedId,
  onSelect,
  emptyTitle = 'Дропи ще не додано.',
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <div className="product-grid">
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}