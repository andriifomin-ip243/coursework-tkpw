export default function OrderSummary({ productName, draft }) {
  return (
    <div className="order-summary-card">
      <h3>Підсумок чернетки</h3>
      <dl>
        <dt>Виріб</dt>
        <dd>{productName}</dd>
        <dt>Контакт</dt>
        <dd>{draft.contact || 'Не вказано'}</dd>
        <dt>Кількість, шт</dt>
        <dd>{draft.quantity === '' ? 'Не вказано' : draft.quantity}</dd>
        <dt>Фірмове пакування</dt>
        <dd>{draft.giftPackaging ? 'Так' : 'Ні'}</dd>
        <dt>Коментар / Розмір</dt>
        <dd>{draft.comment || 'Не заповнено'}</dd>
      </dl>
    </div>
  )
}