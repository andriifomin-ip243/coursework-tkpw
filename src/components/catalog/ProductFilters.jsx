export default function ProductFilters({
  availableOnly,
  onAvailableOnlyChange,
}) {
  return (
    <div className="catalog-sidebar-filters" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <label className="checkbox-field">
        <input 
          type="checkbox"
          checked={availableOnly}
          onChange={(event) => onAvailableOnlyChange(event.target.checked)}
        />
        Лише в наявності
      </label>
    </div>
  )
}