import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

export default function OrdersPage({ orders, items }) {
  return (
    <div className="orders-page">
      <PageHeading title="Список передзамовлень" />
      <p>Нижче наведено локальні демонстраційні заявки для перевірки навігації.</p>

      {orders.length === 0 ? (
        <EmptyState title="Немає збережених заявок">
          <p>
            <Link to="new">Підготувати нову чернетку передзамовлення</Link>
          </p>
        </EmptyState>
      ) : (
        <div className="table-scroll">
          <table className="requests-table">
            <caption>Активні демонстраційні чернетки</caption>
            <thead>
              <tr>
                <th scope="col">Дроп одягу</th>
                <th scope="col">Розмір</th>
                <th scope="col">Контакт</th>
                <th scope="col">Дія</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const item = items.find((entry) => entry.id === order.productId)
                return (
                  <tr key={order.id}>
                    <td>{item?.name ?? 'Дроп вилучено з каталогу'}</td>
                    <td>{order.size || 'Не вказано'}</td>
                    <td>{order.contact || 'Не вказано'}</td>
                    <td>
                      <Link to={`${order.id}/edit`}>
                        Редагувати {order.id}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}