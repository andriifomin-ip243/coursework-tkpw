import useOrders from './useOrders.js'

export default function useDeleteOrder() {
  const { deleteOrder } = useOrders()

  return async function deleteWithConfirmation(order) {
    if (!order || !order.id) {
      return { ok: false, cancelled: true }
    }

    // Видаляємо напряму, оскільки підтвердження вже зроблено в модальному вікні
    return await deleteOrder(order.id)
  }
}