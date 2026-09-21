import ProductCard from './ProductCard.jsx'
import EmptyState from '../ui/EmptyState.jsx'

export default function ProductList({ items }) {
  if (items.length === 0) {
    return (
      <EmptyState title="Дропи тимчасово відсутні.">
        <p>Наразі всі авторські колекції розпродано. Слідкуйте за анонсами наступного релізу.</p>
      </EmptyState>
    )
  }

  return (
    <div className="product-grid">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}