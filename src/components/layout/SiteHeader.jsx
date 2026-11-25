import { useNavigate, useSearchParams, useLocation } from 'react-router'
import MainNav from '../navigation/MainNav.jsx'

export default function SiteHeader({ 
  title, 
  links, 
  onCartClick, 
  onWishlistClick, 
  onProfileClick, 
  onNotificationsClick,
  wishlistCount, 
  cartCount,
  notificationsCount = 0
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentQuery = searchParams.get('q') || ''

  function handleSearchChange(e) {
    const query = e.target.value
    
    if (location.pathname.startsWith('/catalog')) {
      const newParams = new URLSearchParams(searchParams)
      if (query.trim() !== '') {
        newParams.set('q', query)
      } else {
        newParams.delete('q')
      }
      navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })
    } else {
      if (query.trim() !== '') {
        navigate(`/catalog?q=${encodeURIComponent(query)}`)
      } else {
        navigate('/catalog')
      }
    }
  }

  return (
    <header className="site-header">
      <div className="site-header-container">
        <a href="/" className="site-title">
          {title || "MERA"}
        </a>
        
        <MainNav links={links} />

        <div className="site-header-actions">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Пошук товарів..." 
              className="search-input" 
              value={currentQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          {/* Кнопка Обране */}
          <button className="icon-btn" aria-label="Улюблене" onClick={onWishlistClick} style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            {wishlistCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                backgroundColor: '#7c3aed', color: '#fff', fontSize: '10px',
                fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', lineHeight: 1
              }}>
                {wishlistCount}
              </span>
            )}
          </button>
          
          {/* Кнопка Кошик */}
          <button className="icon-btn" aria-label="Кошик" onClick={onCartClick} style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                backgroundColor: '#7c3aed', color: '#fff', fontSize: '10px',
                fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', lineHeight: 1
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Кнопка Сповіщення (Дзвіночок) */}
          <button className="icon-btn" aria-label="Сповіщення" onClick={onNotificationsClick} style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {notificationsCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                backgroundColor: '#7c3aed', color: '#fff', fontSize: '10px',
                fontWeight: 'bold', padding: '2px 5px', borderRadius: '10px', lineHeight: 1
              }}>
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Кнопка Профіль */}
          <button 
            type="button"
            className="icon-btn" 
            aria-label="Профіль" 
            onClick={onProfileClick} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>
      </div>
    </header>
  )
}