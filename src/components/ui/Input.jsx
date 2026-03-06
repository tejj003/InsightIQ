import { classNames } from '../../lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={classNames(
          'w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary placeholder-text-secondary/50 outline-none transition-all duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-mono text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs font-mono text-text-secondary">{hint}</p>}
    </div>
  )
})

export default Input

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={classNames(
          'w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary placeholder-text-secondary/50 outline-none transition-all duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30 resize-y',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-mono text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs font-mono text-text-secondary">{hint}</p>}
    </div>
  )
})
