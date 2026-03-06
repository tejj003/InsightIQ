export default function Spinner({ size = 'md', text }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }[size]

  return (
    <div className="flex items-center gap-3">
      <span
        className={`${sizeClass} border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0`}
      />
      {text && <span className="text-sm font-mono text-text-secondary animate-pulse">{text}</span>}
    </div>
  )
}
