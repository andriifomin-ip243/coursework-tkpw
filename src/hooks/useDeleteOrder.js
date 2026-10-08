import useOrders from './useOrders.js'

export default function useDeleteOrder(items) {
  const { deleteOrder } = useOrders()

  return async function deleteWithConfirmation(order) {
    const item = items.find((entry) => entry.id === order.productId)
    const name = item?.name ?? order.productId

    const confirmed = window.confirm(
      `Видалити передзамовлення ${order.id} на «${name}»? `
      + 'Запис буде вилучено з джерела даних. Скасування видалення не передбачено.',
    )

    if (!confirmed) return { ok: false, cancelled: true }

    return await deleteOrder(order.id)
  }
}