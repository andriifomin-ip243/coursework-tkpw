export default function OrderSummary({ productName, price, draft }) {
  const size = draft.size.trim()
  const contact = draft.contact.trim()
  const comment = draft.comment.trim()

  return (
    <aside aria-labelledby="order-summary-title" className="order-summary">
      <h3 id="order-summary-title">Поточна чернетка передзамовлення</h3>
      <dl>
        <dt>Вибраний дроп:</dt>
        <dd>{productName} ({price} грн)</dd>

        <dt>Розмір:</dt>
        <dd>{size || 'Не вказано'}</dd>

        <dt>Контакт для звʼязку:</dt>
        <dd>{contact || 'Не вказано'}</dd>

        <dt>Подарункове пакування:</dt>
        <dd>{draft.giftPackaging ? 'Так (+ крафтове пакування)' : 'Стандартне'}</dd>

        <dt>Коментар:</dt>
        <dd>{comment || 'Без додаткових побажань'}</dd>
      </dl>
      <p className="summary-disclaimer">Цей підсумок фіксує лише стан чернетки в браузері та не є оформленим чеком.</p>
    </aside>
  )
}