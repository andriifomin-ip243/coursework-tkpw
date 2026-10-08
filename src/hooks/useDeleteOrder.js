import useOrders from './useOrders.js'

export default function useDeleteOrder(items) {
  const { deleteOrder } = useOrders()

  return function deleteWithConfirmation(order) {
    const item = items.find((entry) => entry.id === order.productId)
    const name = item?.name ?? order.productId

    const confirmed = window.confirm(
      `Видалити заявку ${order.id} на «${name}»? `
      + 'Запис буде вилучено з поточної колекції. Скасування видалення не передбачено.',
    )

    if (!confirmed) return { ok: false, cancelled: true }

    return deleteOrder(order.id)
  }
}