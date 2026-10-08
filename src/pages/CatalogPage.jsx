import { Link } from 'react-router'
import PageHeading from '../components/ui/PageHeading.jsx'
import Section from '../components/ui/Section.jsx'
import CatalogSummary from '../components/catalog/CatalogSummary.jsx'
import ProductFilters from '../components/catalog/ProductFilters.jsx'
import ProductList from '../components/catalog/ProductList.jsx'
import useProductFilters from '../hooks/useProductFilters.js'

export default function CatalogPage({ items, selectedId, onSelect }) {
  const {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
    resetFilters,
  } = useProductFilters(items)

  const orderSearch = selectedId
    ? `?${new URLSearchParams({ productId: selectedId })}`
    : ''

  return (
    <>
      <PageHeading title="Каталог речей MERA" />

      <Section id="catalog" title="Доступні колекції">
        <CatalogSummary total={items.length} />
        <ProductFilters
          query={query}
          availableOnly={availableOnly}
          onQueryChange={setQuery}
          onAvailableOnlyChange={setAvailableOnly}
          onReset={resetFilters}
        />
        <p className="catalog-count-info">
          Показано речей: <strong>{visibleItems.length}</strong>
        </p>
        <ProductList
          items={visibleItems}
          selectedId={selectedId}
          onSelect={onSelect}
          emptyTitle={
            items.length === 0
              ? 'Товари ще не додано.'
              : 'За цими фільтрами нічого не знайдено.'
          }
        />
        <p>
          <Link to={`/orders/new${orderSearch}`}>
            Перейти до підготовки передзамовлення
          </Link>
        </p>
      </Section>
    </>
  )
}