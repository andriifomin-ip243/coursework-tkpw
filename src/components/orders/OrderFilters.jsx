import AppButton from '../ui/AppButton.jsx'
import FormField from '../ui/FormField.jsx'

export default function OrderFilters({
  query,
  packaging,
  sort,
  onQueryChange,
  onPackagingChange,
  onSortChange,
  onReset,
}) {
  return (
    <div className="order-filters">
      <FormField id="orders-query" label="Пошук у передзамовленнях">
        <input
          id="orders-query"
          type="search"
          placeholder="Пошук за назвою, контактом або коментарем..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </FormField>

      <FormField id="orders-packaging" label="Пакування">
        <select
          id="orders-packaging"
          value={packaging}
          onChange={(event) => onPackagingChange(event.target.value)}
        >
          <option value="all">Усі передзамовлення</option>
          <option value="gift">Лише подарункове пакування</option>
          <option value="standard">Стандартне пакування</option>
        </select>
      </FormField>

      <FormField id="orders-sort" label="Упорядкування">
        <select
          id="orders-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          <option value="product">За назвою речі</option>
          <option value="quantity-asc">Кількість: спочатку менша</option>
          <option value="quantity-desc">Кількість: спочатку більша</option>
        </select>
      </FormField>

      <div className="filter-actions">
        <AppButton variant="secondary" onClick={onReset}>
          Скинути фільтри
        </AppButton>
      </div>
    </div>
  )
}