import Section from '../components/ui/Section.jsx'
import CatalogSummary from '../components/catalog/CatalogSummary.jsx'
import ProductFilters from '../components/catalog/ProductFilters.jsx'
import ProductList from '../components/catalog/ProductList.jsx'
import useProductFilters from '../hooks/useProductFilters.js'

export default function HomePage({ items, selectedId, onSelect }) {
  const {
    query,
    setQuery,
    availableOnly,
    setAvailableOnly,
    visibleItems,
    resetFilters,
  } = useProductFilters(items)

  return (
    <>
      <Section id="about" title="Про бренд MERA">
        <p>
          MERA — це авторський streetwear-одяг обмеженого тиражу (дропи футболок та худі)
          з унікальною естетикою та якісним шовкотрафаретним друком.
        </p>
        <p>Виберіть річ у каталозі нижче для підготовки чернетки передзамовлення.</p>
      </Section>

      <Section id="catalog" title="Каталог дропів">
        <CatalogSummary total={items.length} />
        <ProductFilters
          query={query}
          availableOnly={availableOnly}
          onQueryChange={setQuery}
          onAvailableOnlyChange={setAvailableOnly}
          onReset={resetFilters}
        />
        <p className="catalog-count-info">Показано речей: <strong>{visibleItems.length}</strong></p>
        <ProductList
          items={visibleItems}
          selectedId={selectedId}
          onSelect={onSelect}
          emptyTitle={
            items.length === 0
              ? 'Дропи ще не додано.'
              : 'За цими фільтрами нічого не знайдено.'
          }
        />
        <p><a href="#order">Перейти до чернетки передзамовлення</a></p>
      </Section>
    </>
  )
}