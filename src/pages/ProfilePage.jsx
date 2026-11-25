import { Link } from 'react-router'

export default function ProfilePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '20px', fontSize: '13px', color: '#666' }}>
        <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Головна</Link>
        {' / '}
        <span style={{ color: '#111', fontWeight: 600 }}>Профіль</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', color: '#111' }}>
        Кабінет покупця MERA
      </h1>

      <div
        style={{
          background: '#fff',
          border: '1px solid #eaeaea',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              background: '#7c3aed',
              color: '#fff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              flexShrink: 0
            }}
          >
            ФА
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#111' }}>Андрій Фомін</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 0' }}>
              Статус: Учасник передзамовлень MERA Apparel
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '4px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111' }}>Швидкі посилання</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/orders"
              style={{
                padding: '11px 20px',
                background: '#7c3aed',
                color: '#fff',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)'
              }}
            >
              Мої замовлення
            </Link>
            <Link
              to="/catalog"
              style={{
                padding: '11px 20px',
                background: '#f5f3ff',
                color: '#7c3aed',
                borderRadius: '30px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              Перейти до каталогу
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}