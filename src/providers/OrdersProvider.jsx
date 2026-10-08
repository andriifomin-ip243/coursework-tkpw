import { useCallback, useEffect, useRef, useState } from 'react'
import { OrdersContext } from '../context/OrdersContext.js'
import { orderService } from '../services/orderService.js'
import { errorMessage } from '../services/ServiceError.js'

export default function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isMutating, setIsMutating] = useState(false)
  const activeRead = useRef(null)
  const readVersion = useRef(0)
  const mutationLock = useRef(false)
  const mounted = useRef(false)

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (mutationLock.current) return
    activeRead.current?.abort()
    const controller = new AbortController()
    activeRead.current = controller
    const version = ++readVersion.current

    if (!isInitial) {
      setStatus('loading')
      setError('')
    }

    try {
      const records = await orderService.getAll({ signal: controller.signal })
      if (controller.signal.aborted || version !== readVersion.current) return
      setOrders(records)
      setStatus('success')
    } catch (cause) {
      if (controller.signal.aborted || version !== readVersion.current) return
      setError(errorMessage(cause))
      setStatus('error')
    }
  }, [])

  const reload = useCallback(() => {
    return fetchOrders(false)
  }, [fetchOrders])

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    activeRead.current = controller
    const version = ++readVersion.current

    orderService
      .getAll({ signal: controller.signal })
      .then((records) => {
        if (!mounted.current || controller.signal.aborted || version !== readVersion.current) return
        setOrders(records)
        setStatus('success')
      })
      .catch((cause) => {
        if (!mounted.current || controller.signal.aborted || version !== readVersion.current) return
        setError(errorMessage(cause))
        setStatus('error')
      })

    return () => {
      mounted.current = false
      controller.abort()
      readVersion.current += 1
    }
  }, [])

  async function mutate(operation, apply, message) {
    if (mutationLock.current || status !== 'success') {
      return { ok: false, message: 'Дочекайтеся завершення поточної операції.' }
    }
    mutationLock.current = true
    setIsMutating(true)
    setNotice('')
    activeRead.current?.abort()
    readVersion.current += 1

    try {
      const record = await operation()
      if (mounted.current) {
        setOrders((previous) => apply(previous, record))
        setNotice(message)
      }
      return { ok: true, record }
    } catch (cause) {
      return {
        ok: false,
        message: errorMessage(cause),
        errors: cause.errors,
        code: cause.code,
      }
    } finally {
      mutationLock.current = false
      if (mounted.current) setIsMutating(false)
    }
  }

  function createOrder(input) {
    return mutate(
      () => orderService.create(input),
      (previous, record) => [
        ...previous.filter((entry) => entry.id !== record.id),
        record,
      ],
      'Передзамовлення успішно оформлено.',
    )
  }

  function updateOrder(id, input) {
    return mutate(
      () => orderService.update(id, input),
      (previous, record) => previous.map((entry) => (
        entry.id === id ? record : entry
      )),
      'Зміни заявки збережено.',
    )
  }

  function deleteOrder(id) {
    return mutate(
      () => orderService.delete(id),
      (previous) => previous.filter((entry) => entry.id !== id),
      'Заявку видалено.',
    )
  }

  function dismissNotice() {
    setNotice('')
  }

  return (
    <OrdersContext.Provider value={{
      orders,
      status,
      error,
      reload,
      isMutating,
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