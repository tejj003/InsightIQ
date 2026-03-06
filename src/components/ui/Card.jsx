import { classNames } from '../../lib/utils'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={classNames(
        'bg-surface border border-border rounded-xl p-6 transition-all duration-150',
        hover && 'hover:border-accent/40 hover:shadow-lg hover:shadow-black/20 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
