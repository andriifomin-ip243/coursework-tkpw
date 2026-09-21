import Section from '../components/ui/Section.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import ProductStatusBadge from '../components/catalog/ProductStatusBadge.jsx'
import OrderFormPreview from '../components/orders/OrderFormPreview.jsx'

export default function OrderPage({ item }) {
  return (
    <Section id="order" title="Оформлення заявки на річ">
      {item ? (
        <>
          <div className="order-item-summary">
            <p>
              Вибрано: <strong>{item.name}</strong> —{' '}
              <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
            </p>
          </div>
          <OrderFormPreview
            idPrefix="order-preview"
            productName={item.name}
            price={item.price}
          />
        </>
      ) : (
        <EmptyState title="Річ для оформлення не вибрана.">
          <p><a href="#catalog">Повернутися до каталогу та обрати модель</a></p>
        </EmptyState>
      )}
    </Section>
  )
}