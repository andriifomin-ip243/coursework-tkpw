import { useState } from 'react'
import { Link } from 'react-router'
import ProductStatusBadge from './ProductStatusBadge.jsx'
import AppButton from '../ui/AppButton.jsx'

export default function ProductCard({ item, selected, onSelect }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const descriptionId = `product-${item.id}-description`

  return (
    <article className={`product-card ${selected ? 'product-card-selected' : ''}`}>
      <div className="product-card-header">
        <span className="product-collection">{item.collection}</span>
        <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
      </div>

      <h3>
        <Link to={`/catalog/${item.id}`} className="product-title-link">
          {item.name}
        </Link>
      </h3>

      <AppButton
        variant="secondary"
        aria-expanded={detailsOpen}
        aria-controls={descriptionId}
        onClick={() => setDetailsOpen((previous) => !previous)}
      >
        {detailsOpen ? 'Згорнути опис' : 'Показати опис'}
      </AppButton>

      <p id={descriptionId} hidden={!detailsOpen} className="product-description">
        {item.description}
      </p>

      <div className="product-card-footer">
        <span className="product-price">{item.price} грн</span>
        <AppButton
          aria-pressed={selected}
          onClick={() => onSelect(item.id)}
        >
          {selected ? 'Обрано' : `Вибрати «${item.name}»`}
        </AppButton>
      </div>

      {selected && <p className="selection-note">Обрано для передзамовлення.</p>}
    </article>
  )
}