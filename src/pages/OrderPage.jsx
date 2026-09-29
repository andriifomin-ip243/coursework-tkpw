import { useEffect, useState } from 'react'
import Section from '../components/ui/Section.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import ProductStatusBadge from '../components/catalog/ProductStatusBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'

function createEmptyDraft() {
  return {
    size: '',
    contact: '',
    giftPackaging: false,
    comment: '',
  }
}

export default function OrderPage({ item, onClearSelection }) {
  const [draft, setDraft] = useState(createEmptyDraft)
  const title = item ? `MERA: ${item.name}` : 'MERA Apparel'

  useEffect(() => {
    const previousTitle = document.title
    document.title = title

    return () => {
      document.title = previousTitle
    }
  }, [title])

  function handleFieldChange(field, value) {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleReset() {
    setDraft(createEmptyDraft())
  }

  if (!item) {
    return (
      <Section id="order" title="Оформлення передзамовлення">
        <EmptyState title="Річ для замовлення ще не вибрана.">
          <p>
            <a href="#catalog">Перейдіть до каталогу та оберіть потрібний дроп</a>
          </p>
        </EmptyState>
      </Section>
    )
  }

  return (
    <Section id="order" title="Оформлення передзамовлення">
      <div className="order-item-summary">
        <p>
          Обрано: <strong>{item.name}</strong> ({item.price} грн) —{' '}
          <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
        </p>
      </div>

      <div className="order-content-layout">
        <OrderForm
          idPrefix="order-draft"
          productName={item.name}
          price={item.price}
          draft={draft}
          onFieldChange={handleFieldChange}
          onReset={handleReset}
        />
        <OrderSummary
          productName={item.name}
          price={item.price}
          draft={draft}
        />
      </div>

      <div className="order-actions">
        <AppButton variant="secondary" onClick={onClearSelection}>
          Скасувати вибір речі та скинути чернетку
        </AppButton>
      </div>
    </Section>
  )
}