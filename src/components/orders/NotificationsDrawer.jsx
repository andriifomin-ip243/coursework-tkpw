import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'

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

function readStoredNotifications() {
  try {
    const saved = localStorage.getItem('mera_notifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return [
    {
      id: 1,
      title: 'Замовлення підтверджено',
      text: 'Ваше передзамовлення #MERA-7482 успішно підтверджено менеджером.',
      date: 'Сьогодні, 14:20',
      read: false,
      type: 'order'
    },
    {
      id: 2,
      title: 'Зміна статусу замовлення',
      text: 'Передзамовлення передано на виробництво (виготовлення бланка 230г).',
      date: 'Вчора, 18:05',
      read: false,
      type: 'status'
    },
    {
      id: 3,
      title: 'Новий дроп MERA',
      text: 'Колекція "City Coordinates" уже доступна в каталозі. Кількість обмежена.',
      date: '3 дні тому',
      read: true,
      type: 'brand'
    }
  ]
}

export default function NotificationsDrawer({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(readStoredNotifications)
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false)

  useEffect(() => {
    function syncFromStorage() {
      setNotifications(readStoredNotifications())
    }
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('mera_notifications_updated', syncFromStorage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('mera_notifications_updated', syncFromStorage)
    }
  }, [])

  function saveNotifications(updater) {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem('mera_notifications', JSON.stringify(next))
      } catch (e) {
        console.error(e)
      }
      return next
    })
  }

  if (!isOpen) return null

  const showConfirmClear = isConfirmClearOpen && notifications.length > 0
  const unreadCount = notifications.filter((n) => !n.read).length

  function handleCloseDrawer() {
    setIsConfirmClearOpen(false)
    onClose()
  }

  function handleGoToCatalog() {
    setIsConfirmClearOpen(false)
    onClose()
    navigate('/catalog')
  }

  function handleMarkAllAsRead() {
    saveNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function handleMarkSingleAsRead(id) {
    saveNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function handleDelete(id) {
    saveNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function handleConfirmClearAll() {
    setIsConfirmClearOpen(false)
    saveNotifications([])
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Сповіщення</h2>
            {unreadCount > 0 && (
              <span
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
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
          {notifications.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', paddingTop: '10px' }}>
              <p className="empty-cart-text" style={{ margin: 0, color: '#555' }}>
                У вас поки немає сповіщень.
              </p>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.read) handleMarkSingleAsRead(item.id)
                  }}
                  style={{
                    background: item.read ? '#f9fafb' : '#faf5ff',
                    border: item.read ? '1px solid #e5e7eb' : '1px solid #ddd6fe',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    cursor: item.read ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!item.read && (
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: '#7c3aed',
                            flexShrink: 0
                          }}
                        />
                      )}
                      <span>{item.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                      aria-label="Видалити сповіщення"
                      title="Видалити"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        fontSize: '16px',
                        lineHeight: 1,
                        padding: '0 2px',
                        flexShrink: 0
                      }}
                    >
                      &times;
                    </button>
                  </div>

                  <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.45' }}>
                    {item.text}
                  </div>

                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.date}</span>
                    {!item.read && (
                      <span style={{ color: '#7c3aed', fontWeight: 700 }}>Нове</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="cart-drawer-footer" style={{ borderTop: '1px solid #eaeaea', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                aria-label="Очистити сповіщення"
                title="Очистити сповіщення"
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
                disabled={unreadCount === 0}
                onClick={handleMarkAllAsRead}
                style={{
                  flex: 1,
                  background: unreadCount === 0 ? '#f3f4f6' : '#7c3aed',
                  color: unreadCount === 0 ? '#9ca3af' : '#fff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '13px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: unreadCount === 0 ? 'default' : 'pointer',
                  boxShadow: unreadCount === 0 ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.28)',
                  transition: 'all 0.15s ease'
                }}
              >
                {unreadCount === 0 ? 'Усі прочитані ✓' : 'Позначити всі прочитаними'}
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
                Очистити сповіщення?
              </h3>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.45, color: '#555' }}>
                Усі сповіщення буде видалено. Цю дію не можна буде скасувати.
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