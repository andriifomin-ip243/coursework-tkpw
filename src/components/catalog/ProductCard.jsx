import ProductStatusBadge from './ProductStatusBadge.jsx'

export default function ProductCard({ item }) {
  return (
    <article className="product-card">
      <div className="product-card-header">
        <span className="product-collection">{item.collection}</span>
        <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
      </div>
      <h3>{item.name}</h3>
      <p className="product-description">{item.description}</p>
      <div className="product-card-footer">
        <span className="product-price">{item.price} грн</span>
      </div>
    </article>
  )
}