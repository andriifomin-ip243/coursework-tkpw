import { useState } from 'react'
import { OrdersContext } from '../context/OrdersContext.js'
import { initialOrders } from '../data/orders.js'
import { validateOrder } from '../domain/orderValidation.js'

export default function OrdersProvider({ items, children }) {
  const [orders, setOrders] = useState(() => (
    initialOrders.map((order) => ({ ...order }))
  ))
  const [notice, setNotice] = useState('')

  function createOrder(input) {
    const validation = validateOrder(input, items)
    if (!validation.ok) return validation

    const record = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      ...validation.value,
    }

    setOrders((previous) => [...previous, record])
    setNotice('Чернетку передзамовлення створено в поточній локальній колекції.')
    return { ok: true, record }
  }

  function updateOrder(id, input) {
    const current = orders.find((order) => order.id === id)
    if (!current) {
      return { ok: false, message: 'Заявку для оновлення не знайдено.' }
    }

    const validation = validateOrder(input, items)
    if (!validation.ok) return validation

    const record = { ...validation.value, id: current.id }
    setOrders((previous) => previous.map((order) => (
      order.id === id ? record : order
    )))
    setNotice('Зміни заявки збережено в поточній локальній колекції.')
    return { ok: true, record }
  }

  function deleteOrder(id) {
    if (!orders.some((order) => order.id === id)) {
      return { ok: false, message: 'Заявку для видалення не знайдено.' }
    }

    setOrders((previous) => previous.filter((order) => order.id !== id))
    setNotice('Заявку вилучено з поточної локальної колекції.')
    return { ok: true }
  }

  function dismissNotice() {
    setNotice('')
  }

  return (
    <OrdersContext.Provider value={{
      orders,
      createOrder,
      updateOrder,
      deleteOrder,
      notice,
      dismissNotice,
    }}>
      {children}
    </OrdersContext.Provider>
  )
}