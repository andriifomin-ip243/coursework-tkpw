import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

const COLOR_KEYWORDS = ['чорний', 'сірий', 'білий']

function detectColorText(item) {
  if (item.selectedColor) return item.selectedColor
  if (item.color) return item.color

  const src = String(item.image || item.images?.[0]?.url || '').toLowerCase()
  const matched = COLOR_KEYWORDS.find((c) => src.includes(c))
  if (!matched) return null

  return matched.charAt(0).toUpperCase() + matched.slice(1)
}

function resolveDefaultSize(item) {
  if (item.selectedSize) return item.selectedSize
  if (item.size) return item.size

  const lowerName = String(item.name || '').toLowerCase()
  const lowerCategory = String(item.category || '').toLowerCase()

  if (lowerName.includes('шкарпетки') || lowerName.includes('socks')) return '39-41'

  const isBagOrNoSize =
    lowerName.includes('сумка') ||
    lowerName.includes('шопер') ||
    lowerName.includes('бананка') ||
    lowerName.includes('bag') ||
    lowerName.includes('shopper') ||
    lowerCategory === 'аксесуари'

  if (isBagOrNoSize) return undefined

  return 'M'
}

function checkIsSoldOut(item) {
  const statusStr = String(item.status || '').toLowerCase()
  const labelStr = String(item.statusLabel || '').toLowerCase()
  return (
    statusStr.includes('sold') ||
    statusStr.includes('out') ||
    statusStr.includes('розпродано') ||
    labelStr.includes('розпродано') ||
    item.inStock === false
  )
}

function resolveWishlistItemImage(item) {
  const targetColor = String(detectColorText(item) || '').trim().toLowerCase()

  if (targetColor && Array.isArray(item.images) && item.images.length > 0) {
    const colorMatch = item.images.find((img) => {
      if (!img?.url) return false
      if (img.color && String(img.color).trim().toLowerCase() === targetColor) return true
      const text = `${img.title || ''} ${img.alt || ''} ${img.url || ''}`.toLowerCase()
      return text.includes(targetColor)
    })
    if (colorMatch?.url) return colorMatch.url
  }

  return item.image || item.images?.[0]?.url || null
}

function CartIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function TrashIcon({ size = 15 }) {
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

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onRemove,
  onAddToCart,
  onClearAll
}) {
  const navigate = useNavigate()
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false)

  if (!isOpen) return null

  const showConfirmClear = isConfirmClearOpen && wishlistItems.length > 0

  const availableItems = wishlistItems.filter((item) => !checkIsSoldOut(item))
  const totalWishlistPrice = wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0)

  function handleCloseDrawer() {
    setIsConfirmClearOpen(false)
    onClose()
  }

  function handleGoToCatalog() {
    setIsConfirmClearOpen(false)
    onClose()
    navigate('/catalog')
  }

  function buildCartPayload(item) {
    const colorLabel = detectColorText(item)
    const sizeLabel = resolveDefaultSize(item)
    const imageUrl = resolveWishlistItemImage(item)

    return {
      ...item,
      image: imageUrl,
      selectedColor: colorLabel || undefined,
      selectedSize: sizeLabel,
      quantity: item.quantity || 1
    }
  }

  function handleAddSingleToCart(item) {
    if (checkIsSoldOut(item) || typeof onAddToCart !== 'function') return
    onAddToCart(buildCartPayload(item))
  }

  function handleAddAllToCart() {
    if (availableItems.length === 0 || typeof onAddToCart !== 'function') return
    availableItems.forEach((item) => {
      onAddToCart(buildCartPayload(item))
    })
  }

  function handleConfirmClearAll() {
    setIsConfirmClearOpen(false)
    if (typeof onClearAll === 'function') {
      onClearAll()
      return
    }
    if (typeof onRemove === 'function') {
      wishlistItems.forEach((item) => {
        const colorLabel = detectColorText(item)
        const sizeLabel = item.selectedSize || item.size || null
        onRemove(item.id, colorLabel, sizeLabel)
      })
    }
  }

  return (
    <div className="cart-drawer-overlay" onClick={handleCloseDrawer}>
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
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Обрані речі</h2>
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
          {wishlistItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', paddingTop: '10px' }}>
              <p className="empty-cart-text" style={{ margin: 0, color: '#555' }}>Список обраного порожній.</p>
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
              {wishlistItems.map((item) => {
                const isSoldOut = checkIsSoldOut(item)
                const colorLabel = detectColorText(item)
                const sizeLabel = item.selectedSize || item.size || null
                const imageUrl = resolveWishlistItemImage(item)

                const itemTo = colorLabel
                  ? { pathname: `/catalog/${item.id}`, state: { selectedColor: colorLabel } }
                  : `/catalog/${item.id}`

                return (
                  <li
                    key={`${item.id}-${colorLabel || 'default'}-${sizeLabel || 'default'}`}
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
                        to={itemTo}
                        onClick={handleCloseDrawer}
                        style={{ flexShrink: 0, textDecoration: 'none' }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'block' }}
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

                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, lineHeight: 1.3 }}>
                          <Link
                            to={itemTo}
                            onClick={handleCloseDrawer}
                            style={{ color: '#111', textDecoration: 'none' }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                          >
                            {item.name}
                          </Link>
                        </h4>

                        {(colorLabel || sizeLabel || isSoldOut) && (
                          <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px', alignItems: 'center' }}>
                            {colorLabel && <span>Колір: <strong style={{ color: '#111' }}>{colorLabel}</strong></span>}
                            {sizeLabel && <span>Розмір: <strong style={{ color: '#111' }}>{sizeLabel}</strong></span>}
                            {isSoldOut && <span style={{ color: '#dc2626', fontWeight: 600 }}>Розпродано</span>}
                          </div>
                        )}

                        <span className="cart-item-price" style={{ display: 'inline-block', fontWeight: 800, fontSize: '14px', color: '#111', marginTop: '4px' }}>
                          {item.price} ₴
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <button
                        type="button"
                        disabled={isSoldOut}
                        aria-label={isSoldOut ? `${item.name} — розпродано` : `Додати ${item.name} у кошик`}
                        title={isSoldOut ? 'Розпродано' : 'Додати в кошик'}
                        onClick={() => handleAddSingleToCart(item)}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          border: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSoldOut ? '#e5e7eb' : '#7c3aed',
                          color: isSoldOut ? '#9ca3af' : '#ffffff',
                          cursor: isSoldOut ? 'not-allowed' : 'pointer',
                          boxShadow: isSoldOut ? 'none' : '0 3px 10px rgba(124, 58, 237, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSoldOut) e.currentTarget.style.background = '#6d28d9'
                        }}
                        onMouseLeave={(e) => {
                          if (!isSoldOut) e.currentTarget.style.background = '#7c3aed'
                        }}
                      >
                        <CartIcon />
                      </button>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => onRemove(item.id, colorLabel, sizeLabel)}
                        aria-label={`Видалити ${item.name} з обраного`}
                        title="Видалити з обраного"
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
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="cart-drawer-footer" style={{ borderTop: '1px solid #eaeaea', paddingTop: '14px' }}>
            <div className="cart-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '15px' }}>
              <span style={{ color: '#555' }}>Обрано позицій: <strong style={{ color: '#111' }}>{wishlistItems.length}</strong></span>
              <strong style={{ color: '#111' }}>{totalWishlistPrice} ₴</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                aria-label="Очистити всі обрані"
                title="Очистити всі обрані"
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

              <button
                type="button"
                disabled={availableItems.length === 0}
                onClick={handleAddAllToCart}
                style={{
                  flex: 1,
                  background: availableItems.length === 0 ? '#e5e7eb' : '#7c3aed',
                  color: availableItems.length === 0 ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '13px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: availableItems.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: availableItems.length === 0 ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.28)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <CartIcon size={16} />
                <span>Додати всі в кошик</span>
              </button>
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
                Очистити обрані речі?
              </h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: '#555' }}>
                Усі товари буде видалено зі списку обраного. Цю дію не можна буде скасувати.
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
                  onClick={handleConfirmClearAll}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: '#7c3aed',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
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