import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import useOrders from '../../hooks/useOrders.js'

function resolveItemImage(entry, catalogItems) {
  if (entry?.image) return entry.image
  if (entry?.images?.[0]?.url) return entry.images[0].url
  const found = catalogItems.find((c) => c.id === entry?.id)
  return found?.image || found?.images?.[0]?.url || null
}

export default function OrderTable({ orders, items, isMutating, highlightId }) {
  const { deleteOrder } = useOrders()
  const [activeHighlightId, setActiveHighlightId] = useState(highlightId)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [copiedOrderId, setCopiedOrderId] = useState(null)
  const [expandedOrders, setExpandedOrders] = useState({})

  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => {
        setActiveHighlightId(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [highlightId])

  function handleCopyOrderId(orderId) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(orderId).catch(() => {})
    }
    setCopiedOrderId(orderId)
    setTimeout(() => {
      setCopiedOrderId((prev) => (prev === orderId ? null : prev))
    }, 1800)
  }

  function toggleExpandOrder(orderId) {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  async function handleConfirmCancel() {
    if (orderToCancel) {
      await deleteOrder(orderToCancel.id)
      setOrderToCancel(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
      {orders.map((order) => {
        const orderItemsList = Array.isArray(order.items) && order.items.length > 0
          ? order.items
          : (() => {
              const found = items.find((entry) => entry.id === order.productId)
              return found
                ? [{
                    ...found,
                    selectedSize: order.selectedSize,
                    selectedColor: order.selectedColor,
                    quantity: order.quantity || 1
                  }]
                : []
            })()

        const primaryItem = orderItemsList[0] || items.find((entry) => entry.id === order.productId) || null
        const extraItems = orderItemsList.length > 1 ? orderItemsList.slice(1) : []
        const extraItemsCount = extraItems.length
        const isExpanded = Boolean(expandedOrders[order.id])

        const primaryImageUrl = resolveItemImage(primaryItem, items)

        const totalAmount =
          typeof order.totalAmount === 'number'
            ? order.totalAmount
            : orderItemsList.length > 0
              ? orderItemsList.reduce((sum, entry) => sum + (Number(entry.price) || 0) * (entry.quantity || 1), 0)
              : (Number(primaryItem?.price) || 0) * (Number(order.quantity) || 1)

        const path = `/orders/${encodeURIComponent(order.id)}`
        const isHighlighted = activeHighlightId === order.id
        const isCopied = copiedOrderId === order.id

        const status = (order.status || 'in_progress').toLowerCase()
        const isPending = status === 'in_progress' || status === 'pending' || status === 'waiting'

        return (
          <div
            key={order.id}
            style={{
              background: isHighlighted ? '#faf5ff' : '#fff',
              borderRadius: '16px',
              padding: '22px 24px',
              border: isHighlighted ? '2px solid #7c3aed' : '1px solid #eaeaea',
              boxShadow: isHighlighted ? '0 8px 24px rgba(124, 58, 237, 0.14)' : '0 4px 20px rgba(0,0,0,0.02)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '24px',
              alignItems: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Ліва частина: номер, статус, головний товар, кнопка "Ще N" та загальна сума внизу */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleCopyOrderId(order.id)}
                  title="Скопіювати номер замовлення"
                  style={{
                    background: isCopied ? '#7c3aed' : isHighlighted ? '#7c3aed' : '#111',
                    color: '#fff',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <span>{order.id}</span>
                  <span style={{ opacity: 0.9, fontSize: '10px' }}>
                    {isCopied ? '✓' : ''}
                  </span>
                </button>

                {isHighlighted && (
                  <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                    Нове
                  </span>
                )}

                {order.giftPackaging && (
                  <span style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                    Подарункове пакування
                  </span>
                )}

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: isPending ? '#fef3c7' : '#d1fae5',
                  color: isPending ? '#92400e' : '#065f46'
                }}>
                  {isPending ? 'В роботі / Очікує' : '✓ Виконано'}
                </span>
              </div>

              {/* Головний рядок товару */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {primaryImageUrl ? (
                  <img
                    src={primaryImageUrl}
                    alt={primaryItem?.name || 'Товар'}
                    style={{
                      width: '56px',
                      height: '56px',
                      objectFit: 'cover',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '10px',
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#6b7280',
                      flexShrink: 0
                    }}
                  >
                    MERA
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: 0 }}>
                    {primaryItem?.name ?? 'Річ вилучено з каталогу'}
                  </h3>

                  {extraItemsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpandOrder(order.id)}
                      style={{
                        background: isExpanded ? '#7c3aed' : '#f5f3ff',
                        color: isExpanded ? '#fff' : '#7c3aed',
                        border: '1px solid #ddd6fe',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isExpanded ? 'Згорнути' : `Ще ${extraItemsCount}`}
                    </button>
                  )}
                </div>
              </div>

              {/* Розгорнутий список додаткових товарів (без дублювання першого) */}
              {isExpanded && extraItems.length > 0 && (
                <div style={{
                  background: '#fafafa',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {extraItems.map((entry, idx) => {
                    const entryImg = resolveItemImage(entry, items)
                    const entrySize = entry.selectedSize || entry.size
                    const entryColor = entry.selectedColor || entry.color

                    return (
                      <div
                        key={`${entry.id || idx}-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          paddingBottom: idx < extraItems.length - 1 ? '10px' : 0,
                          borderBottom: idx < extraItems.length - 1 ? '1px solid #eceef2' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          {entryImg ? (
                            <img
                              src={entryImg}
                              alt={entry.name}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                flexShrink: 0
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                background: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                fontWeight: 800,
                                color: '#6b7280',
                                flexShrink: 0
                              }}
                            >
                              MERA
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                              {entry.name}
                            </span>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px', color: '#4b5563' }}>
                              {entrySize && <span>Розмір: <strong>{entrySize}</strong></span>}
                              {entryColor && <span>Колір: <strong>{entryColor}</strong></span>}
                              <span>Кількість: <strong>{entry.quantity || 1} шт.</strong></span>
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#111', whiteSpace: 'nowrap' }}>
                          {(Number(entry.price) || 0) * (entry.quantity || 1)} ₴
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Загальна сума замовлення внизу */}
              <div style={{
                paddingTop: '4px',
                fontSize: '14px',
                fontWeight: 800,
                color: '#111',
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px'
              }}>
                <span>Разом: {totalAmount} ₴</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>
                  без доставки
                </span>
              </div>
            </div>

            {/* Права панель з кнопками дій */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '172px', alignItems: 'stretch' }}>
              <Link
                to={path}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  padding: '9px 16px',
                  borderRadius: '30px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.22)'
                }}
              >
                Переглянути
              </Link>

              {isPending ? (
                <Link
                  to={`${path}/edit`}
                  style={{
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  Редагувати
                </Link>
              ) : (
                <span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', padding: '6px 0' }}>
                  Редагування недоступне
                </span>
              )}

              {isPending ? (
                <button
                  type="button"
                  onClick={() => setOrderToCancel(order)}
                  disabled={isMutating}
                  style={{
                    width: '100%',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: '30px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    cursor: isMutating ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box',
                    opacity: isMutating ? 0.6 : 1
                  }}
                >
                  Скасувати замовлення
                </button>
              ) : (
                <span style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', padding: '6px 0' }}>
                  Скасування недоступне
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* МОДАЛЬНЕ ВІКНО ПІДТВЕРДЖЕННЯ СКАСУВАННЯ */}
      {orderToCancel && (
        <div
          onClick={() => setOrderToCancel(null)}
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
              Ви дійсно хочете скасувати заявку <strong>{orderToCancel.id}</strong>? Цю дію неможливо скасувати.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
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
                onClick={handleConfirmCancel}
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