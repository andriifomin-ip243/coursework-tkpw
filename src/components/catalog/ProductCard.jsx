import { Link, useOutletContext } from 'react-router'
import ProductStatusBadge from './ProductStatusBadge.jsx'

function getDefaultSizeForProduct(item) {
  const lowerName = String(item.name || '').toLowerCase()
  const lowerCategory = String(item.category || '').toLowerCase()

  const isSocks = lowerName.includes('шкарпетки') || lowerName.includes('socks')
  if (isSocks) return '39-41'

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

export default function ProductCard({ item }) {
  const {
    cartItems = [],
    handleAddToCart,
    setIsCartOpen,
    wishlistItems = [],
    handleToggleWishlist
  } = useOutletContext() || {}

  const isInCart = cartItems.some((cartItem) => cartItem.id === item.id)
  const isWishlisted = wishlistItems.some((wItem) => wItem.id === item.id)

  const statusStr = String(item.status || '').toLowerCase()
  const labelStr = String(item.statusLabel || '').toLowerCase()
  const isSoldOut =
    statusStr.includes('sold') ||
    statusStr.includes('out') ||
    statusStr.includes('розпродано') ||
    labelStr.includes('розпродано') ||
    item.inStock === false

  const defaultSize = getDefaultSizeForProduct(item)

  const imageUrl = item.image || (item.images && item.images.length > 0 ? item.images[0].url : null)

  function handleCardAction() {
    if (isSoldOut) return

    if (isInCart) {
      if (typeof setIsCartOpen === 'function') {
        setIsCartOpen(true)
      }
    } else {
      if (typeof handleAddToCart === 'function') {
        handleAddToCart({ ...item, image: imageUrl, selectedSize: defaultSize, quantity: 1 })
      }
    }
  }

  return (
    <article
      className={`product-card ${isInCart ? 'product-card-selected' : ''} ${isSoldOut ? 'product-card-sold-out' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #eaeaea',
        boxShadow: 'none'
      }}
    >
      {/* Фото товару або фірмова заглушка з посиланням на сторінку */}
      <Link to={`/catalog/${item.id}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div className="product-image-placeholder" style={{ position: 'relative', overflow: 'hidden', opacity: isSoldOut ? 0.75 : 1 }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
            />
          ) : (
            <span className="product-brand-tag">MERA</span>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
            <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
          </div>
        </div>
      </Link>

      <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span className="product-collection">{item.collection}</span>

        <h3 style={{ margin: '4px 0 0 0' }}>
          <Link to={`/catalog/${item.id}`} className="product-title-link">
            {item.name}
          </Link>
        </h3>

        {/* Нижня панель: Ціна, Сердечко та Кнопка кошика / Розпродано */}
        <div className="product-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px' }}>
          <span className="product-price">{item.price} ₴</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Кнопка-сердечко */}
            <button
              type="button"
              className={`wishlist-icon-btn ${isWishlisted ? 'active' : ''}`}
              onClick={() => handleToggleWishlist && handleToggleWishlist({ ...item, image: imageUrl })}
              aria-label="В обране"
              style={{
                background: isWishlisted ? '#f5f3ff' : '#f4f4f6',
                border: isWishlisted ? '1px solid #ddd6fe' : 'none',
                color: isWishlisted ? '#7c3aed' : '#111',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isWishlisted ? '#7c3aed' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleCardAction}
              disabled={isSoldOut}
              aria-label={isSoldOut ? 'Розпродано' : (isInCart ? 'Відкрити кошик' : 'Додати в кошик')}
              style={{
                background: isSoldOut ? '#e5e7eb' : (isInCart ? '#f5f3ff' : '#7c3aed'),
                color: isSoldOut ? '#9ca3af' : (isInCart ? '#7c3aed' : '#fff'),
                border: isInCart ? '1px solid #ddd6fe' : 'none',
                borderRadius: '20px',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isSoldOut ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: (isInCart || isSoldOut) ? 'none' : '0 4px 12px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {isSoldOut ? (
                <span>Розпродано</span>
              ) : isInCart ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>У кошику</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <span>В кошик</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}