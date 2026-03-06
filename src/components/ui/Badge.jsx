import { classNames } from '../../lib/utils'

const variants = {
  default: 'bg-surface2 text-text-secondary border-border',
  accent: 'bg-accent-light text-accent border-accent/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-success/10 text-success border-success/20',
  complete: 'bg-surface2 text-text-secondary border-border',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
