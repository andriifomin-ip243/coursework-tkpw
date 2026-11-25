import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import useOrders from '../hooks/useOrders.js'

const ALL_SIZES = ['S', 'M', 'L', 'XL']
const PHONE_PREFIX = '+380'

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

const DELIVERY_OPTIONS = [
  {
    id: 'nova_poshta_branch',
    title: 'Нова Пошта',
    desc: 'Відділення або поштомат',
    placeholder: 'Відділення або поштомат'
  },
  {
    id: 'nova_poshta_courier',
    title: 'Нова Пошта Кур’єр',
    desc: 'Адресна доставка',
    placeholder: 'Адреса'
  },
  {
    id: 'ukrposhta',
    title: 'Укрпошта',
    desc: 'Відділення по Україні',
    placeholder: 'Відділення або поштомат'
  },
  {
    id: 'pickup',
    title: 'Самовивіз',
    desc: 'м. Івано-Франківськ',
    placeholder: 'м. Івано-Франківськ (самовивіз)'
  }
]

const NOVA_POSHTA_SUGGESTIONS = [
  'м. Івано-Франківськ, Відділення №1 (вул. Максимовича, 8)',
  'м. Івано-Франківськ, Відділення №4 (вул. Галицька, 64)',
  'м. Івано-Франківськ, Відділення №12 (вул. Незалежності, 34)',
  'м. Івано-Франківськ, Поштомат №5421 (вул. Вовчинецька, 225)',
  'м. Київ, Відділення №1 (вул. Пирогівський шлях, 135)',
  'м. Київ, Відділення №18 (вул. Молодогвардійська, 22)',
  'м. Київ, Поштомат №7310 (вул. Хрещатик, 22)',
  'м. Львів, Відділення №1 (вул. Городоцька, 359)',
  'м. Львів, Відділення №7 (вул. Куліша, 36)',
  'м. Львів, Поштомат №3104 (пр-т Свободи, 28)',
  'м. Одеса, Відділення №1 (вул. Бугаївська, 21)',
  'м. Одеса, Відділення №14 (вул. Дерибасівська, 12)',
  'м. Дніпро, Відділення №1 (вул. Маршала Малиновського, 114)',
  'м. Харків, Відділення №1 (вул. Польова, 67)',
  'м. Миколаїв, Відділення №1 (пр-т Героїв України, 13)',
  'м. Миколаїв, Відділення №9 (вул. Соборна, 4)',
  'м. Вінниця, Відділення №1 (вул. Якова Шепеля, 1)',
  'м. Тернопіль, Відділення №1 (вул. Микулинецька, 46)',
  'м. Чернівці, Відділення №1 (вул. Руська, 248)',
  'м. Ужгород, Відділення №1 (вул. Верещагіна, 16)'
]

const UKRPOSHTA_SUGGESTIONS = [
  'м. Івано-Франківськ, Укрпошта 76000 (вул. Січових Стрільців, 15)',
  'м. Івано-Франківськ, Укрпошта 76018 (вул. Незалежності, 6)',
  'м. Івано-Франківськ, Укрпошта 76006 (вул. Вовчинецька, 198)',
  'м. Київ, Укрпошта 01001 (вул. Хрещатик, 22)',
  'м. Київ, Укрпошта 02002 (вул. Митрополита Андрея Шептицького, 16)',
  'м. Львів, Укрпошта 79000 (вул. Словацького, 1)',
  'м. Одеса, Укрпошта 65001 (вул. Садова, 10)',
  'м. Дніпро, Укрпошта 49000 (пр-т Дмитра Яворницького, 62)',
  'м. Харків, Укрпошта 61001 (пл. Привокзальна, 2)',
  'м. Миколаїв, Укрпошта 54001 (вул. Адміральська, 27)',
  'м. Вінниця, Укрпошта 21000 (вул. Соборна, 59)',
  'м. Тернопіль, Укрпошта 46001 (вул. В’ячеслава Чорновола, 1)'
]

const inputControlStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: '#111',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box'
}

const sectionCardStyle = {
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #eaeaea',
  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function formatPhoneWithPrefix(rawValue) {
  const digitsOnly = String(rawValue || '').replace(/\D/g, '')
  let nationalDigits = digitsOnly

  if (nationalDigits.startsWith('380')) {
    nationalDigits = nationalDigits.slice(3)
  } else if (nationalDigits.startsWith('0')) {
    nationalDigits = nationalDigits.slice(1)
  }

  return `${PHONE_PREFIX}${nationalDigits.slice(0, 9)}`
}

function readSavedUser() {
  try {
    const raw = localStorage.getItem('mera_user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function appendOrderCreatedNotification(orderId) {
  try {
    const raw = localStorage.getItem('mera_notifications')
    const existing = raw ? JSON.parse(raw) : []
    const list = Array.isArray(existing) ? existing : []

    const now = new Date()
    const timeLabel = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    const orderLabel = orderId ? `#${orderId}` : ''

    const newNotification = {
      id: Date.now(),
      title: 'Замовлення оформлено',
      text: `Замовлення ${orderLabel} успішно створено. Очікуйте на підтвердження.`.replace(/\s+/g, ' ').trim(),
      date: `Сьогодні, ${timeLabel}`,
      read: false,
      type: 'order'
    }

    const updated = [newNotification, ...list]
    localStorage.setItem('mera_notifications', JSON.stringify(updated))
    window.dispatchEvent(new Event('mera_notifications_updated'))
    window.dispatchEvent(new Event('storage'))
  } catch (e) {
    console.error(e)
  }
}

export default function OrderCreatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { createOrder } = useOrders()

  const { clearCart = () => {} } = useOutletContext() || {}

  const pageAlive = useRef(false)
  const addressWrapperRef = useRef(null)
  const fullNameInputRef = useRef(null)

  useEffect(() => {
    pageAlive.current = true
    return () => {
      pageAlive.current = false
    }
  }, [])

  const initialCartItems = location.state?.cartItems || []
  const savedUser = readSavedUser()

  const [editableItems, setEditableItems] = useState(() =>
    initialCartItems.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
      selectedSize: item.selectedSize || 'Standard',
      sameSizeForAll: true,
      splitSizes: item.splitSizes || [{ size: item.selectedSize || 'Standard', qty: item.quantity || 1 }]
    }))
  )

  const [editingIndex, setEditingIndex] = useState(null)
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false)

  const [formData, setFormData] = useState(() => {
    const profileName =
      savedUser?.name && savedUser.name.trim() !== 'Клієнт MERA' ? savedUser.name.trim() : ''
    const profilePhone = savedUser?.phone ? formatPhoneWithPrefix(savedUser.phone) : PHONE_PREFIX
    const profileTelegram = savedUser?.telegram ? savedUser.telegram.trim() : ''
    const profileCity = savedUser?.city ? savedUser.city.trim() : ''

    return {
      fullName: profileName,
      phone: profilePhone,
      telegram: profileTelegram,
      deliveryType: 'nova_poshta_branch',
      address: profileCity,
      paymentMethod: 'card_prepaid',
      comment: ''
    }
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fullNameError, setFullNameError] = useState('')
  const [profileAppliedNotice, setProfileAppliedNotice] = useState('')

  useEffect(() => {
    function handleOutsideClick(e) {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(e.target)) {
        setIsAddressDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  if (editableItems.length === 0) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', padding: '0 20px', fontFamily: 'inherit' }}>
        <PageHeading title="Оформлення замовлення" />
        <div style={{ ...sectionCardStyle, marginTop: '20px' }}>
          <EmptyState title="Ваш кошик порожній або товари не передано.">
            <p style={{ marginTop: '14px', marginBottom: 0 }}>
              <Link
                to="/catalog"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  background: '#7c3aed',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  fontSize: '13px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                }}
              >
                Відкрити каталог
              </Link>
            </p>
          </EmptyState>
        </div>
      </div>
    )
  }

  const totalCartPrice = editableItems.reduce((sum, ci) => sum + (ci.price * ci.quantity), 0)
  const totalQuantity = editableItems.reduce((sum, ci) => sum + ci.quantity, 0)

  const currentDeliveryOption =
    DELIVERY_OPTIONS.find((opt) => opt.id === formData.deliveryType) || DELIVERY_OPTIONS[0]

  const supportsAutocomplete =
    formData.deliveryType === 'nova_poshta_branch' || formData.deliveryType === 'ukrposhta'

  const baseSuggestions =
    formData.deliveryType === 'nova_poshta_branch'
      ? NOVA_POSHTA_SUGGESTIONS
      : formData.deliveryType === 'ukrposhta'
        ? UKRPOSHTA_SUGGESTIONS
        : []

  const normalizedQuery = formData.address.trim().toLowerCase()
  const filteredSuggestions = supportsAutocomplete
    ? baseSuggestions
        .filter((item) => !normalizedQuery || item.toLowerCase().includes(normalizedQuery))
        .slice(0, 6)
    : []

  function handleApplyProfileData() {
    const latestUser = readSavedUser()
    if (!latestUser) return

    setFullNameError('')
    setErrorMessage('')
    setFormData((prev) => ({
      ...prev,
      fullName:
        latestUser.name && latestUser.name.trim() !== 'Клієнт MERA'
          ? latestUser.name.trim()
          : prev.fullName,
      phone: latestUser.phone ? formatPhoneWithPrefix(latestUser.phone) : prev.phone,
      telegram: latestUser.telegram ? latestUser.telegram.trim() : prev.telegram,
      address:
        prev.deliveryType !== 'pickup' && latestUser.city
          ? latestUser.city.trim()
          : prev.address
    }))
    setProfileAppliedNotice('Дані підставлено з особистого профілю.')
  }

  function handleRemoveItemAtIndex(targetIdx) {
    setEditableItems((prev) => prev.filter((_, idx) => idx !== targetIdx))
    setEditingIndex((prev) => {
      if (prev === null) return null
      if (prev === targetIdx) return null
      if (prev > targetIdx) return prev - 1
      return prev
    })
  }

  function handlePhoneChange(e) {
    setProfileAppliedNotice('')
    setFormData((prev) => ({
      ...prev,
      phone: formatPhoneWithPrefix(e.target.value)
    }))
  }

  function handlePhoneKeyDown(e) {
    const input = e.currentTarget
    const selectionStart = input.selectionStart ?? 0
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectionStart <= PHONE_PREFIX.length) {
      e.preventDefault()
    }
  }

  function handleSelectDeliveryType(deliveryId) {
    const latestUser = readSavedUser()
    const profileCity = latestUser?.city ? latestUser.city.trim() : ''

    setFormData((prev) => {
      let nextAddress = prev.address
      if (deliveryId === 'pickup') {
        nextAddress = 'м. Івано-Франківськ (самовивіз)'
      } else if (prev.deliveryType === 'pickup') {
        nextAddress = profileCity
      }
      return {
        ...prev,
        deliveryType: deliveryId,
        address: nextAddress
      }
    })
    setIsAddressDropdownOpen(deliveryId === 'nova_poshta_branch' || deliveryId === 'ukrposhta')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanedName = formData.fullName.trim().replace(/\s+/g, ' ')
    const trimmedAddress = formData.address.trim()
    const nationalDigits = formData.phone.slice(PHONE_PREFIX.length).replace(/\D/g, '')

    const nameError = validateFullName(cleanedName)
    if (nameError) {
      setFullNameError(nameError)
      setErrorMessage(nameError)
      fullNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      fullNameInputRef.current?.focus({ preventScroll: true })
      return
    }
    setFullNameError('')

    if (!trimmedAddress) {
      setErrorMessage('Будь ласка, вкажіть адресу або відділення доставки.')
      return
    }

    if (nationalDigits.length !== 9) {
      setErrorMessage('Номер телефону має містити 9 цифр після +380 (наприклад, +380956665555).')
      return
    }

    const normalizedPhone = `${PHONE_PREFIX}${nationalDigits}`

    setIsSubmitting(true)
    setErrorMessage('')

    const cartSummaryText = editableItems
      .map((ci) => {
        if (ci.sameSizeForAll) {
          return `• ${ci.name} (Розмір: ${ci.selectedSize}, Кільк: ${ci.quantity} шт. — ${ci.price * ci.quantity} ₴)`
        }
        const splitDesc = ci.splitSizes.map((s) => `${s.qty} шт. - ${s.size}`).join(', ')
        return `• ${ci.name} (Розміри: [${splitDesc}], Загалом: ${ci.quantity} шт. — ${ci.price * ci.quantity} ₴)`
      })
      .join('\n')

    const paymentLabel = formData.paymentMethod === 'cash_on_delivery'
      ? 'Оплата при отриманні'
      : 'Повна передоплата на карту'

    const fullComment = `Спосіб доставки: ${currentDeliveryOption.title} (${currentDeliveryOption.desc})
Адреса: ${trimmedAddress}
Оплата: ${paymentLabel}
Telegram: ${formData.telegram.trim() || 'не вказано'}

Склад замовлення з налаштуваннями:
${cartSummaryText}${formData.comment.trim() ? `\n\nКоментар клієнта:\n${formData.comment.trim()}` : ''}`

    const orderPayload = {
      productId: editableItems[0]?.id || 'item-1',
      items: editableItems,
      contact: `${cleanedName} | ${normalizedPhone}`,
      address: trimmedAddress,
      quantity: totalQuantity,
      giftPackaging: editableItems.some((ci) => ci.giftPackaging),
      comment: fullComment
    }

    const result = await createOrder(orderPayload)
    setIsSubmitting(false)

    if (result.ok && pageAlive.current) {
      appendOrderCreatedNotification(result.record?.id)

      localStorage.removeItem('mera_cart')
      localStorage.removeItem('cart')
      localStorage.removeItem('cartItems')

      clearCart()

      window.localStorage.setItem('mera_cart', JSON.stringify([]))
      window.dispatchEvent(new Event('storage'))

      navigate('/orders', {
        replace: true,
        state: { highlightId: result.record.id }
      })
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
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
            &lsaquo; Повернутися назад
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111', margin: '0 0 8px 0' }}>Оформлення передзамовлення</h1>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Заповніть дані нижче, щоб ми могли зв'язатися з вами та підтвердити замовлення.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '32px', alignItems: 'start' }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {errorMessage && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
                {errorMessage}
              </div>
            )}

            <div style={sectionCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', margin: '0 0 4px 0' }}>Контактні дані</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Ми використовуємо ці дані лише для зв'язку щодо замовлення.</p>
                </div>

                {savedUser && (
                  <button
                    type="button"
                    onClick={handleApplyProfileData}
                    style={{
                      background: '#f5f3ff',
                      color: '#7c3aed',
                      border: '1px solid #ddd6fe',
                      borderRadius: '20px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      cursor: 'pointer'
                    }}
                  >
                    Підставити з профілю
                  </button>
                )}
              </div>

              {profileAppliedNotice && (
                <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600, marginTop: '8px' }}>
                  {profileAppliedNotice}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label htmlFor="fullName" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>ПІБ отримувача *</label>
                  <input
                    ref={fullNameInputRef}
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    aria-invalid={Boolean(fullNameError)}
                    placeholder="Прізвище Ім’я По батькові"
                    value={formData.fullName}
                    onChange={(e) => {
                      setProfileAppliedNotice('')
                      if (fullNameError) setFullNameError('')
                      if (errorMessage) setErrorMessage('')
                      setFormData({ ...formData, fullName: e.target.value })
                    }}
                    style={{
                      ...inputControlStyle,
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="phone" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>Номер телефону *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+380XXXXXXXXX"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      maxLength={13}
                      style={inputControlStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="telegram" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>Telegram (необов'язково)</label>
                    <input
                      id="telegram"
                      name="telegram"
                      type="text"
                      placeholder="@yournickname"
                      value={formData.telegram}
                      onChange={(e) => {
                        setProfileAppliedNotice('')
                        setFormData({ ...formData, telegram: e.target.value })
                      }}
                      style={inputControlStyle}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '6px' }}>Доставка</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: 0, marginBottom: '16px' }}>
                {supportsAutocomplete
                  ? 'Почніть вводити місто, щоб обрати відділення або поштомат зі списку.'
                  : formData.deliveryType === 'nova_poshta_courier'
                    ? 'Вкажіть точну адресу для доставки кур’єром.'
                    : 'Самовивіз доступний у м. Івано-Франківськ.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {DELIVERY_OPTIONS.map((opt) => {
                  const isSelected = formData.deliveryType === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectDeliveryType(opt.id)}
                      style={{
                        textAlign: 'left',
                        border: isSelected ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        cursor: 'pointer',
                        background: isSelected ? '#faf5ff' : '#fff',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '13px', color: isSelected ? '#5b21b6' : '#111' }}>{opt.title}</div>
                      <div style={{ fontSize: '12px', color: isSelected ? '#6d28d9' : '#666', marginTop: '2px' }}>{opt.desc}</div>
                    </button>
                  )
                })}
              </div>

              <div ref={addressWrapperRef} style={{ position: 'relative' }}>
                <label htmlFor="address" style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '6px' }}>
                  {formData.deliveryType === 'nova_poshta_courier' ? 'Адреса доставки *' : 'Відділення / поштомат *'}
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder={currentDeliveryOption.placeholder}
                  value={formData.address}
                  onFocus={() => {
                    if (supportsAutocomplete) setIsAddressDropdownOpen(true)
                  }}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    if (supportsAutocomplete) setIsAddressDropdownOpen(true)
                  }}
                  style={inputControlStyle}
                />

                {supportsAutocomplete && isAddressDropdownOpen && filteredSuggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 30,
                      maxHeight: '220px',
                      overflowY: 'auto'
                    }}
                  >
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, address: suggestion }))
                          setIsAddressDropdownOpen(false)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 14px',
                          background: formData.address === suggestion ? '#f5f3ff' : '#fff',
                          color: formData.address === suggestion ? '#6d28d9' : '#111',
                          border: 'none',
                          borderBottom: '1px solid #f3f4f6',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          fontWeight: formData.address === suggestion ? 700 : 500,
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f5f3ff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = formData.address === suggestion ? '#f5f3ff' : '#fff'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '6px' }}>Оплата</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: 0, marginBottom: '18px' }}>Оберіть спосіб оплати.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  { id: 'card_prepaid', title: 'Повна передоплата на карту', desc: 'Найшвидше опрацювання' },
                  { id: 'cash_on_delivery', title: 'Оплата при отриманні', desc: 'Нова Пошта (комісія 20 ₴ + 2%)' },
                ].map((opt) => {
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
                      <div style={{ fontSize: '12px', color: isSelected ? '#6d28d9' : '#666', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={sectionCardStyle}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginTop: 0, marginBottom: '6px' }}>Примітка до замовлення</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: 0, marginBottom: '12px' }}>За бажанням, вкажіть додаткову інформацію.</p>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                placeholder="Примітка..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                style={{ ...inputControlStyle, resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: '#7c3aed',
                color: '#fff',
                border: 'none',
                borderRadius: '30px',
                padding: '15px 24px',
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'inherit',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                boxShadow: '0 6px 18px rgba(124, 58, 237, 0.28)',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Опрацювання...' : 'Підтвердити передзамовлення'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
              Ваші дані захищені та не передаються третім особам.
            </div>
          </form>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #eaeaea', position: 'sticky', top: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eceef2', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#111', margin: 0 }}>Ваше замовлення</h3>
              <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>{editableItems.length} товари</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', maxHeight: '420px', overflowY: 'auto' }}>
              {editableItems.map((ci, idx) => {
                const isEditing = editingIndex === idx
                const itemImageUrl = ci.image || ci.images?.[0]?.url || null

                return (
                  <div key={`${ci.id || idx}-${idx}`} style={{ background: '#fafafa', borderRadius: '12px', border: '1px solid #eceef2', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {itemImageUrl ? (
                        <img
                          src={itemImageUrl}
                          alt={ci.name}
                          style={{
                            width: '48px',
                            height: '58px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '58px', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800, color: '#6b7280' }}>
                          MERA
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#111' }}>{ci.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          {ci.sameSizeForAll ? (
                            <span>Розмір: <strong>{ci.selectedSize}</strong> | Кільк: <strong>{ci.quantity} шт.</strong></span>
                          ) : (
                            <span>Кільк: <strong>{ci.quantity} шт.</strong> ({ci.splitSizes.map((s) => `${s.qty}×${s.size}`).join(', ')})</span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#111', marginBottom: '6px' }}>
                          {ci.price * ci.quantity} ₴
                        </div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(isEditing ? null : idx)}
                            style={{
                              background: isEditing ? '#7c3aed' : '#f5f3ff',
                              color: isEditing ? '#fff' : '#7c3aed',
                              border: isEditing ? '1px solid #7c3aed' : '1px solid #ddd6fe',
                              borderRadius: '20px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              fontFamily: 'inherit'
                            }}
                          >
                            {isEditing ? 'Готово' : 'Змінити'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItemAtIndex(idx)}
                            aria-label={`Прибрати ${ci.name} із замовлення`}
                            title="Прибрати із замовлення"
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '20px',
                              width: '26px',
                              height: '24px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={ci.sameSizeForAll}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setEditableItems((prev) =>
                                prev.map((entry, i) => (i === idx ? { ...entry, sameSizeForAll: checked } : entry))
                              )
                            }}
                            style={{ accentColor: '#7c3aed', width: '15px', height: '15px' }}
                          />
                          Всі одного розміру
                        </label>

                        {ci.sameSizeForAll ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>Розмір:</label>
                              <select
                                value={ci.selectedSize}
                                onChange={(e) => {
                                  const nextSize = e.target.value
                                  setEditableItems((prev) =>
                                    prev.map((entry, i) => (i === idx ? { ...entry, selectedSize: nextSize } : entry))
                                  )
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', fontSize: '12px', fontFamily: 'inherit' }}
                              >
                                {ALL_SIZES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>Кількість:</label>
                              <input
                                type="number"
                                min="1"
                                value={ci.quantity}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value, 10) || 1)
                                  setEditableItems((prev) =>
                                    prev.map((entry, i) => (i === idx ? { ...entry, quantity: val } : entry))
                                  )
                                }}
                                style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>Розподіл кількості по розмірах:</div>
                            {ci.splitSizes.map((split, sIdx) => {
                              const usedSizes = ci.splitSizes
                                .filter((_, i) => i !== sIdx)
                                .map((s) => s.size)

                              const availableSizes = ALL_SIZES.filter((s) => !usedSizes.includes(s) || s === split.size)

                              return (
                                <div key={sIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <select
                                    value={split.size}
                                    onChange={(e) => {
                                      const nextSize = e.target.value
                                      setEditableItems((prev) =>
                                        prev.map((entry, i) => {
                                          if (i !== idx) return entry
                                          const nextSplit = entry.splitSizes.map((sp, j) =>
                                            j === sIdx ? { ...sp, size: nextSize } : sp
                                          )
                                          return { ...entry, splitSizes: nextSplit }
                                        })
                                      )
                                    }}
                                    style={{ flex: 1, padding: '5px 8px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px', fontFamily: 'inherit', background: '#fff' }}
                                  >
                                    {availableSizes.map((s) => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    min="1"
                                    value={split.qty}
                                    onChange={(e) => {
                                      const val = Math.max(1, parseInt(e.target.value, 10) || 1)
                                      setEditableItems((prev) =>
                                        prev.map((entry, i) => {
                                          if (i !== idx) return entry
                                          const nextSplit = entry.splitSizes.map((sp, j) =>
                                            j === sIdx ? { ...sp, qty: val } : sp
                                          )
                                          const totalQ = nextSplit.reduce((sum, item) => sum + item.qty, 0)
                                          return { ...entry, splitSizes: nextSplit, quantity: Math.max(1, totalQ) }
                                        })
                                      )
                                    }}
                                    style={{ width: '56px', padding: '5px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px', fontFamily: 'inherit', textAlign: 'center', boxSizing: 'border-box' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditableItems((prev) =>
                                        prev.map((entry, i) => {
                                          if (i !== idx) return entry
                                          const nextSplit = entry.splitSizes.filter((_, j) => j !== sIdx)
                                          const totalQ = nextSplit.reduce((sum, item) => sum + item.qty, 0)
                                          return { ...entry, splitSizes: nextSplit, quantity: Math.max(1, totalQ) }
                                        })
                                      )
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                                  >
                                    &times;
                                  </button>
                                </div>
                              )
                            })}

                            {ci.splitSizes.length < ALL_SIZES.length && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditableItems((prev) =>
                                    prev.map((entry, i) => {
                                      if (i !== idx) return entry
                                      const usedSizes = entry.splitSizes.map((s) => s.size)
                                      const firstAvailable = ALL_SIZES.find((s) => !usedSizes.includes(s)) || 'M'
                                      const nextSplit = [...entry.splitSizes, { size: firstAvailable, qty: 1 }]
                                      const totalQ = nextSplit.reduce((sum, item) => sum + item.qty, 0)
                                      return { ...entry, splitSizes: nextSplit, quantity: Math.max(1, totalQ) }
                                    })
                                  )
                                }}
                                style={{ background: '#faf5ff', border: '1px dashed #7c3aed', color: '#7c3aed', borderRadius: '8px', padding: '6px', fontSize: '11px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
                              >
                                + Додати ще один розмір
                              </button>
                            )}
                          </div>
                        )}

                        <div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}>
                            <input
                              type="checkbox"
                              checked={ci.giftPackaging}
                              onChange={(e) => {
                                const checked = e.target.checked
                                setEditableItems((prev) =>
                                  prev.map((entry, i) => (i === idx ? { ...entry, giftPackaging: checked } : entry))
                                )
                              }}
                              style={{ accentColor: '#7c3aed' }}
                            />
                            Подарункове пакування
                          </label>
                        </div>

                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ borderTop: '1px solid #eceef2', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#111' }}>
                <span>Загальна сума (без доставки)</span>
                <span>{totalCartPrice} ₴</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}