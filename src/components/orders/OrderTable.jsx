import { Link } from 'react-router'
import AppButton from '../ui/AppButton.jsx'

export default function OrderTable({ orders, items, onDelete }) {
  return (
    <div className="table-scroll">
      <table className="requests-table">
        <caption>Активні чернетки передзамовлень MERA</caption>
        <thead>
          <tr>
            <th scope="col">Виріб та коментар</th>
            <th scope="col">Кількість</th>
            <th scope="col">Пакування</th>
            <th scope="col">Контакт</th>
            <th scope="col">Дії</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const item = items.find((entry) => entry.id === order.productId)
            const path = `/orders/${encodeURIComponent(order.id)}`

            return (
              <tr key={order.id}>
                <td>
                  <strong>{item?.name ?? 'Річ вилучено з каталогу'}</strong>
                  <p className="order-table-comment">{order.comment}</p>
                </td>
                <td>{order.quantity} шт.</td>
                <td>{order.giftPackaging ? 'Подарункове' : 'Стандартне'}</td>
                <td>{order.contact}</td>
                <td className="table-actions-cell">
                  <Link to={path} className="table-link">
                    Переглянути
                  </Link>
                  <Link to={`${path}/edit`} className="table-link">
                    Редагувати
                  </Link>
                  <AppButton variant="secondary" onClick={() => onDelete(order)}>
                    Видалити
                  </AppButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}