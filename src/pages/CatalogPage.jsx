import { useState } from 'react'
import { useSearchParams } from 'react-router'
import ProductFilters from '../components/catalog/ProductFilters.jsx'
import ProductList from '../components/catalog/ProductList.jsx'
import useProductFilters from '../hooks/useProductFilters.js'

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

export default function CatalogPage({ items, selectedId, onSelect }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Мапа для перетворення ID з URL у назви категорій
  const categoryMap = {
    'hoodies': 'Худі',
    'tshirts': 'Футболки',
    'pants': 'Штани',
    'longsleeves': 'Лонгсліви',
    'outerwear': 'Верхній одяг',
    'accessories': 'Аксесуари'
  }

  // Зворотна мапа для оновлення URL при кліку на кнопки в каталозі
  const reverseCategoryMap = {
    'Худі': 'hoodies',
    'Футболки': 'tshirts',
    'Штани': 'pants',
    'Лонгсліви': 'longsleeves',
    'Верхній одяг': 'outerwear',
    'Аксесуари': 'accessories'
  }

  // Читаємо категорію прямо з URL у момент рендеру
  const urlCategoryParam = searchParams.get('category')
  const selectedCategory = categoryMap[urlCategoryParam] || 'Усі товари'

  const {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
  } = useProductFilters(items)

  // Фільтруємо товари за категорією та ставимо розпродані в кінець
  const filteredByCategoryItems = visibleItems
    .filter((item) => {
      if (selectedCategory === 'Усі товари') return true
      return item.category === selectedCategory
    })
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aSold = isItemSoldOut(a.item) ? 1 : 0
      const bSold = isItemSoldOut(b.item) ? 1 : 0
      if (aSold !== bSold) return aSold - bSold
      return a.index - b.index
    })
    .map((entry) => entry.item)

  // Список категорій для сайдбару в каталозі
  const categories = [
    'Усі товари', 
    'Футболки', 
    'Худі', 
    'Штани', 
    'Лонгсліви', 
    'Верхній одяг', 
    'Аксесуари'
  ]

  function handleCategoryChange(cat) {
    // Створюємо копію поточних параметрів з URL, щоб не втратити 'available' чи 'q'
    const nextParams = new URLSearchParams(searchParams)

    if (cat === 'Усі товари') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', reverseCategoryMap[cat])
    }

    setSearchParams(nextParams)
  }

  return (
    <div className="catalog-page-container" style={{ paddingBottom: '60px' }}>
      
      {/* КНОПКА ОКРЕМО НАВЕРХУ (Зафіксована зліва над панеллю) */}
      <div style={{ 
        position: 'sticky',
        top: '90px',
        zIndex: 20,
        width: 'fit-content',
        marginBottom: '16px'
      }}>
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: isSidebarOpen ? '#f4f4f6' : '#111',
            color: isSidebarOpen ? '#111' : '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          {isSidebarOpen ? 'Сховати категорії' : 'Показати категорії'}
        </button>
      </div>

      {/* Головна сітка: якщо сайдбар відкритий — є колонка 260px, якщо закритий — її немає взагалі */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isSidebarOpen ? '260px 1fr' : '1fr', 
        gap: '30px',
        alignItems: 'start',
        transition: 'grid-template-columns 0.3s ease'
      }}>
        
        {/* ЛІВА ПАНЕЛЬ КАТЕГОРІЙ (Показується тільки коли відкрита) */}
        {isSidebarOpen && (
          <aside className="catalog-sidebar" style={{ 
            position: 'sticky',
            top: '145px', // Трохи нижче зафіксованої кнопки
            alignSelf: 'start',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            zIndex: 10
          }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '0px' }}>
              <div className="sidebar-section" style={{ marginBottom: '24px' }}>
                <h3 className="sidebar-title" style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>Категорії</h3>
                <ul className="category-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(cat)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: selectedCategory === cat ? '#111' : 'transparent',
                          color: selectedCategory === cat ? '#fff' : '#374151',
                          fontWeight: selectedCategory === cat ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sidebar-section">
                <ProductFilters
                  query={query}
                  availableOnly={availableOnly}
                  onQueryChange={setQuery}
                  onAvailableOnlyChange={setAvailableOnly}
                />
              </div>
            </div>
          </aside>
        )}

        {/* ПРАВА КОЛОНКА (Сітка товарів) */}
        <main className="catalog-content">
          <ProductList
            items={filteredByCategoryItems}
            selectedId={selectedId}
            onSelect={onSelect}
            emptyTitle="За цими критеріями нічого не знайдено."
          />
        </main>
      </div>
    </div>
  )
}