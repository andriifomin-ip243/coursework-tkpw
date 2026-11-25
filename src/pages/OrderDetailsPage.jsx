import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import useOrders from '../hooks/useOrders.js'
import useDeleteOrder from '../hooks/useDeleteOrder.js'
import NotFoundPage from './NotFoundPage.jsx'

export default function OrderDetailsPage({ items }) {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, isMutating } = useOrders()
  const deleteWithConfirmation = useDeleteOrder()
  const [error, setError] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const pageAlive = useRef(false)
  const activeId = useRef(orderId)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  useEffect(() => {
    activeId.current = orderId
    return () => {
      activeId.current = null
    }
  }, [orderId])

  const order = orders.find((entry) => entry.id === orderId)

  if (!order) {
    return <NotFoundPage title="404: Заявку не знайдено" />
  }

  const orderItemsList = (order.items && Array.isArray(order.items) && order.items.length > 0)
    ? order.items
    : (items.filter(catItem => order.comment && order.comment.includes(catItem.name)).length > 0
        ? items.filter(catItem => order.comment && order.comment.includes(catItem.name)).map(catItem => ({
            id: catItem.id,
            quantity: 1,
            selectedSize: 'Standard'
          }))
        : [{ id: order.productId, quantity: order.quantity, selectedSize: 'Standard' }]
      )

  const commentText = order.comment || ''

  const deliveryMatch = commentText.match(/Спосіб доставки:\s*(.*)/)
  const deliveryType = order.deliveryType || (deliveryMatch ? deliveryMatch[1].trim() : 'nova_poshta_branch')

  const paymentMatch = commentText.match(/Оплата:\s*(.*)/)
  const paymentMethod = order.paymentMethod || (paymentMatch ? paymentMatch[1].trim() : 'card_prepaid')

  const telegramMatch = commentText.match(/Telegram:\s*(.*)/)
  const rawTelegram = (order.telegram || (telegramMatch ? telegramMatch[1].trim() : '')).trim()
  const hasTelegram = rawTelegram !== '' && rawTelegram.toLowerCase() !== 'не вказано'
  const formattedTelegram = hasTelegram
    ? (rawTelegram.startsWith('@') ? rawTelegram : `@${rawTelegram}`)
    : ''

  const addressMatch = commentText.match(/Адреса:\s*(.*)/)
  const address = order.address || (addressMatch ? addressMatch[1].trim() : '') || 'Адреса не вказана'

  function formatDelivery(type) {
    switch (type) {
      case 'nova_poshta_branch': return 'Нова Пошта (у відділення)'
      case 'nova_poshta_courier': return 'Нова Пошта (кур’єром)'
      case 'ukrposhta': return 'Укрпошта (у відділення)'
      case 'pickup': return 'Самовивіз (Івано-Франківськ)'
      default: return type || 'Нова Пошта (у відділення)'
    }
  }

  function formatPayment(method) {
    switch (method) {
      case 'card_prepaid': return 'Повна передоплата на карту'
      case 'cash_on_delivery': return 'Оплата при отриманні'
      default: return method || 'Повна передоплата на карту'
    }
  }

  const cleanComment = commentText.includes('Коментар клієнта:')
    ? commentText.split('Коментар клієнта:')[1]?.trim()
    : (commentText.includes('Спосіб доставки') ? '' : commentText)

  async function handleDeleteConfirm() {
    if (isMutating) return
    setError('')
    const result = await deleteWithConfirmation(order)
    if (!pageAlive.current || activeId.current !== order.id) return

    if (result?.ok !== false) {
      navigate('/orders', { replace: true })
    } else {
      setError(result.message || 'Помилка видалення')
      setShowDeleteModal(false)
    }
  }

  const status = (order.status || 'in_progress').toLowerCase()
  const isPending = status === 'in_progress' || status === 'pending' || status === 'waiting'

  return (
    <div className="order-details-page" style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 20px' }}>

      {/* Шапка заявки зі статусом */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <PageHeading title={`Заявка ${order.id}`} />
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          padding: '6px 12px',
          borderRadius: '8px',
          background: isPending ? '#fef3c7' : '#d1fae5',
          color: isPending ? '#92400e' : '#065f46'
        }}>
          {isPending ? 'В роботі / Очікує підтвердження' : 'Виконано'}
        </span>
      </div>

      {error && (
        <p role="alert" className="field-error" style={{ color: '#dc2626', fontWeight: 700, marginBottom: '16px' }}>
          {error}
        </p>
      )}

      {/* Основна картка інформації */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #eaeaea', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* БЛОК УСІХ ЗАМОВЛЕНИХ ТОВАРІВ */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginTop: 0, marginBottom: '12px', letterSpacing: '0.5px' }}>
            Замовлені вироби ({orderItemsList.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orderItemsList.map((position, index) => {
              const catalogItem = items.find((entry) => entry.id === position.id || entry.id === position.productId)
              const imageUrl = catalogItem?.images?.[0]?.url || catalogItem?.image || null

              return (
                <div key={index} style={{ display: 'flex', gap: '18px', alignItems: 'center', background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #eceef2' }}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={catalogItem?.name ?? position.name ?? 'Товар'}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e5e7eb', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: '72px', height: '72px', background: '#f3f4f6', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#6b7280', textAlign: 'center', padding: '4px', flexShrink: 0 }}>
                      MERA
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#111', margin: 0 }}>
                      {catalogItem?.name ?? position.name ?? 'Річ вилучено з каталогу'}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
                      Кількість: <strong>{position.quantity} шт.</strong>
                      {position.selectedSize ? ` • Розмір: ${position.selectedSize}` : ''}
                      {catalogItem?.price ? ` • Ціна: ${catalogItem.price} ₴` : (position.price ? ` • Ціна: ${position.price} ₴` : '')}
                    </p>

                    <div style={{ marginTop: '4px' }}>
                      {position.giftPackaging ? (
                        <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '3px 8px', borderRadius: '8px', fontWeight: 700, display: 'inline-block' }}>
                          Фірмове подарункове пакування
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
                          Стандартне пакування
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* СТИЛІЗОВАНІ БЛОКИ ІНФОРМАЦІЇ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>

          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #eceef2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Контакт для зв'язку</span>
            <strong style={{ fontSize: '14px', color: '#111', marginTop: '2px' }}>{order.contact}</strong>
            {hasTelegram && (
              <span style={{ fontSize: '12px', color: '#4b5563' }}>Telegram: {formattedTelegram}</span>
            )}
          </div>

          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #eceef2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Доставка</span>
            <strong style={{ fontSize: '14px', color: '#111', marginTop: '2px' }}>{formatDelivery(deliveryType)}</strong>
            <span style={{ fontSize: '12px', color: '#4b5563' }}>{address || (commentText.includes('Склад замовлення') ? 'Адреса вказана у формах оформлення' : commentText)}</span>
          </div>

          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #eceef2', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Оплата</span>
            <strong style={{ fontSize: '14px', color: '#111', marginTop: '2px' }}>{formatPayment(paymentMethod)}</strong>
          </div>

        </div>

        {/* КОМЕНТАР КЛІЄНТА */}
        {cleanComment && cleanComment.trim() !== '' && (
          <div style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #eceef2' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Коментар клієнта
            </span>
            <p style={{ fontSize: '13px', color: '#333', margin: 0, whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {cleanComment}
            </p>
          </div>
        )}

        {/* КНОПКИ ДІЙ */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #eceef2', alignItems: 'center' }}>

          <Link
            to="/orders"
            style={{
              background: '#f5f3ff',
              color: '#7c3aed',
              border: '1px solid #ddd6fe',
              padding: '10px 20px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            До списку передзамовлень
          </Link>

          {isPending ? (
            <Link
              to={`/orders/${encodeURIComponent(order.id)}/edit`}
              style={{
                background: '#7c3aed',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
            >
              Редагувати заявку
            </Link>
          ) : (
            <span style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center' }}>Редагування недоступне</span>
          )}

          {isPending ? (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isMutating}
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '30px',
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px 20px',
                cursor: isMutating ? 'not-allowed' : 'pointer',
                opacity: isMutating ? 0.6 : 1,
                marginLeft: 'auto'
              }}
            >
              Скасувати замовлення
            </button>
          ) : (
            <span style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center', marginLeft: 'auto' }}>Скасування недоступне</span>
          )}

        </div>
      </div>

      {/* МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ СКАСУВАННЯ */}
      {showDeleteModal && (
        <div
          onClick={() => setShowDeleteModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 17, 17, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '20px',
              maxWidth: '380px',
              width: '100%',
              border: '1px solid #eaeaea',
              boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0 }}>
              Скасувати передзамовлення?
            </h3>
            <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.5 }}>
              Ви дійсно хочете скасувати заявку <strong>{order.id}</strong>? Цю дію неможливо скасувати.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '30px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#111',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Назад
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '30px',
                  border: 'none',
                  background: '#7c3aed',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                }}
              >
                Так, скасувати
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}