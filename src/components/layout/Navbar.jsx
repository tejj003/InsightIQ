import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import {
  API_KEY_STORAGE_KEY,
  OPENAI_API_KEY_STORAGE_KEY,
  ANTHROPIC_URL_STORAGE_KEY,
  OPENAI_URL_STORAGE_KEY,
  AI_PROVIDER_KEY,
  getProvider,
} from '../../hooks/useClaude'

const PROVIDERS = [
  {
    id: 'claude',
    label: 'Claude',
    hint: 'Anthropic — claude-sonnet-4-6',
    placeholder: 'sk-ant-api03-...',
    storageKey: API_KEY_STORAGE_KEY,
    envKey: 'VITE_ANTHROPIC_API_KEY',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'console.anthropic.com',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.304 3.541 12.836 16.37h-2.092L6.696 3.54h2.113l2.987 9.08 3.014-9.08h2.494ZM6 20.46h2.262v-2.247H6V20.46Zm9.738 0H18v-2.247h-2.262v2.247Z"/>
      </svg>
    ),
  },
  {
    id: 'openai',
    label: 'OpenAI',
    hint: 'OpenAI — gpt-4o',
    placeholder: 'sk-proj-...',
    storageKey: OPENAI_API_KEY_STORAGE_KEY,
    envKey: 'VITE_OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'platform.openai.com',
    logo: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.032.067L9.77 19.9a4.5 4.5 0 0 1-6.17-1.596zm-1.15-9.45a4.462 4.462 0 0 1 2.34-1.966V12.9a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.45 8.854zm16.57 3.855-5.843-3.37 2.021-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.5 4.5 0 0 1-.676 8.123V12.9a.786.786 0 0 0-.403-.191zm2.013-3.025-.141-.085-4.78-2.762a.775.775 0 0 0-.783 0L9.485 10.21V7.878a.08.08 0 0 1 .032-.067l4.83-2.786a4.5 4.5 0 0 1 6.671 4.679zm-12.67 4.143-2.02-1.167a.08.08 0 0 1-.038-.057V7.22a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.756 6.607a.795.795 0 0 0-.393.681zm1.1-2.37 2.6-1.5 2.6 1.5v2.998l-2.6 1.5-2.6-1.5Z"/>
      </svg>
    ),
  },
]

function ApiKeyModal({ onClose }) {
  const [activeProvider, setActiveProvider] = useState(getProvider)
  const [keys, setKeys] = useState({
    claude: localStorage.getItem(API_KEY_STORAGE_KEY) || '',
    openai: localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || '',
  })
  const [urls, setUrls] = useState({
    claude: localStorage.getItem(ANTHROPIC_URL_STORAGE_KEY) || '',
    openai: localStorage.getItem(OPENAI_URL_STORAGE_KEY) || '',
  })
  const [saved, setSaved] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [activeProvider])

  function handleSave(e) {
    e.preventDefault()
    // Save provider choice
    localStorage.setItem(AI_PROVIDER_KEY, activeProvider)
    // Save keys
    const claudeKey = keys.claude.trim()
    const openaiKey = keys.openai.trim()
    claudeKey
      ? localStorage.setItem(API_KEY_STORAGE_KEY, claudeKey)
      : localStorage.removeItem(API_KEY_STORAGE_KEY)
    openaiKey
      ? localStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, openaiKey)
      : localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY)
    // Save custom URLs
    const claudeUrl = urls.claude.trim()
    const openaiUrl = urls.openai.trim()
    claudeUrl
      ? localStorage.setItem(ANTHROPIC_URL_STORAGE_KEY, claudeUrl)
      : localStorage.removeItem(ANTHROPIC_URL_STORAGE_KEY)
    openaiUrl
      ? localStorage.setItem(OPENAI_URL_STORAGE_KEY, openaiUrl)
      : localStorage.removeItem(OPENAI_URL_STORAGE_KEY)

    setSaved(true)
    setTimeout(onClose, 700)
  }

  function handleClearKey(providerId) {
    setKeys((prev) => ({ ...prev, [providerId]: '' }))
    if (providerId === 'claude') localStorage.removeItem(API_KEY_STORAGE_KEY)
    else localStorage.removeItem(OPENAI_API_KEY_STORAGE_KEY)
  }

  const current = PROVIDERS.find((p) => p.id === activeProvider)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl shadow-black/60 animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            <div>
              <p className="text-sm font-mono font-semibold text-text-primary">AI Provider Settings</p>
              <p className="text-xs font-mono text-text-secondary">Choose your provider and enter your API key</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded-lg transition-all"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
            </button>
          </div>

          {/* Provider tabs */}
          <div className="px-6 pt-4">
            <div className="flex gap-2 p-1 bg-surface2 rounded-lg">
              {PROVIDERS.map((p) => {
                const hasKey = !!keys[p.id]
                return (
                  <button
                    key={p.id}
                    onClick={() => { setActiveProvider(p.id); setSaved(false) }}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-mono font-medium transition-all duration-150 ${
                      activeProvider === p.id
                        ? 'bg-surface text-text-primary shadow-sm border border-border'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {p.logo}
                    {p.label}
                    {hasKey && (
                      <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active provider - set as default toggle */}
          <div className="px-6 pt-3">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => setActiveProvider(activeProvider)}
                className={`w-8 h-4 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
                  getProvider() === activeProvider ? 'bg-accent' : 'bg-surface2 border border-border'
                }`}
              >
                <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
                  getProvider() === activeProvider ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </div>
              <span className="text-xs font-mono text-text-secondary group-hover:text-text-primary transition-colors">
                Use <span className="text-text-primary font-semibold">{current?.label}</span> as active provider
                {getProvider() === activeProvider && (
                  <span className="ml-1.5 text-success">(currently active)</span>
                )}
              </span>
            </label>
          </div>

          {/* Key + URL inputs */}
          <form onSubmit={handleSave} className="px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
                {current?.label} API Key
              </label>
              <p className="text-xs font-mono text-text-secondary -mt-1">{current?.hint}</p>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="password"
                  value={keys[activeProvider]}
                  onChange={(e) => { setKeys((prev) => ({ ...prev, [activeProvider]: e.target.value })); setSaved(false) }}
                  placeholder={current?.placeholder}
                  className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary placeholder-text-secondary/50 outline-none transition-all duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30 pr-10"
                />
                {keys[activeProvider] && (
                  <button
                    type="button"
                    onClick={() => handleClearKey(activeProvider)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-red-400 transition-colors"
                    title="Clear key"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs font-mono text-text-secondary">
                Stored locally in your browser. Never sent anywhere except {current?.label}.
              </p>
            </div>

            {/* Target URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
                Target URL <span className="normal-case text-text-secondary/60 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={urls[activeProvider]}
                onChange={(e) => { setUrls((prev) => ({ ...prev, [activeProvider]: e.target.value })); setSaved(false) }}
                placeholder={activeProvider === 'openai'
                  ? 'https://api.openai.com/v1/chat/completions'
                  : 'https://api.anthropic.com/v1/messages'}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary placeholder-text-secondary/30 outline-none transition-all duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
              <p className="text-xs font-mono text-text-secondary">
                Override the default endpoint — use for proxies or custom deployments. Leave blank to use the default.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="flex-1 justify-center" disabled={saved}>
                {saved ? (
                  <>
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-success">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
                    </svg>
                    Saved
                  </>
                ) : 'Save Settings'}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            </div>
          </form>

          {/* Docs link */}
          <div className="px-6 pb-5">
            <a
              href={current?.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
            >
              Get your API key from {current?.docsLabel}
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M3.75 2h3.5a.75.75 0 010 1.5h-3.5a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-3.5a.75.75 0 011.5 0v3.5A1.75 1.75 0 0112.25 14h-8.5A1.75 1.75 0 012 12.25v-8.5C2 2.784 2.784 2 3.75 2zm6.854-1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default function Navbar() {
  const [showModal, setShowModal] = useState(false)
  const [status, setStatus] = useState(() => getNavStatus())

  function getNavStatus() {
    const provider = getProvider()
    const claudeKey = !!(localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_ANTHROPIC_API_KEY)
    const openaiKey = !!(localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY)
    const hasActiveKey = provider === 'openai' ? openaiKey : claudeKey
    return { provider, hasActiveKey }
  }

  function handleClose() {
    setShowModal(false)
    setStatus(getNavStatus())
    window.dispatchEvent(new Event('insightiq:keychange'))
  }

  return (
    <>
      <header className="h-14 border-b border-border bg-bg/80 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="text-lg font-mono font-bold text-text-primary tracking-tight hover:text-accent transition-colors">
            Insight<span className="text-accent">IQ</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Provider + key status button */}
            <button
              onClick={() => setShowModal(true)}
              title={status.hasActiveKey ? `${status.provider === 'openai' ? 'OpenAI' : 'Claude'} key configured` : 'Add API key'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-150 border ${
                status.hasActiveKey
                  ? 'text-success border-success/20 bg-success/5 hover:bg-success/10'
                  : 'text-warning border-warning/20 bg-warning/5 hover:bg-warning/10'
              }`}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M6.5 5.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm3.203 1.362a5.5 5.5 0 1 0-1.341 1.341l3.088 3.09a.75.75 0 1 0 1.06-1.061l-3.087-3.09a5.477 5.477 0 0 0 .28-.28z" clipRule="evenodd"/>
              </svg>
              {status.hasActiveKey
                ? `${status.provider === 'openai' ? 'OpenAI' : 'Claude'} ✓`
                : 'Add API Key'}
            </button>

            <Link to="/projects/new">
              <Button size="sm">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                </svg>
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {showModal && <ApiKeyModal onClose={handleClose} />}
    </>
  )
}
