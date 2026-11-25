import { useState, useEffect } from 'react'
import { Outlet } from 'react-router'
import SiteHeader from './SiteHeader.jsx'
import ProductSelectionProvider from '../../providers/ProductSelectionProvider.jsx'
import OrdersProvider from '../../providers/OrdersProvider.jsx'
import CartDrawer from '../orders/CartDrawer.jsx'
import WishlistDrawer from '../orders/WishlistDrawer.jsx'
import ProfileDrawer from '../orders/ProfileDrawer.jsx'
import NotificationsDrawer from '../orders/NotificationsDrawer.jsx'
import { apparelItems } from '../../data/items.js'

const navigationLinks = [
  { to: '/', label: 'Головна', end: true },
  { to: '/catalog', label: 'Каталог' },
  { to: '/orders', label: 'Мої замовлення', end: true },
]

function isSameWishlistVariant(a, b) {
  if (a.id !== b.id) return false
  const colorA = a.selectedColor || ''
  const colorB = b.selectedColor || ''
  if (colorA !== colorB) return false

  if (a.selectedSize && b.selectedSize) {
    return a.selectedSize === b.selectedSize
  }
  return true
}

export default function AppLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mera_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mera_wishlist')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(() => {
    try {
      const saved = localStorage.getItem('mera_notifications')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.filter((n) => !n.read).length
      }
    } catch {
      // ignore
    }
    return 2
  })

  useEffect(() => {
    function updateNotificationCount() {
      try {
        const saved = localStorage.getItem('mera_notifications')
        if (saved) {
          const parsed = JSON.parse(saved)
          setUnreadNotificationsCount(parsed.filter((n) => !n.read).length)
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener('storage', updateNotificationCount)
    const interval = setInterval(updateNotificationCount, 1000)

    return () => {
      window.removeEventListener('storage', updateNotificationCount)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('mera_cart', JSON.stringify(cartItems))
    } catch (e) {
      console.error(e)
    }
  }, [cartItems])

  useEffect(() => {
    try {
      localStorage.setItem('mera_wishlist', JSON.stringify(wishlistItems))
    } catch (e) {
      console.error(e)
    }
  }, [wishlistItems])

  useEffect(() => {
    function handleStorageChange() {
      const cartSaved = localStorage.getItem('mera_cart')
      setCartItems(cartSaved ? JSON.parse(cartSaved) : [])

      const wishSaved = localStorage.getItem('mera_wishlist')
      setWishlistItems(wishSaved ? JSON.parse(wishSaved) : [])
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function handleAddToCart(product) {
    setCartItems((prev) => {
      const size = product.selectedSize || 'Standard'
      const color = product.selectedColor || 'Standard'
      const isGift = Boolean(product.isGiftPackage)

      const existingIndex = prev.findIndex(
        (item) => 
          item.id === product.id && 
          (item.selectedSize || 'Standard') === size &&
          (item.selectedColor || 'Standard') === color &&
          Boolean(item.isGiftPackage) === isGift
      )

      let updated
      if (existingIndex > -1) {
        updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + (product.quantity || 1)
        }
      } else {
        updated = [...prev, { ...product, quantity: product.quantity || 1, selectedSize: size, selectedColor: color }]
      }
      localStorage.setItem('mera_cart', JSON.stringify(updated))
      return updated
    })
  }

  function handleUpdateCartQuantity(productId, selectedSize, selectedColor, nextQuantity) {
    if (nextQuantity < 1) return
    setCartItems((prev) => {
      const targetSize = selectedSize || 'Standard'
      const targetColor = selectedColor || 'Standard'

      const updated = prev.map((item) => {
        const itemSize = item.selectedSize || 'Standard'
        const itemColor = item.selectedColor || 'Standard'
        if (item.id === productId && itemSize === targetSize && itemColor === targetColor) {
          return { ...item, quantity: nextQuantity }
        }
        return item
      })
      localStorage.setItem('mera_cart', JSON.stringify(updated))
      return updated
    })
  }

  function handleRemoveFromCart(productId, selectedSize, selectedColor) {
    setCartItems((prev) => {
      const updated = prev.filter((item) => {
        const itemSize = item.selectedSize || 'Standard'
        const targetSize = selectedSize || 'Standard'
        if (item.id !== productId || itemSize !== targetSize) return true
        if (selectedColor !== undefined) {
          const itemColor = item.selectedColor || 'Standard'
          const targetColor = selectedColor || 'Standard'
          return itemColor !== targetColor
        }
        return false
      })
      localStorage.setItem('mera_cart', JSON.stringify(updated))
      return updated
    })
  }

  function clearCart() {
    setCartItems([])
    localStorage.removeItem('mera_cart')
    localStorage.removeItem('cart')
    localStorage.removeItem('cartItems')
    window.dispatchEvent(new Event('storage'))
  }

  function handleToggleWishlist(product) {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => isSameWishlistVariant(item, product))
      let updated
      if (exists) {
        updated = prev.filter((item) => !isSameWishlistVariant(item, product))
      } else {
        updated = [...prev, product]
      }
      localStorage.setItem('mera_wishlist', JSON.stringify(updated))
      return updated
    })
  }

  function handleRemoveFromWishlist(productId, selectedColor, selectedSize) {
    setWishlistItems((prev) => {
      const updated = prev.filter((item) => {
        if (item.id !== productId) return true
        if (selectedColor !== undefined && (item.selectedColor || '') !== (selectedColor || '')) {
          return true
        }
        if (selectedSize !== undefined && item.selectedSize && item.selectedSize !== selectedSize) {
          return true
        }
        return false
      })
      localStorage.setItem('mera_wishlist', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className="app-layout">
      <SiteHeader 
        title="MERA Apparel" 
        links={navigationLinks} 
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        wishlistCount={wishlistItems.length}
        cartCount={cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        notificationsCount={unreadNotificationsCount}
      />

      <main id="main-content" className="site-main" tabIndex={-1}>
        <ProductSelectionProvider items={apparelItems}>
          <OrdersProvider>
            <Outlet context={{ 
              cartItems, 
              wishlistItems, 
              handleAddToCart, 
              handleRemoveFromCart, 
              handleToggleWishlist, 
              clearCart, 
              setIsCartOpen 
            }} />
          </OrdersProvider>
        </ProductSelectionProvider>
      </main>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemove={handleRemoveFromCart}
        onClear={clearCart}
        onUpdateQuantity={handleUpdateCartQuantity}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemove={handleRemoveFromWishlist}
        onAddToCart={(product) => {
          handleAddToCart(product)
          handleRemoveFromWishlist(product.id, product.selectedColor, product.selectedSize)
        }}
      />

      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

    </div>
  )
}