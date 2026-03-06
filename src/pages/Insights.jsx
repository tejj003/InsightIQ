import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildInsightsPrompt } from '../lib/prompts'
import { formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { Tabs } from '../components/ui/Tabs'

const THEME_BORDER_COLORS = [
  'border-l-blue-500',
  'border-l-accent',
  'border-l-success',
  'border-l-warning',
  'border-l-purple-500',
]

function parseInsights(text) {
  const result = { themes: [], insights: [], verbatims: [], recommendations: [] }

  const themeBlock = text.match(/##\s*KEY THEMES([\s\S]*?)(?=##\s*KEY INSIGHTS|$)/i)?.[1] || ''
  const insightsBlock = text.match(/##\s*KEY INSIGHTS([\s\S]*?)(?=##\s*STANDOUT VERBATIMS|$)/i)?.[1] || ''
  const verbatimsBlock = text.match(/##\s*STANDOUT VERBATIMS([\s\S]*?)(?=##\s*RECOMMENDATIONS|$)/i)?.[1] || ''
  const recsBlock = text.match(/##\s*RECOMMENDATIONS([\s\S]*?)$/i)?.[1] || ''

  // Parse themes: **Title**\nDescription
  const themeMatches = [...themeBlock.matchAll(/\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=\*\*|$)/g)]
  for (const m of themeMatches) {
    const title = m[1].trim()
    const description = m[2].trim()
    if (title && description) result.themes.push({ title, description })
  }

  // Parse insights: lines starting with "- "
  result.insights = (insightsBlock.match(/^[-•]\s*.+/gm) || []).map((l) =>
    l.replace(/^[-•]\s*/, '').trim()
  )

  // Parse verbatims: "quote" — [Label] or "quote" - Label
  const verbatimMatches = [...verbatimsBlock.matchAll(/"([^"]+)"\s*[—–-]+\s*\[?([^\]\n]+)\]?/g)]
  for (const m of verbatimMatches) {
    result.verbatims.push({ quote: m[1].trim(), participant: m[2].trim() })
  }

  // Parse recommendations: numbered list
  result.recommendations = (recsBlock.match(/^\d+\.\s*.+/gm) || []).map((l) =>
    l.replace(/^\d+\.\s*/, '').trim()
  )

  return result
}

const TABS = [
  { id: 'themes', label: 'Themes' },
  { id: 'insights', label: 'Insights' },
  { id: 'verbatims', label: 'Verbatims' },
  { id: 'recommendations', label: 'Recommendations' },
]

export default function Insights() {
  const { project, update } = useOutletContext()
  const { stream, loading, error } = useClaude()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('themes')
  const [streamText, setStreamText] = useState('')

  const transcripts = project.transcripts || []
  const insights = project.insights

  async function handleGenerate() {
    if (transcripts.length === 0) return
    setStreamText('')
    setActiveTab('themes')

    const prompt = buildInsightsPrompt(transcripts)
    await stream({
      messages: [{ role: 'user', content: prompt }],
      onChunk: (_, full) => setStreamText(full),
      onDone: (full) => {
        const parsed = parseInsights(full)
        update({
          insights: { ...parsed, generatedAt: new Date().toISOString() },
        })
        setStreamText('')
        toast.success('Insights generated.')
      },
    })
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  }

  // No transcripts nudge
  if (transcripts.length === 0) {
    return (
      <div className="p-8 max-w-3xl animate-fade-in">
        <h1 className="text-xl font-mono font-bold text-text-primary mb-1">Research Insights</h1>
        <p className="text-sm font-mono text-text-secondary mb-8">
          AI-analyzed themes, insights, verbatims, and recommendations.
        </p>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <path d="M32 8v8M32 48v8M8 32h8M48 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2"/>
            <path d="M32 26v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">No transcripts yet</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">
            Upload at least one transcript to generate insights.
          </p>
          <Link to={`/projects/${project.id}/transcripts`}>
            <Button variant="outline" size="sm">Go to Transcripts</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-mono font-bold text-text-primary mb-1">Research Insights</h1>
          <p className="text-sm font-mono text-text-secondary">
            AI-analyzed themes, insights, verbatims, and recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {insights?.generatedAt && (
            <span className="text-xs font-mono text-text-secondary hidden sm:block">
              Generated {formatDate(insights.generatedAt)}
            </span>
          )}
          <Button
            variant={insights ? 'outline' : 'primary'}
            size="sm"
            onClick={handleGenerate}
            loading={loading}
            disabled={loading}
          >
            {!loading && (
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.454 1.75 1.486 3.02l-5.49 7.327a1.516 1.516 0 0 1-2.438-1.713L7.583 10.5H5.461c-1.57 0-2.454-1.75-1.486-3.02Z"/>
              </svg>
            )}
            {insights ? 'Regenerate' : 'Generate Insights'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-sm font-mono text-red-400">
          {error}
        </div>
      )}

      {/* Streaming state */}
      {loading && (
        <div className="mt-8 flex flex-col gap-4">
          <Spinner text="Analyzing transcripts…" />
          {streamText && (
            <div className="p-4 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {streamText}
            </div>
          )}
        </div>
      )}

      {/* No insights yet */}
      {!loading && !insights && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <path d="M32 8v8M32 48v8M8 32h8M48 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2"/>
            <path d="M32 26v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">No insights yet</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">
            You have {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}. Click "Generate Insights" to analyze them.
          </p>
        </div>
      )}

      {/* Insights tabs */}
      {!loading && insights && (
        <div className="mt-6">
          <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

          <div className="mt-6">
            {/* Themes tab */}
            {activeTab === 'themes' && (
              <div className="flex flex-col gap-4">
                {insights.themes?.length === 0 && (
                  <p className="text-sm font-mono text-text-secondary">No themes parsed.</p>
                )}
                {insights.themes?.map((theme, i) => (
                  <div
                    key={i}
                    className={`border-l-4 ${THEME_BORDER_COLORS[i % THEME_BORDER_COLORS.length]} pl-4 py-1 animate-fade-in`}
                  >
                    <p className="text-sm font-mono font-semibold text-text-primary mb-1">{theme.title}</p>
                    <p className="text-sm font-mono text-text-secondary leading-relaxed">{theme.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Insights tab */}
            {activeTab === 'insights' && (
              <div className="flex flex-col gap-2">
                {insights.insights?.length === 0 && (
                  <p className="text-sm font-mono text-text-secondary">No insights parsed.</p>
                )}
                {insights.insights?.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface2 border border-border group animate-fade-in"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <p className="flex-1 text-sm font-mono text-text-primary leading-relaxed">{insight}</p>
                    <button
                      onClick={() => handleCopy(insight)}
                      className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title="Copy"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
                        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Verbatims tab */}
            {activeTab === 'verbatims' && (
              <div className="flex flex-col gap-4">
                {insights.verbatims?.length === 0 && (
                  <p className="text-sm font-mono text-text-secondary">No verbatims parsed.</p>
                )}
                {insights.verbatims?.map((v, i) => (
                  <div
                    key={i}
                    className="relative p-4 rounded-lg bg-surface border border-border group animate-fade-in"
                  >
                    <span className="absolute top-3 left-4 text-3xl font-serif text-accent/20 leading-none select-none">"</span>
                    <p className="text-sm font-mono text-text-primary italic leading-relaxed pl-5 pr-8">
                      {v.quote}
                    </p>
                    <p className="text-xs font-mono text-text-secondary mt-2 pl-5">— {v.participant}</p>
                    <button
                      onClick={() => handleCopy(`"${v.quote}" — ${v.participant}`)}
                      className="absolute top-3 right-3 p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="Copy"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
                        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations tab */}
            {activeTab === 'recommendations' && (
              <div className="flex flex-col gap-3">
                {insights.recommendations?.length === 0 && (
                  <p className="text-sm font-mono text-text-secondary">No recommendations parsed.</p>
                )}
                {insights.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 rounded-lg bg-surface border border-border animate-fade-in"
                  >
                    <span className="w-7 h-7 rounded-full bg-accent-light text-accent text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm font-mono text-text-primary leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
