import { classNames } from '../../lib/utils'

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={classNames(
            'px-4 py-2.5 text-sm font-mono font-medium transition-all duration-150 border-b-2 -mb-px outline-none focus-visible:ring-2 focus-visible:ring-accent',
            active === tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
