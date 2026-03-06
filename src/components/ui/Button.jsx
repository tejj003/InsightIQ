import { classNames } from '../../lib/utils'

const variants = {
  primary: 'bg-accent text-white hover:bg-blue-500 shadow-sm',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface2 hover:text-text-primary',
  danger: 'bg-transparent text-red-400 hover:bg-red-900/20 hover:text-red-300',
  outline: 'bg-transparent border border-border text-text-primary hover:bg-surface2',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  icon,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={classNames(
        'inline-flex items-center gap-2 rounded-md font-mono font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4 flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
