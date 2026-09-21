export default function ProductStatusBadge({ status, statusLabel }) {
  const isAvailable = status === 'available'
  const badgeClass = isAvailable ? 'status-badge status-available' : 'status-badge status-preorder'
  
  return (
    <span className={badgeClass}>
      {statusLabel || (isAvailable ? 'В наявності' : 'Передзамовлення')}
    </span>
  )
}