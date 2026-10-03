import { useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import ProductStatusBadge from '../components/catalog/ProductStatusBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'

const defaultEmptyDraft = {
  size: '',
  contact: '',
  giftPackaging: false,
  comment: '',
}

export default function OrderPage({
  title,
  item,
  initialDraft = defaultEmptyDraft,
  onCancel,
  cancelLabel = 'Вийти без збереження',
}) {
  const [draft, setDraft] = useState(() => ({ ...initialDraft }))

  function handleFieldChange(field, value) {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleReset() {
    setDraft({ ...defaultEmptyDraft })
  }

  return (
    <div className="order-page-wrapper">
      <PageHeading title={title} />

      <Section id="order" title="Деталі чернетки">
        <div className="order-item-summary">
          <p>
            Обрано дроп: <strong>{item.name}</strong> ({item.price} грн) —{' '}
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
          <AppButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </AppButton>
        </div>
      </Section>
    </div>
  )
}