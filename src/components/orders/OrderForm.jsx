import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderForm({
  idPrefix,
  draft,
  errors,
  operationError,
  isSubmitting = false,
  onChange,
  onBlur,
  onSubmit,
  onReset,
  submitLabel,
}) {
  const contactId = `${idPrefix}-contact`
  const fullNameId = `${idPrefix}-fullname`
  const deliveryId = `${idPrefix}-delivery`
  const paymentId = `${idPrefix}-payment`
  const hasErrors = Object.keys(errors).length > 0

  function describedBy(id, error) {
    return `${id}-hint${error ? ` ${id}-error` : ''}`
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="Форма передзамовлення"
      aria-busy={isSubmitting}
    >
      <fieldset disabled={isSubmitting} className="order-form-fieldset">
        <legend className="visually-hidden">Контактні дані та доставка</legend>

        {hasErrors && (
          <p role="alert" className="field-error">
            Виправте позначені поля перед підтвердженням.
          </p>
        )}
        {operationError && <p role="alert" className="field-error">{operationError}</p>}

        <FormField
          id={fullNameId}
          label="ПІБ отримувача (обов'язково)"
          hint="Прізвище, Ім'я та По батькові."
          error={errors.fullName}
        >
          <input
            id={fullNameId}
            name="fullName"
            type="text"
            required
            value={draft.fullName || ''}
            onChange={(event) => onChange('fullName', event.target.value)}
            onBlur={() => onBlur('fullName')}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={describedBy(fullNameId, errors.fullName)}
          />
        </FormField>

        <FormField
          id={contactId}
          label="Номер телефону (обов'язково)"
          hint="Введіть контактний номер для зв'язку."
          error={errors.contact}
        >
          <input
            id={contactId}
            name="contact"
            type="tel"
            required
            placeholder="+380..."
            value={draft.contact}
            onChange={(event) => onChange('contact', event.target.value)}
            onBlur={() => onBlur('contact')}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={describedBy(contactId, errors.contact)}
          />
        </FormField>

        <FormField
          id={paymentId}
          label="Спосіб оплати"
          hint="Оберіть зручний варіант розрахунку."
        >
          <select
            id={paymentId}
            name="paymentMethod"
            value={draft.paymentMethod || ' післяплата'}
            onChange={(event) => onChange('paymentMethod', event.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff' }}
          >
            <option value="Накладений платіж (при отриманні)">Накладений платіж (при отриманні)</option>
            <option value="Повна передоплата на карту">Повна передоплата на карту</option>
          </select>
        </FormField>

        <FormField
          id={deliveryId}
          label="Доставка: Місто та відділення Нової Пошти (обов'язково)"
          hint="Вкажіть місто та номер відділення/поштомату."
          error={errors.delivery || errors.comment}
        >
          <textarea
            id={deliveryId}
            name="comment"
            rows={3}
            required
            placeholder="м. Івано-Франківськ, відділення №1..."
            value={draft.comment}
            onChange={(event) => onChange('comment', event.target.value)}
            onBlur={() => onBlur('comment')}
            aria-invalid={Boolean(errors.comment)}
            aria-describedby={describedBy(deliveryId, errors.comment)}
          />
        </FormField>

        <div className="form-actions" style={{ marginTop: '24px' }}>
          <AppButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Обробка замовлення…' : submitLabel}
          </AppButton>
          <AppButton variant="secondary" onClick={onReset} disabled={isSubmitting}>
            Очистити поля
          </AppButton>
        </div>
      </fieldset>
    </form>
  )
}