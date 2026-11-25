export default function ProductStatusBadge({ status, statusLabel }) {
  const raw = `${status || ''} ${statusLabel || ''}`.toLowerCase()

  const isSoldOut =
    raw.includes('sold') ||
    raw.includes('out') ||
    raw.includes('розпродано')

  const isAvailable =
    !isSoldOut &&
    (status === 'available' ||
      raw.includes('in_stock') ||
      raw.includes('instock') ||
      raw.includes('наявн'))

  const text = statusLabel || (isSoldOut ? 'Розпродано' : isAvailable ? 'В наявності' : 'Передзамовлення')

  let badgeStyle = {
    background: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a'
  }

  if (isSoldOut) {
    badgeStyle = {
      background: '#f3f4f6',
      color: '#6b7280',
      border: '1px solid #e5e7eb'
    }
  } else if (isAvailable) {
    badgeStyle = {
      background: '#dcfce7',
      color: '#15803d',
      border: '1px solid #86efac'
    }
  }

  return (
    <span
      className={`status-badge ${isSoldOut ? 'status-sold-out' : isAvailable ? 'status-available' : 'status-preorder'}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        lineHeight: 1.2,
        ...badgeStyle
      }}
    >
      {text}
    </span>
  )
}