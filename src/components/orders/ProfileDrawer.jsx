import { useState, useEffect } from 'react'
import { Link } from 'react-router'

const PHONE_PREFIX = '+380'

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

function validateFullName(rawName) {
  const cleaned = String(rawName || '').trim().replace(/\s+/g, ' ')

  if (!cleaned) {
    return 'Вкажіть ПІБ.'
  }

  const validCharsRegex = /^[A-Za-zА-Яа-яІіЇїЄєҐґ'’\- ]+$/
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

function buildInitials(fullName) {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return 'МК'
}

function OrdersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function CatalogIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

export default function ProfileDrawer({ isOpen, onClose }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mera_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [view, setView] = useState('menu') // 'menu' | 'personal'
  const [authMode, setAuthMode] = useState('idle') // 'idle' | 'register' | 'login'
  const [step, setStep] = useState('form') // 'form' | 'verify'
  const [confirmLogout, setConfirmLogout] = useState(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState(PHONE_PREFIX)
  const [enteredCode, setEnteredCode] = useState('')
  const [serverCode, setServerCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [personalForm, setPersonalForm] = useState(() => ({
    name: user?.name || '',
    phone: user?.phone ? formatPhoneWithPrefix(user.phone) : PHONE_PREFIX,
    telegram: user?.telegram || '',
    city: user?.city || ''
  }))
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => {
    if (user) {
      localStorage.setItem('mera_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('mera_user')
    }
  }, [user])

  if (!isOpen) return null

  function resetAuthForm() {
    setAuthMode('idle')
    setStep('form')
    setConfirmLogout(false)
    setName('')
    setPhone(PHONE_PREFIX)
    setEnteredCode('')
    setServerCode('')
    setErrorMsg('')
  }

  function handleCloseDrawer() {
    setView('menu')
    setConfirmLogout(false)
    setSavedNotice('')
    setErrorMsg('')
    if (!user) {
      resetAuthForm()
    }
    onClose()
  }

  function handleOpenPersonalData() {
    setConfirmLogout(false)
    setPersonalForm({
      name: user?.name || '',
      phone: user?.phone ? formatPhoneWithPrefix(user.phone) : PHONE_PREFIX,
      telegram: user?.telegram || '',
      city: user?.city || ''
    })
    setSavedNotice('')
    setErrorMsg('')
    setView('personal')
  }

  function handlePhoneChange(e) {
    setPhone(formatPhoneWithPrefix(e.target.value))
  }

  function handlePhoneKeyDown(e) {
    const input = e.currentTarget
    const selectionStart = input.selectionStart ?? 0
    if ((e.key === 'Backspace' || e.key === 'Delete') && selectionStart <= PHONE_PREFIX.length) {
      e.preventDefault()
    }
  }

  function handleStartAuth(e) {
    e.preventDefault()
    if (authMode === 'register') {
      const nameError = validateFullName(name)
      if (nameError) {
        setErrorMsg(nameError)
        return
      }
    }

    const nationalDigits = phone.slice(PHONE_PREFIX.length).replace(/\D/g, '')
    if (nationalDigits.length !== 9) {
      setErrorMsg('Введіть номер телефону.')
      return
    }

    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString()
    setServerCode(generatedCode)
    setStep('verify')
    setErrorMsg('')
  }

  function handleVerifyCode(e) {
    e.preventDefault()
    if (enteredCode.trim() !== serverCode) {
      setErrorMsg('Невірний код. Спробуйте ще раз.')
      return
    }

    const cleanedName = name.trim().replace(/\s+/g, ' ')
    const finalName = cleanedName || (authMode === 'login' ? 'Клієнт MERA' : '')
    const newUser = {
      name: finalName,
      phone: phone.trim(),
      initials: buildInitials(finalName),
      telegram: '',
      city: ''
    }

    setUser(newUser)
    setPersonalForm({
      name: newUser.name || '',
      phone: newUser.phone ? formatPhoneWithPrefix(newUser.phone) : PHONE_PREFIX,
      telegram: '',
      city: ''
    })
    resetAuthForm()
  }

  function handleLogout() {
    setUser(null)
    setView('menu')
    resetAuthForm()
  }

  function handleSavePersonalData(e) {
    e.preventDefault()
    const trimmedName = personalForm.name.trim().replace(/\s+/g, ' ')
    const nationalDigits = personalForm.phone.slice(PHONE_PREFIX.length).replace(/\D/g, '')

    const nameError = validateFullName(trimmedName)
    if (nameError) {
      setErrorMsg(nameError)
      return
    }

    if (nationalDigits.length !== 9) {
      setErrorMsg('Номер телефону має містити 9 цифр після +380.')
      return
    }

    const normalizedPhone = `${PHONE_PREFIX}${nationalDigits}`
    const updatedUser = {
      ...(user || {}),
      name: trimmedName,
      phone: normalizedPhone,
      telegram: personalForm.telegram.trim(),
      city: personalForm.city.trim(),
      initials: buildInitials(trimmedName)
    }

    setUser(updatedUser)
    setErrorMsg('')
    setSavedNotice('Дані збережено.')
  }

  const menuLinkStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    textDecoration: 'none',
    color: '#111',
    borderRadius: '12px',
    transition: 'background 0.15s ease'
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box'
  }

  return (
    <div className="cart-drawer-overlay" onClick={handleCloseDrawer}>
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', overflow: 'hidden' }}
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
            {view === 'personal' && (
              <button
                type="button"
                onClick={() => {
                  setView('menu')
                  setErrorMsg('')
                  setSavedNotice('')
                }}
                aria-label="Назад до кабінету"
                style={{
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 700
                }}
              >
                &lsaquo;
              </button>
            )}
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
              {view === 'personal' ? 'Особисті дані' : 'Кабінет покупця'}
            </h2>
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

        <div className="cart-drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {view === 'personal' ? (
            <form onSubmit={handleSavePersonalData} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.45 }}>
                Збережені контакти можна використовувати для швидкого оформлення замовлень.
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                  ПІБ *
                </label>
                <input
                  type="text"
                  placeholder="ПІБ"
                  value={personalForm.name}
                  onChange={(e) => {
                    setPersonalForm((prev) => ({ ...prev, name: e.target.value }))
                    setSavedNotice('')
                  }}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                  Номер телефону *
                </label>
                <input
                  type="tel"
                  placeholder="+380XXXXXXXXX"
                  value={personalForm.phone}
                  onChange={(e) => {
                    setPersonalForm((prev) => ({ ...prev, phone: formatPhoneWithPrefix(e.target.value) }))
                    setSavedNotice('')
                  }}
                  onKeyDown={handlePhoneKeyDown}
                  maxLength={13}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                  Telegram
                </label>
                <input
                  type="text"
                  placeholder="@username"
                  value={personalForm.telegram}
                  onChange={(e) => {
                    setPersonalForm((prev) => ({ ...prev, telegram: e.target.value }))
                    setSavedNotice('')
                  }}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>
                  Місто доставки
                </label>
                <input
                  type="text"
                  placeholder="Введіть місто"
                  value={personalForm.city}
                  onChange={(e) => {
                    setPersonalForm((prev) => ({ ...prev, city: e.target.value }))
                    setSavedNotice('')
                  }}
                  style={inputStyle}
                />
              </div>

              {errorMsg && <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>{errorMsg}</div>}
              {savedNotice && <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700 }}>{savedNotice}</div>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '11px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                  }}
                >
                  Зберегти дані
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('menu')
                    setErrorMsg('')
                    setSavedNotice('')
                  }}
                  style={{
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '11px 16px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  Назад
                </button>
              </div>
            </form>
          ) : (
            <>
              <div
                style={{
                  background: '#fafafa',
                  border: '1px solid #eaeaea',
                  padding: '18px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {user ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          background: '#7c3aed',
                          color: '#fff',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '15px',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                          flexShrink: 0
                        }}
                      >
                        {user.initials}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#111', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{user.phone}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={handleOpenPersonalData}
                        style={{
                          flex: 1,
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '9px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.22)'
                        }}
                      >
                        Особисті дані
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmLogout(true)}
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '30px',
                          padding: '9px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        Вийти
                      </button>
                    </div>
                  </>
                ) : step === 'verify' ? (
                  <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>Підтвердження номера</div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#5b21b6',
                        background: '#f5f3ff',
                        border: '1px solid #ddd6fe',
                        padding: '8px 10px',
                        borderRadius: '10px'
                      }}
                    >
                      Код підтвердження для {phone}: <strong>{serverCode}</strong>
                    </div>

                    <input
                      type="text"
                      placeholder="0000"
                      maxLength={4}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                      required
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        textAlign: 'center',
                        letterSpacing: '6px',
                        outline: 'none',
                        fontWeight: 800,
                        background: '#fff'
                      }}
                    />

                    {errorMsg && <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>{errorMsg}</div>}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                        }}
                      >
                        Підтвердити
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('form')
                          setErrorMsg('')
                        }}
                        style={{
                          background: '#fff',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '30px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        Назад
                      </button>
                    </div>
                  </form>
                ) : authMode === 'idle' ? (
                  <div style={{ textAlign: 'center', padding: '4px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#111' }}>Вітаємо у MERA!</div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                      Увійдіть або створіть профіль, щоб керувати замовленнями
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        style={{
                          flex: 1,
                          background: '#f5f3ff',
                          color: '#7c3aed',
                          border: '1px solid #ddd6fe',
                          borderRadius: '30px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        Увійти
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        style={{
                          flex: 1,
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                        }}
                      >
                        Реєстрація
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleStartAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>
                        {authMode === 'register' ? 'Створення акаунта' : 'Вхід у систему'}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode(authMode === 'register' ? 'login' : 'register')
                          setErrorMsg('')
                        }}
                        style={{ background: 'none', border: 'none', fontSize: '12px', color: '#7c3aed', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
                      >
                        {authMode === 'register' ? 'Вже є акаунт' : 'Створити акаунт'}
                      </button>
                    </div>

                    {authMode === 'register' && (
                      <input
                        type="text"
                        placeholder="ПІБ"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                      />
                    )}

                    <input
                      type="tel"
                      placeholder="+380XXXXXXXXX"
                      value={phone}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      maxLength={13}
                      required
                      style={inputStyle}
                    />

                    {errorMsg && <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>{errorMsg}</div>}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '30px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                        }}
                      >
                        Отримати код
                      </button>
                      <button
                        type="button"
                        onClick={resetAuthForm}
                        style={{
                          background: '#fff',
                          color: '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '30px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          cursor: 'pointer'
                        }}
                      >
                        Скасувати
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px', paddingLeft: '12px' }}>
                  Керування замовленнями
                </div>

                <Link
                  to="/orders"
                  onClick={handleCloseDrawer}
                  style={menuLinkStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#faf5ff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}>
                    <span style={{ color: '#7c3aed', display: 'inline-flex' }}><OrdersIcon /></span>
                    <span>Мої передзамовлення</span>
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '16px' }}>&rsaquo;</span>
                </Link>

                <Link
                  to="/catalog"
                  onClick={handleCloseDrawer}
                  style={menuLinkStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#faf5ff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}>
                    <span style={{ color: '#7c3aed', display: 'inline-flex' }}><CatalogIcon /></span>
                    <span>Каталог товарів</span>
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '16px' }}>&rsaquo;</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {confirmLogout && (
          <div
            onClick={() => setConfirmLogout(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(17, 17, 17, 0.35)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
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
                background: '#fff',
                borderRadius: '20px',
                padding: '22px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.14)',
                border: '1px solid #ececef',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#111' }}>
                Вийти з акаунта?
              </div>
              <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
                Ви вийдете з профілю. Збережені особисті дані залишаться доступними для швидкого оформлення замовлень.
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  style={{
                    background: '#fff',
                    color: '#111',
                    border: '1px solid #e5e7eb',
                    borderRadius: '30px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                  }}
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}