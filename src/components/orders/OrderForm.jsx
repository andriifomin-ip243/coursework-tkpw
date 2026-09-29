import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderForm({
  idPrefix,
  productName,
  price,
  draft,
  onFieldChange,
  onReset,
}) {
  const nameId = `${idPrefix}-item`
  const sizeId = `${idPrefix}-size`
  const contactId = `${idPrefix}-contact`
  const commentId = `${idPrefix}-comment`
  const giftId = `${idPrefix}-gift`
  const noticeId = `${idPrefix}-notice`

  return (
    <form
      aria-label="Чернетка заявки на передзамовлення речі"
      aria-describedby={noticeId}
      onSubmit={(event) => event.preventDefault()}
      className="order-form"
    >
      <p id={noticeId} className="form-notice">
        Чернетка зберігається в пам’яті до зміни речі, скасування вибору або перезавантаження сторінки. Заявка поки не надсилається на сервер.
      </p>

      <FormField id={nameId} label="Вибраний дроп">
        <input
          id={nameId}
          name="productName"
          value={`${productName} (${price} грн)`}
          readOnly
        />
      </FormField>

      <FormField id={sizeId} label="Розмір одягу" hint="Доступні стандартні унісекс-розміри: S, M, L, XL.">
        <input
          id={sizeId}
          name="size"
          value={draft.size}
          onChange={(event) => onFieldChange('size', event.target.value)}
          placeholder="Наприклад: L"
          aria-describedby={`${sizeId}-hint`}
        />
      </FormField>

      <FormField id={contactId} label="Контактний Telegram або телефон">
        <input
          id={contactId}
          name="contact"
          value={draft.contact}
          onChange={(event) => onFieldChange('contact', event.target.value)}
          placeholder="@username або +380..."
        />
      </FormField>

      <label className="checkbox-field">
        <input
          id={giftId}
          type="checkbox"
          name="giftPackaging"
          checked={draft.giftPackaging}
          onChange={(event) => onFieldChange('giftPackaging', event.target.checked)}
        />
        Потрібне подарункове крафтове пакування
      </label>

      <FormField id={commentId} label="Коментар до замовлення" hint="Побажання щодо доставки або мірок.">
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          value={draft.comment}
          onChange={(event) => onFieldChange('comment', event.target.value)}
          aria-describedby={`${commentId}-hint`}
        />
      </FormField>

      <div className="form-actions">
        <AppButton variant="secondary" onClick={onReset}>
          Очистити поля
        </AppButton>
        <AppButton disabled>Надсилання буде доступне пізніше</AppButton>
      </div>
    </form>
  )
}