import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import useOrders from '../hooks/useOrders.js'
import NotFoundPage from './NotFoundPage.jsx'
import PageHeading from '../components/ui/PageHeading.jsx'

function validateFullName(rawName) {
  const cleaned = String(rawName || '').trim().replace(/\s+/g, ' ')

  if (!cleaned) {
    return 'Вкажіть ПІБ отримувача.'
  }

  const validCharsRegex = /^[A-Za-zА-Яа-яІіЇїЄєҐґ'’ -]+$/
  if (!validCharsRegex.test(cleaned)) {
    return 'ПІБ може містити лише літери, пробіл, дефіс або апостроф.'
  }

  const parts = cleaned.split(' ').filter(Boolean)
  if (parts.length < 2) {
    return 'Вкажіть щонайменше ім’я та прізвище.'
  }

  const hasShortPart = parts.some((part) => part.replace(/['’-]/g, '').length < 2)
  if (hasShortPart) {
    return 'Кожна частина ПІБ має містити щонайменше 2 літери.'
  }

  return ''
}

const fieldInputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  background: '#fff',
  color: '#111',
  boxSizing: 'border-box'
}

const sectionCardStyle = {
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #eaeaea',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
}

export default function OrderEditPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { orders, updateOrder, isMutating } = useOrders()

  const pageAlive = useRef(false)
  const activeId = useRef(orderId)
  const fullNameInputRef = useRef(null)

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

  const [formData, setFormData] = useState(() => {
    const commentText = order?.comment || ''
    const deliveryMatch = commentText.match(/Спосіб доставки:\s*(.*)/)
    const paymentMatch = commentText.match(/Оплата:\s*(.*)/)
    const telegramMatch = commentText.match(/Telegram:\s*(.*)/)
    const addressMatch = commentText.match(/Адреса:\s*(.*)/)
    const cleanCommentMatch = commentText.includes('Коментар клієнта:') ? commentText.split('Коментар клієнта:')[1]?.trim() : ''

    return {
      fullName: order?.contact ? order.contact.split('|')[0]?.trim() : '',
      phone: order?.contact && order.contact.includes('|') ? order.contact.split('|')[1]?.trim() : '',
      telegram: order?.telegram || (telegramMatch ? telegramMatch[1].trim() : ''),
      deliveryType: order?.deliveryType || (deliveryMatch ? deliveryMatch[1].trim() : 'nova_poshta_branch'),
      address: order?.address || (addressMatch ? addressMatch[1].trim() : ''),
      paymentMethod: order?.paymentMethod || (paymentMatch ? paymentMatch[1].trim() : 'card_prepaid'),
      comment: cleanCommentMatch || (commentText.includes('Спосіб доставки') ? '' : commentText)
    }
  })

  const [error, setError] = useState('')
  const [fullNameError, setFullNameError] = useState('')

  if (!order) {
    return <NotFoundPage title="404: Заявку для редагування не знайдено" />
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const cleanedName = formData.fullName.trim().replace(/\s+/g, ' ')
    const trimmedPhone = formData.phone.trim()
    const trimmedAddress = formData.address.trim()

    const nameError = validateFullName(cleanedName)
    if (nameError) {
      setFullNameError(nameError)
      setError(nameError)
      fullNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      fullNameInputRef.current?.focus({ preventScroll: true })
      return
    }
    setFullNameError('')

    if (!trimmedPhone || !trimmedAddress) {
      setError('Будь ласка, заповніть обов’язкові поля (телефон, адреса).')
      return
    }

    setError('')

    const fullComment = `Спосіб доставки: ${formData.deliveryType}
Адреса: ${trimmedAddress}
Оплата: ${formData.paymentMethod}
Telegram: ${formData.telegram.trim() || 'не вказано'}

Коментар клієнта:
${formData.comment}`

    const updatedPayload = {
      ...order,
      productId: order.items && order.items.length > 0 ? order.items[0].id : order.productId,
      items: order.items ? [...order.items] : [],
      contact: `${cleanedName} | ${trimmedPhone}`,
      address: trimmedAddress,
      deliveryType: formData.deliveryType,
      paymentMethod: formData.paymentMethod,
      telegram: formData.telegram.trim(),
      comment: fullComment
    }

    const result = await updateOrder(order.id, updatedPayload)

    if (result.ok && pageAlive.current && activeId.current === order.id) {
      navigate(`/orders/${encodeURIComponent(order.id)}`, { replace: true })
    } else if (!result.ok) {
      setError(result.message || 'Помилка збереження змін')
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => navigate(`/orders/${encodeURIComponent(order.id)}`)}
            style={{
              background: '#f5f3ff',
              color: '#7c3aed',
              border: '1px solid #ddd6fe',
              borderRadius: '30px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'inherit'
            }}
          >
            &lsaquo; Повернутися до заявки
          </button>
        </div>

        <PageHeading title={`Редагування заявки ${order.id}`} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
              {error}
            </div>
          )}

          {/* КОНТАКТНІ ДАНІ */}
          <div style={sectionCardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '16px' }}>
              Контактні дані
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>
                  ПІБ отримувача *
                </label>
                <input
                  ref={fullNameInputRef}
                  type="text"
                  required
                  aria-invalid={Boolean(fullNameError)}
                  value={formData.fullName}
                  onChange={e => {
                    if (fullNameError) setFullNameError('')
                    if (error) setError('')
                    setFormData({ ...formData, fullName: e.target.value })
                  }}
                  style={{
                    ...fieldInputStyle,
                    border: fullNameError ? '1.5px solid #dc2626' : '1px solid #ddd',
                    background: fullNameError ? '#fef2f2' : '#fff'
                  }}
                />
                {fullNameError && (
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, marginTop: '6px' }}>
                    {fullNameError}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>
                    Номер телефону *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    style={fieldInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>
                    Telegram
                  </label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                    style={fieldInputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ДОСТАВКА */}
          <div style={sectionCardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '16px' }}>
              Доставка
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { id: 'nova_poshta_branch', title: 'Нова Пошта', desc: 'У відділення' },
                { id: 'nova_poshta_courier', title: 'Нова Пошта', desc: 'Кур’єром' },
                { id: 'ukrposhta', title: 'Укрпошта', desc: 'У відділення' },
                { id: 'pickup', title: 'Самовивіз', desc: 'м. Івано-Франківськ' },
              ].map(opt => {
                const isSelected = formData.deliveryType === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, deliveryType: opt.id })}
                    style={{
                      border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      background: isSelected ? '#faf5ff' : '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? '#5b21b6' : '#111' }}>{opt.title}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                )
              })}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>
                Місто та відділення / адреса *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                style={fieldInputStyle}
              />
            </div>
          </div>

          {/* ОПЛАТА */}
          <div style={sectionCardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '16px' }}>
              Оплата
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { id: 'card_prepaid', title: 'Повна передоплата на карту', desc: 'Найшвидше опрацювання' },
                { id: 'cash_on_delivery', title: 'Оплата при отриманні', desc: 'Нова Пошта' },
              ].map(opt => {
                const isSelected = formData.paymentMethod === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => setFormData({ ...formData, paymentMethod: opt.id })}
                    style={{
                      border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      background: isSelected ? '#faf5ff' : '#fff',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? '#5b21b6' : '#111' }}>{opt.title}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* КОМЕНТАР */}
          <div style={sectionCardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '10px' }}>
              Коментар до замовлення
            </h3>
            <textarea
              rows={3}
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              style={{ ...fieldInputStyle, resize: 'vertical' }}
            />
          </div>

          {/* КНОПКИ ЗБЕРЕЖЕННЯ */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => navigate(`/orders/${encodeURIComponent(order.id)}`)}
              style={{
                background: '#f5f3ff',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
                borderRadius: '30px',
                padding: '12px 22px',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isMutating}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: isMutating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                opacity: isMutating ? 0.65 : 1
              }}
            >
              {isMutating ? 'Збереження...' : 'Зберегти зміни'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}