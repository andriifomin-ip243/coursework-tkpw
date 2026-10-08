import { useState } from 'react'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import ProductStatusBadge from '../components/catalog/ProductStatusBadge.jsx'
import OrderForm from '../components/orders/OrderForm.jsx'
import OrderSummary from '../components/orders/OrderSummary.jsx'
import { validateOrder } from '../domain/orderValidation.js'

const emptyDraft = {
  contact: '',
  quantity: '1',
  giftPackaging: false,
  comment: '',
}

export default function OrderPage({
  title,
  item,
  initialDraft = emptyDraft,
  onSave,
  onCancel,
  submitLabel,
  cancelLabel = 'Вийти без збереження',
}) {
  const initialValues = {
    contact: initialDraft.contact || '',
    quantity: String(initialDraft.quantity ?? '1'),
    giftPackaging: Boolean(initialDraft.giftPackaging),
    comment: initialDraft.comment || '',
  }

  const [draft, setDraft] = useState(() => ({ ...initialValues }))
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [operationError, setOperationError] = useState('')

  const validation = validateOrder({ ...draft, productId: item.id }, [item])

  const errors = Object.fromEntries(
    Object.entries(validation.errors).filter(([field]) => (
      attempted || touched[field]
    )),
  )

  const isDirty = draft.contact !== initialValues.contact
    || draft.quantity !== initialValues.quantity
    || draft.giftPackaging !== initialValues.giftPackaging
    || draft.comment !== initialValues.comment

  function handleChange(field, value) {
    setDraft((previous) => ({ ...previous, [field]: value }))
    setOperationError('')
  }

  function handleBlur(field) {
    setTouched((previous) => ({ ...previous, [field]: true }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    setOperationError('')

    if (!validation.ok) {
      const firstField = ['contact', 'quantity', 'giftPackaging', 'comment']
        .find((field) => validation.errors[field])
      if (firstField) {
        event.currentTarget.elements.namedItem(firstField)?.focus()
      }
      return
    }

    const result = onSave(validation.value)
    if (!result.ok) {
      setOperationError(result.message || Object.values(result.errors).join(' '))
    }
  }

  function handleReset() {
    if (!isDirty) return
    if (!window.confirm('Відкинути введені зміни та відновити початкові поля?')) {
      return
    }
    setDraft({ ...initialValues })
    setTouched({})
    setAttempted(false)
    setOperationError('')
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Вийти та відкинути незбережені зміни?')) {
      return
    }
    onCancel()
  }

  return (
    <div className="order-editor-page">
      <PageHeading title={title} />
      <Section id="order-editor" title="Поля та підсумок чернетки">
        <div className="product-status-row">
          <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
        </div>
        <OrderForm
          idPrefix="order-draft"
          productName={item.name}
          draft={draft}
          errors={errors}
          operationError={operationError}
          onChange={handleChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel={submitLabel}
        />
        <OrderSummary productName={item.name} draft={draft} />
      </Section>

      <div className="cancel-action-container">
        <AppButton variant="secondary" onClick={handleCancel}>
          {cancelLabel}
        </AppButton>
      </div>
    </div>
  )
}