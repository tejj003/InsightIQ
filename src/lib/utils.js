export function generateId() {
  return crypto.randomUUID()
}

export function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function charCount(text) {
  return text.length
}

export function truncate(text, maxLength = 120) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
