import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderForm({
  idPrefix,
  productName,
  draft,
  errors,
  operationError,
  onChange,
  onBlur,
  onSubmit,
  onReset,
  submitLabel,
}) {
  const contactId = `${idPrefix}-contact`
  const quantityId = `${idPrefix}-quantity`
  const packagingId = `${idPrefix}-packaging`
  const commentId = `${idPrefix}-comment`
  const hasErrors = Object.keys(errors).length > 0

  function describedBy(id, error) {
    return `${id}-hint${error ? ` ${id}-error` : ''}`
  }

  return (
    <form noValidate onSubmit={onSubmit} aria-label="Форма передзамовлення">
      <p><strong>Виріб:</strong> {productName}</p>
      <p className="field-hint">
        Збережіть зміни кнопкою нижче. Незбережене введення зникає при виході зі сторінки або її перезавантаженні.
      </p>

      {hasErrors && <p role="alert" className="field-error">Виправте позначені поля перед збереженням.</p>}
      {errors.productId && <p role="alert" className="field-error">{errors.productId}</p>}
      {operationError && <p role="alert" className="field-error">{operationError}</p>}

      <FormField
        id={contactId}
        label="Контакт для зв'язку (обов'язково)"
        hint="Нікнейм у Telegram (@handle) або номер телефону."
        error={errors.contact}
      >
        <input
          id={contactId}
          name="contact"
          type="text"
          required
          value={draft.contact}
          onChange={(event) => onChange('contact', event.target.value)}
          onBlur={() => onBlur('contact')}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={describedBy(contactId, errors.contact)}
        />
      </FormField>

      <FormField
        id={quantityId}
        label="Кількість одиниць (обов'язково)"
        hint="Ціле число від 1 до 5 одиниць в одні руки."
        error={errors.quantity}
      >
        <input
          id={quantityId}
          name="quantity"
          type="number"
          min={1}
          max={5}
          step={1}
          required
          value={draft.quantity}
          onChange={(event) => onChange('quantity', event.target.value)}
          onBlur={() => onBlur('quantity')}
          aria-invalid={Boolean(errors.quantity)}
          aria-describedby={describedBy(quantityId, errors.quantity)}
        />
      </FormField>

      <div className="form-field">
        <label className="checkbox-field" htmlFor={packagingId}>
          <input
            id={packagingId}
            name="giftPackaging"
            type="checkbox"
            checked={draft.giftPackaging}
            onChange={(event) => onChange('giftPackaging', event.target.checked)}
            onBlur={() => onBlur('giftPackaging')}
            aria-invalid={Boolean(errors.giftPackaging)}
            aria-describedby={describedBy(packagingId, errors.giftPackaging)}
          />
          Фірмове подарункове пакування MERA
        </label>
        <p id={`${packagingId}-hint`} className="field-hint">
          Для замовлень понад 3 одиниці пакування є обов'язковим (безкоштовно).
        </p>
        {errors.giftPackaging && (
          <p id={`${packagingId}-error`} className="field-error">{errors.giftPackaging}</p>
        )}
      </div>

      <FormField
        id={commentId}
        label="Деталі та розмір (обов'язково)"
        hint="Вкажіть розмір (S/M/L/XL), побажання до крою або місто доставки (від 10 до 300 символів)."
        error={errors.comment}
      >
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          required
          value={draft.comment}
          onChange={(event) => onChange('comment', event.target.value)}
          onBlur={() => onBlur('comment')}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={describedBy(commentId, errors.comment)}
        />
      </FormField>

      <div className="form-actions">
        <AppButton type="submit">{submitLabel}</AppButton>
        <AppButton variant="secondary" onClick={onReset}>
          Відновити початкові поля
        </AppButton>
      </div>
    </form>
  )
}