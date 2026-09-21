import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderFormPreview({ idPrefix, productName, price }) {
  const nameId = `${idPrefix}-item`
  const sizeId = `${idPrefix}-size`
  const contactId = `${idPrefix}-contact`
  const commentId = `${idPrefix}-comment`
  const noticeId = `${idPrefix}-notice`

  return (
    <form
      aria-label="Макет заявки на передзамовлення речі"
      aria-describedby={noticeId}
      onSubmit={(e) => e.preventDefault()}
      className="order-form"
    >
      <p id={noticeId} className="form-notice">
        Це демонстраційний макет форми. Оформлення та збереження заявок буде реалізовано в наступних роботах.
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
          placeholder="Наприклад: L"
          defaultValue=""
          aria-describedby={`${sizeId}-hint`}
        />
      </FormField>

      <FormField id={contactId} label="Контактний Telegram або телефон">
        <input
          id={contactId}
          name="contact"
          placeholder="@username або +380..."
          defaultValue=""
        />
      </FormField>

      <FormField id={commentId} label="Коментар до замовлення" hint="Побажання щодо доставки або пакування.">
        <textarea
          id={commentId}
          name="comment"
          rows={3}
          defaultValue=""
          aria-describedby={`${commentId}-hint`}
        />
      </FormField>

      <div className="form-actions">
        <AppButton type="reset" variant="secondary">
          Очистити поля
        </AppButton>
        <AppButton disabled>Оформлення заявки (в розробці)</AppButton>
      </div>
    </form>
  )
}