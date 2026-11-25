import { useState, useEffect } from 'react'
import { useParams, useOutletContext } from 'react-router'
import ProductStatusBadge from '../components/catalog/ProductStatusBadge.jsx'
import ProductCard from '../components/catalog/ProductCard.jsx'
import NotFoundPage from './NotFoundPage.jsx'

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL']
const SOCKS_SIZES = ['36-38', '39-41', '42-45']

const AVAILABLE_COLORS = [
  { name: 'Чорний', hex: '#111111' },
  { name: 'Сірий', hex: '#4b5563' },
  { name: 'Білий', hex: '#f3f4f6' }
]

function detectColorFromImage(img) {
  if (!img) return null
  if (img.color) {
    const matched = AVAILABLE_COLORS.find(
      (c) => c.name.toLowerCase() === String(img.color).trim().toLowerCase()
    )
    if (matched) return matched.name
  }
  const text = `${img.title || ''} ${img.alt || ''}`.toLowerCase()
  const byText = AVAILABLE_COLORS.find((c) => text.includes(c.name.toLowerCase()))
  return byText ? byText.name : null
}

function getProductSizingConfig(item) {
  const lowerName = String(item.name || '').toLowerCase()
  const lowerCategory = String(item.category || '').toLowerCase()

  const isSocks = lowerName.includes('шкарпетки') || lowerName.includes('socks')
  const isBagOrNoSize =
    lowerName.includes('сумка') ||
    lowerName.includes('шопер') ||
    lowerName.includes('бананка') ||
    lowerName.includes('bag') ||
    lowerName.includes('shopper') ||
    (lowerCategory === 'аксесуари' && !isSocks)

  if (isBagOrNoSize) {
    return { hasSizes: false, baseSizes: [] }
  }

  return {
    hasSizes: true,
    baseSizes: isSocks ? SOCKS_SIZES : CLOTHING_SIZES
  }
}

function checkIsSoldOut(entry) {
  const statusStr = String(entry?.status || '').toLowerCase()
  const labelStr = String(entry?.statusLabel || '').toLowerCase()
  return (
    statusStr.includes('sold') ||
    statusStr.includes('out') ||
    statusStr.includes('розпродано') ||
    labelStr.includes('розпродано') ||
    entry?.inStock === false
  )
}

function ProductDetailsContent({
  item,
  items,
  cartItems,
  handleAddToCart,
  handleRemoveFromCart,
  wishlistItems,
  handleToggleWishlist,
  setIsCartOpen
}) {
  const { hasSizes, baseSizes } = getProductSizingConfig(item)

  const anyItemInCart = cartItems.find((cItem) => cItem.id === item.id)
  const hasStandardInCart = Boolean(
    hasSizes && anyItemInCart && anyItemInCart.selectedSize === 'Standard'
  )
  const AVAILABLE_SIZES = hasSizes
    ? (hasStandardInCart ? ['Standard', ...baseSizes] : baseSizes)
    : []

  const productImages = item.images && item.images.length > 0
    ? item.images
    : [
        { id: 1, title: 'Головне фото', url: null },
        { id: 2, title: 'Вигляд ззаду', url: null },
        { id: 3, title: 'Деталі принта', url: null }
      ]

  const hasColorVariants = productImages.some((img) => Boolean(detectColorFromImage(img)))

  const defaultSingleSize = hasSizes
    ? (anyItemInCart?.selectedSize || baseSizes[1] || baseSizes[0])
    : undefined
  const initialSelectedColor = anyItemInCart?.selectedColor || AVAILABLE_COLORS[0].name

  const [selectedColor, setSelectedColor] = useState(initialSelectedColor)

  const [sizeRows, setSizeRows] = useState(() => {
    if (!hasSizes) return []
    const colorMatches = cartItems.filter((cItem) => {
      if (cItem.id !== item.id) return false
      if (hasColorVariants && (cItem.selectedColor || AVAILABLE_COLORS[0].name) !== initialSelectedColor) {
        return false
      }
      return true
    })
    if (colorMatches.length > 1) {
      return colorMatches.map((c) => ({
        size: c.selectedSize || defaultSingleSize,
        qty: c.quantity || 1
      }))
    }
    return [{
      size: defaultSingleSize,
      qty: colorMatches[0]?.quantity || 1
    }]
  })

  const [singleQuantity, setSingleQuantity] = useState(() => {
    const match = cartItems.find((cItem) => cItem.id === item.id)
    return match ? (match.quantity || 1) : 1
  })

  const visibleImages = hasColorVariants
    ? (() => {
        const byColor = productImages.filter((img) => detectColorFromImage(img) === selectedColor)
        return byColor.length > 0 ? byColor : productImages
      })()
    : productImages

  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const initialGift = (() => {
    const match = cartItems.find((cItem) => {
      if (cItem.id !== item.id) return false
      if (hasColorVariants && (cItem.selectedColor || AVAILABLE_COLORS[0].name) !== initialSelectedColor) {
        return false
      }
      return true
    })
    return match ? Boolean(match.isGiftPackage) : false
  })()

  const [isGiftPackage, setIsGiftPackage] = useState(initialGift)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [item.id])

  const isSoldOut = checkIsSoldOut(item)

  function getMatchingColorCartItems(targetColor) {
    return cartItems.filter((cItem) => {
      if (cItem.id !== item.id) return false
      if (hasColorVariants && (cItem.selectedColor || AVAILABLE_COLORS[0].name) !== targetColor) {
        return false
      }
      return true
    })
  }

  function syncStateForColor(nextColor) {
    const colorMatches = getMatchingColorCartItems(nextColor)
    if (hasSizes) {
      if (colorMatches.length > 0) {
        setSizeRows(
          colorMatches.map((c) => ({
            size: c.selectedSize || baseSizes[1] || baseSizes[0],
            qty: c.quantity || 1
          }))
        )
      } else {
        setSizeRows([{ size: baseSizes[1] || baseSizes[0], qty: 1 }])
      }
    } else {
      setSingleQuantity(colorMatches[0]?.quantity || 1)
    }
    setIsGiftPackage(colorMatches[0] ? Boolean(colorMatches[0].isGiftPackage) : false)
  }

  function handleSelectImageIndex(nextIndex) {
    const safeIndex = ((nextIndex % visibleImages.length) + visibleImages.length) % visibleImages.length
    setActiveImageIndex(safeIndex)

    const imgColor = detectColorFromImage(visibleImages[safeIndex])
    if (imgColor && imgColor !== selectedColor) {
      setSelectedColor(imgColor)
      syncStateForColor(imgColor)
    }
  }

  function handleColorSelect(colorName) {
    setSelectedColor(colorName)
    setActiveImageIndex(0)
    syncStateForColor(colorName)
  }

  function handlePrevImage() {
    handleSelectImageIndex(activeImageIndex - 1)
  }

  function handleNextImage() {
    handleSelectImageIndex(activeImageIndex + 1)
  }

  function handleAddSizeRow() {
    if (!hasSizes || sizeRows.length >= AVAILABLE_SIZES.length) return
    const usedSizes = sizeRows.map((r) => r.size)
    const freeSize = AVAILABLE_SIZES.find((s) => !usedSizes.includes(s)) || AVAILABLE_SIZES[0]
    setSizeRows([...sizeRows, { size: freeSize, qty: 1 }])
  }

  function handleRemoveSizeRow(index) {
    if (sizeRows.length <= 1) return
    setSizeRows(sizeRows.filter((_, i) => i !== index))
  }

  const safeActiveIndex = activeImageIndex < visibleImages.length ? activeImageIndex : 0
  const effectiveColor = hasColorVariants ? selectedColor : undefined
  const currentImageUrl = visibleImages[safeActiveIndex]?.url || visibleImages[0]?.url
  const primarySize = hasSizes ? (sizeRows[0]?.size || baseSizes[1] || baseSizes[0]) : undefined

  const isWishlisted = wishlistItems.some((wItem) => {
    if (wItem.id !== item.id) return false
    const wColor = wItem.selectedColor || (hasColorVariants ? AVAILABLE_COLORS[0].name : undefined)
    if (hasColorVariants && wColor !== effectiveColor) return false
    if (hasSizes && wItem.selectedSize && wItem.selectedSize !== primarySize) return false
    return true
  })

  function handleWishlistClick() {
    if (!handleToggleWishlist) return
    handleToggleWishlist({
      ...item,
      selectedColor: effectiveColor,
      selectedSize: primarySize,
      image: currentImageUrl
    })
  }

  const matchingColorItemsInCart = getMatchingColorCartItems(selectedColor)

  const isExactMatchInCart = (() => {
    if (!hasSizes) {
      const match = matchingColorItemsInCart[0]
      return Boolean(
        match &&
        (match.quantity || 1) === singleQuantity &&
        Boolean(match.isGiftPackage) === isGiftPackage
      )
    }

    if (matchingColorItemsInCart.length === 0 || matchingColorItemsInCart.length !== sizeRows.length) {
      return false
    }

    return sizeRows.every((row) =>
      matchingColorItemsInCart.some(
        (cItem) =>
          cItem.selectedSize === row.size &&
          (cItem.quantity || 1) === row.qty &&
          Boolean(cItem.isGiftPackage) === isGiftPackage
      )
    )
  })()

  const hasExistingInCart = matchingColorItemsInCart.length > 0

  let buttonText = 'Додати в кошик'
  if (hasExistingInCart) {
    buttonText = isExactMatchInCart ? 'У кошику ✓' : 'Підтвердити зміни'
  }

  function handleAddToCartAction() {
    if (isSoldOut || !handleAddToCart) return

    if (hasExistingInCart && isExactMatchInCart) {
      if (setIsCartOpen) setIsCartOpen(true)
      return
    }

    if (handleRemoveFromCart && matchingColorItemsInCart.length > 0) {
      matchingColorItemsInCart.forEach((cItem) => {
        handleRemoveFromCart(item.id, cItem.selectedSize, effectiveColor)
      })
    }

    if (!hasSizes) {
      handleAddToCart({
        ...item,
        selectedSize: undefined,
        selectedColor: effectiveColor,
        quantity: singleQuantity,
        isGiftPackage,
        image: currentImageUrl
      })
    } else {
      sizeRows.forEach((row) => {
        if (row.qty > 0) {
          handleAddToCart({
            ...item,
            selectedSize: row.size,
            selectedColor: effectiveColor,
            quantity: row.qty,
            isGiftPackage,
            image: currentImageUrl
          })
        }
      })
    }

    if (setIsCartOpen) {
      setIsCartOpen(true)
    }
  }

  const otherItems = items.filter((entry) => entry.id !== item.id)
  const sameGroupItems = otherItems.filter(
    (entry) => entry.category === item.category || entry.collection === item.collection
  )
  const fallbackItems = otherItems.filter(
    (entry) => !sameGroupItems.some((s) => s.id === entry.id)
  )
  const orderedRecommendations = [...sameGroupItems, ...fallbackItems]
    .map((entry, idx) => ({ entry, idx }))
    .sort((a, b) => {
      const aSold = checkIsSoldOut(a.entry) ? 1 : 0
      const bSold = checkIsSoldOut(b.entry) ? 1 : 0
      if (aSold !== bSold) return aSold - bSold
      return a.idx - b.idx
    })
    .map((x) => x.entry)
    .slice(0, 3)

  const hasSameCategoryRecommendations = sameGroupItems.length > 0

  return (
    <div className="product-details-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {visibleImages.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {visibleImages.map((img, index) => (
                <button
                  key={img.id || index}
                  type="button"
                  onClick={() => handleSelectImageIndex(index)}
                  style={{
                    width: '75px',
                    height: '95px',
                    background: '#f8f8f8',
                    border: safeActiveIndex === index ? '2px solid #7c3aed' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    padding: 0
                  }}
                >
                  {img.url ? (
                    <img src={img.url} alt={img.title || 'Фото'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#333' }}>Фото {index + 1}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div style={{
            flex: 1,
            height: '520px',
            background: '#f8f8f8',
            borderRadius: '16px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #eaeaea',
            overflow: 'hidden'
          }}>
            <span style={{ position: 'absolute', top: '16px', left: '16px', fontWeight: 800, fontSize: '14px', letterSpacing: '1px', zIndex: 2, background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: '4px' }}>MERA</span>

            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
              <ProductStatusBadge status={item.status} statusLabel={item.statusLabel} />
            </div>

            {visibleImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    zIndex: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'background 0.2s'
                  }}
                  title="Попереднє фото"
                >
                  &larr;
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 700,
                    zIndex: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'background 0.2s'
                  }}
                  title="Наступне фото"
                >
                  &rarr;
                </button>
              </>
            )}

            {visibleImages[safeActiveIndex]?.url ? (
              <img
                src={visibleImages[safeActiveIndex].url}
                alt={visibleImages[safeActiveIndex].title || 'Головне фото'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#777', fontWeight: 600 }}>
                📸 {visibleImages[safeActiveIndex]?.title || 'Фото'} <br />
                <span style={{ fontSize: '13px', fontWeight: 400 }}>(Кадр {safeActiveIndex + 1} з {visibleImages.length})</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', letterSpacing: '0.5px', fontWeight: 600 }}>{item.collection}</span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '4px 0 6px 0', lineHeight: 1.15 }}>{item.name}</h1>
            <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.4, margin: 0 }}>{item.description}</p>
          </div>

          <div style={{ fontSize: '28px', fontWeight: 900, color: '#111' }}>
            {item.price} ₴
          </div>

          {hasColorVariants && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '6px', borderBottom: '1px solid #eaeaea' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>Колір:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {AVAILABLE_COLORS.map((col) => {
                  const isSelected = selectedColor === col.name
                  const isWhite = col.name.toLowerCase() === 'білий'
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => handleColorSelect(col.name)}
                      title={col.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: col.hex,
                        border: isSelected
                          ? '2px solid #7c3aed'
                          : isWhite
                            ? '1.5px solid #cbd5e1'
                            : '2px solid #e5e7eb',
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 0 0 2px rgba(124, 58, 237, 0.22)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  )
                })}
              </div>
              <span style={{ fontSize: '13px', color: '#7c3aed', fontWeight: 600 }}>{selectedColor}</span>
            </div>
          )}

          {hasSizes ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fcfcfc', border: '1px solid #eaeaea', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Розмір і кількість</span>
                <span style={{ fontSize: '12px', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>Таблиця розмірів</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '2px' }}>
                {sizeRows.map((row, index) => {
                  const usedSizes = sizeRows.map((r, i) => i !== index ? r.size : null)

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: sizeRows.length > 1 ? '#fff' : 'transparent',
                        padding: sizeRows.length > 1 ? '8px 10px' : '2px 0',
                        borderRadius: sizeRows.length > 1 ? '8px' : '0',
                        border: sizeRows.length > 1 ? '1px solid #e5e7eb' : 'none',
                        gap: '8px'
                      }}
                    >
                      {sizeRows.length > 1 && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#555', minWidth: '58px' }}>
                          #{index + 1}:
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {AVAILABLE_SIZES.map((s) => {
                          const isAlreadyUsed = sizeRows.length > 1 && usedSizes.includes(s)
                          const isSelected = row.size === s
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={isAlreadyUsed}
                              onClick={() => {
                                const updated = [...sizeRows]
                                updated[index] = { ...updated[index], size: s }
                                setSizeRows(updated)
                              }}
                              style={{
                                padding: '0 10px',
                                height: '34px',
                                minWidth: '38px',
                                background: isSelected ? '#7c3aed' : isAlreadyUsed ? '#f3f4f6' : '#fff',
                                color: isSelected ? '#fff' : isAlreadyUsed ? '#9ca3af' : '#000',
                                border: isSelected ? '2px solid #7c3aed' : '1px solid #ccc',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: isAlreadyUsed ? 'not-allowed' : 'pointer',
                                opacity: isAlreadyUsed ? 0.5 : 1,
                                transition: 'all 0.15s'
                              }}
                            >
                              {s}
                            </button>
                          )
                        })}
                      </div>

                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...sizeRows]
                            updated[index] = { ...updated[index], qty: Math.max(1, updated[index].qty - 1) }
                            setSizeRows(updated)
                          }}
                          style={{ width: '30px', height: '32px', background: '#f8f8f8', border: 'none', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          -
                        </button>
                        <span style={{ width: '32px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>{row.qty}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...sizeRows]
                            updated[index] = { ...updated[index], qty: updated[index].qty + 1 }
                            setSizeRows(updated)
                          }}
                          style={{ width: '30px', height: '32px', background: '#f8f8f8', border: 'none', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          +
                        </button>
                      </div>

                      {sizeRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeRow(index)}
                          aria-label="Видалити розмір"
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700, padding: '0 4px' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}

                {sizeRows.length < AVAILABLE_SIZES.length && (
                  <button
                    type="button"
                    onClick={handleAddSizeRow}
                    style={{
                      marginTop: '2px',
                      padding: '7px 12px',
                      background: '#faf5ff',
                      border: '1px dashed #7c3aed',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: '#7c3aed',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    + Додати розмір
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc', border: '1px solid #eaeaea', borderRadius: '12px', padding: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Кількість (єдиний розмір)</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
                <button
                  type="button"
                  onClick={() => setSingleQuantity(Math.max(1, singleQuantity - 1))}
                  style={{ width: '32px', height: '34px', background: '#f8f8f8', border: 'none', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}
                >
                  -
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '13px' }}>{singleQuantity}</span>
                <button
                  type="button"
                  onClick={() => setSingleQuantity(singleQuantity + 1)}
                  style={{ width: '32px', height: '34px', background: '#f8f8f8', border: 'none', fontSize: '14px', cursor: 'pointer', fontWeight: 700 }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#111' }}>
              <input
                type="checkbox"
                checked={isGiftPackage}
                onChange={(e) => setIsGiftPackage(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
              />
              Фірмове подарункове пакування MERA
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleAddToCartAction}
              disabled={isSoldOut}
              style={{
                flex: 1,
                padding: '14px 20px',
                fontSize: '14px',
                fontWeight: 700,
                background: isSoldOut
                  ? '#e5e7eb'
                  : (hasExistingInCart && isExactMatchInCart ? '#f5f3ff' : '#7c3aed'),
                color: isSoldOut
                  ? '#9ca3af'
                  : (hasExistingInCart && isExactMatchInCart ? '#7c3aed' : '#fff'),
                border: isSoldOut
                  ? 'none'
                  : (hasExistingInCart && isExactMatchInCart ? '1.5px solid #7c3aed' : '1.5px solid #7c3aed'),
                borderRadius: '30px',
                cursor: isSoldOut ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: (hasExistingInCart && isExactMatchInCart) || isSoldOut
                  ? 'none'
                  : '0 4px 14px rgba(124, 58, 237, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <span>{isSoldOut ? 'Розпродано' : buttonText}</span>
            </button>

            <button
              type="button"
              onClick={handleWishlistClick}
              style={{
                width: '48px',
                height: '48px',
                background: isWishlisted ? '#f5f3ff' : '#fff',
                border: isWishlisted ? '1.5px solid #7c3aed' : '1px solid #ccc',
                color: isWishlisted ? '#7c3aed' : '#111',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              aria-label="В обране"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isWishlisted ? '#7c3aed' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {orderedRecommendations.length > 0 && (
        <div style={{ marginTop: '54px', borderTop: '1px solid #eaeaea', paddingTop: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '20px' }}>
            {hasSameCategoryRecommendations ? 'Подібні речі у колекції' : 'Пропозиції'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {orderedRecommendations.map((relatedItem) => (
              <ProductCard key={relatedItem.id} item={relatedItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductDetailsPage({ items }) {
  const { productId } = useParams()
  const context = useOutletContext() || {}
  const item = items.find((entry) => entry.id === productId)

  if (!item) {
    return (
      <NotFoundPage
        title="404: Річ не знайдено"
        message="Запитуваний товар відсутній у каталозі MERA або тираж було завершено."
      />
    )
  }

  return (
    <ProductDetailsContent
      key={item.id}
      item={item}
      items={items}
      cartItems={context.cartItems || []}
      handleAddToCart={context.handleAddToCart}
      handleRemoveFromCart={context.handleRemoveFromCart}
      wishlistItems={context.wishlistItems || []}
      handleToggleWishlist={context.handleToggleWishlist}
      setIsCartOpen={context.setIsCartOpen}
    />
  )
}