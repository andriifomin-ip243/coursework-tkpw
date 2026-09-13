export default function ProductCard({ item }) {
  return (
    <li className="product-card">
      <h3 className="product-title">{item.name}</h3>
      <p className="product-collection">Колекція: {item.collection}</p>
      <p className="product-description">{item.description}</p>
      <div className="product-footer">
        <span className="product-price">{item.price} грн</span>
        <span className={`product-status status-${item.status}`}>
          {item.statusLabel}
        </span>
      </div>
    </li>
  );
}