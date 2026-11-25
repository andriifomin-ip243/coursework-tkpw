import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { apparelItems } from '../data/items.js'
import ProductCard from '../components/catalog/ProductCard.jsx'

function isItemSoldOut(item) {
  const statusStr = String(item?.status || '').toLowerCase()
  const labelStr = String(item?.statusLabel || '').toLowerCase()
  return (
    statusStr.includes('sold') ||
    statusStr.includes('out') ||
    statusStr.includes('розпродано') ||
    labelStr.includes('розпродано') ||
    item?.inStock === false
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null)

  const popularItems = [
    ...apparelItems.filter((item) => !isItemSoldOut(item)),
    ...apparelItems.filter((item) => isItemSoldOut(item))
  ].slice(0, 4)

  const categoriesList = [
    {
      id: 'hoodies',
      title: 'Худі & Світшоти',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3c0 1.7 1.3 3 3 3s3-1.3 3-3"></path>
          <path d="M18 4l3 3-2 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9L3 7l3-3h3"></path>
          <line x1="11" y1="6" x2="11" y2="11"></line>
          <line x1="13" y1="6" x2="13" y2="11"></line>
        </svg>
      )
    },
    {
      id: 'tshirts',
      title: 'Футболки',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4l4 3-2 4v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9L4 7l4-3"></path>
          <path d="M9 4a3 3 0 0 0 6 0"></path>
        </svg>
      )
    },
    {
      id: 'pants',
      title: 'Штани & Джогери',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3h10l1.5 18h-4.5L12 10l-2 11H5.5L7 3z"></path>
        </svg>
      )
    },
    {
      id: 'longsleeves',
      title: 'Лонгсліви',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 4a3 3 0 0 0 6 0"></path>
          <path d="M15 4h3l4 13-3.5 1-2.5-8v10H8V10l-2.5 8L2 17l4-13h3"></path>
        </svg>
      )
    },
    {
      id: 'outerwear',
      title: 'Верхній одяг',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l5 4-2 4v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9L4 7l5-4z"></path>
          <line x1="12" y1="3" x2="12" y2="22"></line>
          <path d="M9 3l3 4 3-4"></path>
        </svg>
      )
    },
    {
      id: 'accessories',
      title: 'Аксесуари & Шкарпетки',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12l1 14H5L6 7z"></path>
          <path d="M9 7V5a3 3 0 0 1 6 0v2"></path>
        </svg>
      )
    }
  ]

  function handleCategoryClick(categoryId) {
    navigate(`/catalog?category=${categoryId}`)
  }

  return (
    <div className="home-page" style={{ overflowX: 'hidden' }}>
      {/* Головний банер на всю ширину впритул до шапки */}
      <section
        className="hero-section-full hero-full-width"
        style={{
          backgroundImage: 'url(/images/hero-banner.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '460px',
          display: 'flex',
          alignItems: 'center',
          padding: '40px 0',
          marginBottom: '30px',
          marginTop: '-40px'
        }}
      >
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '0 40px'
        }}>
          <div className="hero-content" style={{ maxWidth: '540px' }}>
            <h2 className="hero-title" style={{ fontSize: '44px', fontWeight: 900, lineHeight: '1.05', color: '#111', marginBottom: '14px' }}>
              Просто одяг
            </h2>
            <p className="hero-desc" style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6, marginBottom: '24px' }}>
              Футболки, худі та аксесуари з дизайнами, які мають свій настрій
            </p>
            <div className="hero-actions">
              <Link
                to="/catalog"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#111',
                  color: '#fff',
                  padding: '12px 26px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                  transition: 'transform 0.2s'
                }}
              >
                Перейти до каталогу
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Секція популярних товарів */}
      <section className="featured-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: 0 }}>Популярні речі MERA</h2>
        </div>
        <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {popularItems.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Секція: Швидкі розділи / категорії магазину */}
      <section className="categories-section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px 20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: 0 }}>Оглянути за категоріями</h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {categoriesList.map((cat) => {
            const isHovered = hoveredCategoryId === cat.id

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                onMouseEnter={() => setHoveredCategoryId(cat.id)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                style={{
                  backgroundColor: isHovered ? '#faf8ff' : '#f4f4f6',
                  border: isHovered ? '1px solid #ddd6fe' : '1px solid #eaeaea',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '124px',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s, background-color 0.2s',
                  boxShadow: isHovered ? '0 10px 22px rgba(124, 58, 237, 0.08)' : '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                  <h3 style={{ fontSize: '21px', fontWeight: 800, color: '#111', margin: 0 }}>
                    {cat.title}
                  </h3>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    background: isHovered ? '#7c3aed' : '#fff',
                    borderRadius: '11px',
                    color: isHovered ? '#fff' : '#111',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    {cat.icon}
                  </span>
                </div>

                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '14px'
                }}>
                  Переглянути
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}