import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import AppButton from '../ui/AppButton.jsx'

const COLOR_KEYWORDS = ['чорний', 'сірий', 'білий']

function normalizeColorLabel(color) {
  if (!color) return null
  const trimmed = String(color).trim()
  const lower = trimmed.toLowerCase()
  if (!trimmed || lower === 'standard' || lower === 'default') return null
  return trimmed
}

function resolveCartItemImage(item) {
  const realColor = normalizeColorLabel(item.selectedColor || item.color)

  if (realColor && Array.isArray(item.images) && item.images.length > 0) {
    const targetColor = realColor.toLowerCase()
    const colorMatch = item.images.find((img) => {
      if (!img?.url) return false
      if (img.color && String(img.color).trim().toLowerCase() === targetColor) return true
      const text = `${img.title || ''} ${img.alt || ''}`.toLowerCase()
      return text.includes(targetColor) || (!img.color && COLOR_KEYWORDS.includes(targetColor) && text.includes(targetColor))
    })
    if (colorMatch?.url) return colorMatch.url
  }

  return item.image || item.images?.[0]?.url || null
}

function TrashIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onRemove,
  onClear,
  onUpdateQuantity
}) {
  const navigate = useNavigate()
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false)

  if (!isOpen) return null

  const showConfirmClear = isConfirmClearOpen && cartItems.length > 0
  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)

  function handleCloseDrawer() {
    setIsConfirmClearOpen(false)
    onClose()
  }

  function handleCheckout() {
    setIsConfirmClearOpen(false)
    onClose()
    navigate('/orders/new', { state: { cartItems } })
  }

  function handleGoToCatalog() {
    setIsConfirmClearOpen(false)
    onClose()
    navigate('/catalog')
  }

  function handleChangeQty(item, delta) {
    const currentQty = item.quantity || 1
    const nextQty = currentQty + delta
    if (nextQty < 1) return

    if (typeof onUpdateQuantity === 'function') {
      onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, nextQty)
    }
  }

  function handleConfirmClear() {
    setIsConfirmClearOpen(false)
    if (typeof onClear === 'function') {
      onClear()
    }
  }

  return (
    <div
      className="cart-drawer-overlay"
      onClick={handleCloseDrawer}
    >
      <div
        className="cart-drawer"
        style={{ position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="cart-drawer-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eaeaea'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Кошик</h2>
          <button
            type="button"
            className="close-drawer-btn"
            onClick={handleCloseDrawer}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#333' }}
          >
            &times;
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', paddingTop: '10px' }}>
              <p className="empty-cart-text" style={{ margin: 0, color: '#555' }}>Ваш кошик наразі порожній.</p>
              <button
                type="button"
                onClick={handleGoToCatalog}
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                }}
              >
                Перейти до каталогу
              </button>
            </div>
          ) : (
            <ul className="cart-items-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cartItems.map((item) => {
                const imageUrl = resolveCartItemImage(item)
                const colorLabel = normalizeColorLabel(item.selectedColor || item.color)
                const qty = item.quantity || 1

                return (
                  <li
                    key={`${item.id}-${item.selectedSize || 'default'}-${colorLabel || 'default'}-${item.isGiftPackage ? 'gift' : 'base'}-${qty}`}
                    className="cart-item-row"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 0',
                      borderBottom: '1px solid #eaeaea'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <Link
                        to={`/catalog/${item.id}`}
                        onClick={handleCloseDrawer}
                        style={{ flexShrink: 0, textDecoration: 'none' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            style={{
                              width: '56px',
                              height: '56px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '56px',
                              height: '56px',
                              background: '#f3f4f6',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#6b7280'
                            }}
                          >
                            MERA
                          </div>
                        )}
                      </Link>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, lineHeight: 1.3 }}>
                          <Link
                            to={`/catalog/${item.id}`}
                            onClick={handleCloseDrawer}
                            style={{ color: '#111', textDecoration: 'none' }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                          >
                            {item.name}
                          </Link>
                        </h4>

                        <div style={{ fontSize: '12px', color: '#555', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {colorLabel && <span>Колір: <strong style={{ color: '#111' }}>{colorLabel}</strong></span>}
                          {item.selectedSize && <span>Розмір: <strong style={{ color: '#111' }}>{item.selectedSize}</strong></span>}

                          {typeof onUpdateQuantity === 'function' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span>Кількість:</span>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  background: '#faf5ff',
                                  overflow: 'hidden'
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleChangeQty(item, -1)}
                                  disabled={qty <= 1}
                                  aria-label="Зменшити кількість"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    color: qty <= 1 ? '#9ca3af' : '#7c3aed'
                                  }}
                                >
                                  -
                                </button>
                                <strong style={{ padding: '0 6px', fontSize: '12px', color: '#111' }}>{qty}</strong>
                                <button
                                  type="button"
                                  onClick={() => handleChangeQty(item, 1)}
                                  aria-label="Збільшити кількість"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    color: '#7c3aed'
                                  }}
                                >
                                  +
                                </button>
                              </span>
                            </span>
                          ) : (
                            <span>Кількість: <strong style={{ color: '#111' }}>{qty}</strong></span>
                          )}
                        </div>

                        {item.isGiftPackage && (
                          <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>🎁 З подарунковим пакуванням</span>
                        )}
                        <span className="cart-item-price" style={{ fontWeight: 800, fontSize: '14px', color: '#111', marginTop: '2px' }}>
                          {item.price * qty} ₴
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-btn"
                      onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)}
                      aria-label={`Видалити ${item.name} з кошика`}
                      title="Видалити"
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        width: '34px',
                        height: '34px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#dc2626'
                        e.currentTarget.style.borderColor = '#fecaca'
                        e.currentTarget.style.background = '#fef2f2'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#6b7280'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.background = '#f9fafb'
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer" style={{ borderTop: '1px solid #eaeaea', paddingTop: '14px' }}>
            <div className="cart-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '16px' }}>
              <span style={{ color: '#555' }}>Загалом:</span>
              <strong style={{ color: '#111' }}>{total} ₴</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                aria-label="Очистити кошик"
                title="Очистити кошик"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  color: '#6b7280',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#dc2626'
                  e.currentTarget.style.borderColor = '#fecaca'
                  e.currentTarget.style.background = '#fef2f2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.background = '#f9fafb'
                }}
              >
                <TrashIcon size={18} />
              </button>

              <AppButton
                onClick={handleCheckout}
                style={{
                  flex: 1,
                  background: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '13px 20px',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)'
                }}
              >
                Оформити замовлення
              </AppButton>
            </div>
          </div>
        )}

        {showConfirmClear && (
          <div
            onClick={() => setIsConfirmClearOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17, 17, 17, 0.35)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 20
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '320px',
                background: '#fff',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 14px 34px rgba(0, 0, 0, 0.18)',
                border: '1px solid #eaeaea',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111' }}>
                Очистити кошик?
              </h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: '#555' }}>
                Усі додані речі буде видалено з кошика. Цю дію не можна буде скасувати.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsConfirmClearOpen(false)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '20px',
                    border: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    color: '#374151',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Залишити
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#7c3aed',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                  }}
                >
                  Очистити
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}