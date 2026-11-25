export default function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  style,
  className = '',
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
}) {
  return (
    <button
      type={type}
      className={`app-button app-button-${variant} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      style={style}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {children}
    </button>
  )
}