import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildInsightsPrompt, INSIGHT_FRAMEWORKS } from '../lib/prompts'
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

const CLUSTER_COLORS = [
  { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500', chip: 'bg-blue-500/10 border-blue-500/20' },
  { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500', chip: 'bg-purple-500/10 border-purple-500/20' },
  { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500', chip: 'bg-green-500/10 border-green-500/20' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500', chip: 'bg-orange-500/10 border-orange-500/20' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', dot: 'bg-pink-500', chip: 'bg-pink-500/10 border-pink-500/20' },
]

function parseInsights(text) {
  const result = { themes: [], insights: [], verbatims: [], recommendations: [], hmw: [] }

  const themeBlock = text.match(/##\s*KEY THEMES([\s\S]*?)(?=##\s*KEY INSIGHTS|$)/i)?.[1] || ''
  const insightsBlock = text.match(/##\s*KEY INSIGHTS([\s\S]*?)(?=##\s*STANDOUT VERBATIMS|$)/i)?.[1] || ''
  const verbatimsBlock = text.match(/##\s*STANDOUT VERBATIMS([\s\S]*?)(?=##\s*RECOMMENDATIONS|$)/i)?.[1] || ''
  const recsBlock = text.match(/##\s*RECOMMENDATIONS([\s\S]*?)(?=##\s*HOW MIGHT WE|$)/i)?.[1] || ''
  const hmwBlock = text.match(/##\s*HOW MIGHT WE([\s\S]*?)$/i)?.[1] || ''

  const themeMatches = [...themeBlock.matchAll(/\*\*(.+?)\*\*\s*\n([\s\S]*?)(?=\*\*|$)/g)]
  for (const m of themeMatches) {
    const title = m[1].trim()
    const description = m[2].trim()
    if (title && description) result.themes.push({ title, description })
  }

  result.insights = (insightsBlock.match(/^[-•]\s*.+/gm) || []).map((l) =>
    l.replace(/^[-•]\s*/, '').trim()
  )

  const verbatimMatches = [...verbatimsBlock.matchAll(/"([^"]+)"\s*[—–-]+\s*\[?([^\]\n]+)\]?/g)]
  for (const m of verbatimMatches) {
    result.verbatims.push({ quote: m[1].trim(), participant: m[2].trim() })
  }

  result.recommendations = (recsBlock.match(/^\d+\.\s*.+/gm) || []).map((l) =>
    l.replace(/^\d+\.\s*/, '').trim()
  )

  const hmwMatches = [...hmwBlock.matchAll(/\*\*HMW:\s*([^*]+)\*\*\s*\nTheme:\s*(.+)\nOpportunity:\s*([\s\S]*?)(?=\*\*HMW:|$)/g)]
  for (const m of hmwMatches) {
    result.hmw.push({
      statement: m[1].trim(),
      theme: m[2].trim(),
      opportunity: m[3].trim(),
    })
  }

  return result
}

function parseMatrixRec(rec) {
  const m = rec.match(/\[(High|Low)\s*Impact\s*\/\s*(High|Low)\s*Effort\]/i)
  if (m) {
    return {
      text: rec.replace(/\[.*?\]/, '').replace(/^[-–—]\s*/, '').trim(),
      impact: m[1].toLowerCase(),
      effort: m[2].toLowerCase(),
    }
  }
  return { text: rec, impact: 'high', effort: 'low' }
}

function parseILikeWish(insights) {
  const likes = [], wishes = [], whatifs = []
  for (const ins of insights) {
    if (/^i like[:\s]/i.test(ins)) likes.push(ins.replace(/^i like[:\s]*/i, ''))
    else if (/^i wish[:\s]/i.test(ins)) wishes.push(ins.replace(/^i wish[:\s]*/i, ''))
    else if (/^what if[:\s]/i.test(ins)) whatifs.push(ins.replace(/^what if[:\s]*/i, ''))
    else likes.push(ins)
  }
  return { likes, wishes, whatifs }
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
    <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
  </svg>
)

// ─── Standard View (tabs) ──────────────────────────────────────────────────────
const TABS = [
  { id: 'themes', label: 'Themes' },
  { id: 'insights', label: 'Insights' },
  { id: 'verbatims', label: 'Verbatims' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'hmw', label: 'How Might We' },
]

function StandardView({ insights, handleCopy }) {
  const [activeTab, setActiveTab] = useState('themes')
  const [expandedRec, setExpandedRec] = useState(null)

  return (
    <div>
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      <div className="mt-6">
        {activeTab === 'themes' && (
          <div className="flex flex-col gap-4">
            {insights.themes?.length === 0 && <p className="text-sm font-mono text-text-secondary">No themes parsed.</p>}
            {insights.themes?.map((theme, i) => (
              <div key={i} className={`border-l-4 ${THEME_BORDER_COLORS[i % THEME_BORDER_COLORS.length]} pl-4 py-1 animate-fade-in`}>
                <p className="text-sm font-mono font-semibold text-text-primary mb-1">{theme.title}</p>
                <p className="text-sm font-mono text-text-secondary leading-relaxed">{theme.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="flex flex-col gap-2">
            {insights.insights?.length === 0 && <p className="text-sm font-mono text-text-secondary">No insights parsed.</p>}
            {insights.insights?.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface2 border border-border group animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="flex-1 text-sm font-mono text-text-primary leading-relaxed">{insight}</p>
                <button onClick={() => handleCopy(insight)} className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Copy">
                  <CopyIcon />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'verbatims' && (
          <div className="flex flex-col gap-4">
            {insights.verbatims?.length === 0 && <p className="text-sm font-mono text-text-secondary">No verbatims parsed.</p>}
            {insights.verbatims?.map((v, i) => (
              <div key={i} className="relative rounded-xl bg-surface border border-border group animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-surface2/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-xs font-mono font-bold text-accent flex-shrink-0">
                      {v.participant?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-text-primary">{v.participant}</span>
                  </div>
                  <button onClick={() => handleCopy(`"${v.quote}" — ${v.participant}`)} className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded opacity-0 group-hover:opacity-100 transition-all" title="Copy">
                    <CopyIcon />
                  </button>
                </div>
                <div className="px-5 py-4">
                  <span className="text-4xl font-serif text-accent/20 leading-none select-none float-left mr-1 mt-1">"</span>
                  <p className="text-sm font-mono text-text-primary italic leading-relaxed">{v.quote}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="flex flex-col gap-3">
            {insights.recommendations?.length === 0 && <p className="text-sm font-mono text-text-secondary">No recommendations parsed.</p>}
            {insights.recommendations?.map((rec, i) => {
              const isExpanded = expandedRec === i
              return (
                <div key={i} className="rounded-xl border border-border bg-surface overflow-hidden animate-fade-in">
                  <button onClick={() => setExpandedRec(isExpanded ? null : i)} className="w-full flex items-center gap-4 px-4 py-4 text-left group transition-colors hover:bg-surface2">
                    <span className="w-7 h-7 rounded-full bg-accent-light text-accent text-xs font-mono font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 text-sm font-mono font-semibold text-text-primary leading-relaxed">→ {rec}</span>
                    <svg viewBox="0 0 16 16" fill="currentColor" className={`w-4 h-4 text-text-secondary flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      <path d="M4.427 6.427a.75.75 0 011.06 0L8 8.94l2.513-2.513a.75.75 0 111.06 1.06L8.53 10.53a.75.75 0 01-1.06 0L4.427 7.487a.75.75 0 010-1.06z"/>
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border/60 bg-accent-light/20 px-5 py-4 flex flex-col gap-3 animate-fade-in">
                      <p className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">What to do</p>
                      <p className="text-sm font-mono text-text-primary leading-relaxed">{rec}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <button onClick={() => handleCopy(rec)} className="flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors">
                          <CopyIcon /> Copy direction
                        </button>
                        <span className="text-border">·</span>
                        <span className="text-xs font-mono text-text-secondary">Direction {i + 1} of {insights.recommendations.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'hmw' && (
          <div className="flex flex-col gap-4">
            {(!insights.hmw || insights.hmw.length === 0) && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <p className="text-sm font-mono text-text-secondary">No HMW statements parsed.</p>
                <p className="text-xs font-mono text-text-secondary/60 max-w-xs">Try regenerating with the "How Might We" framework for richer opportunity statements.</p>
              </div>
            )}
            {insights.hmw?.map((h, i) => (
              <div key={i} className="rounded-xl border border-accent/20 bg-accent-light/10 overflow-hidden animate-fade-in">
                <div className="px-5 pt-4 pb-3">
                  <p className="text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-2">Opportunity {i + 1}</p>
                  <p className="text-base font-mono font-semibold text-text-primary leading-snug mb-3">
                    How might we {h.statement.replace(/^how might we\s*/i, '')}
                  </p>
                  {h.opportunity && <p className="text-sm font-mono text-text-secondary leading-relaxed">{h.opportunity}</p>}
                </div>
                {h.theme && (
                  <div className="px-5 py-2.5 border-t border-accent/10 bg-accent-light/20 flex items-center gap-2">
                    <span className="text-xs font-mono text-accent/60">From theme:</span>
                    <span className="text-xs font-mono text-accent font-medium">{h.theme}</span>
                    <button onClick={() => handleCopy(`How might we ${h.statement.replace(/^how might we\s*/i, '')}`)} className="ml-auto p-1 text-accent/40 hover:text-accent transition-colors" title="Copy">
                      <CopyIcon />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Affinity Map View ─────────────────────────────────────────────────────────
function AffinityView({ insights, handleCopy }) {
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <p className="text-xs font-mono text-text-secondary">Findings clustered by emotional and functional affinity — simulating a sticky-note workshop.</p>
      <div className="grid grid-cols-2 gap-4">
        {insights.themes?.map((theme, i) => {
          const c = CLUSTER_COLORS[i % CLUSTER_COLORS.length]
          const themeInsights = insights.insights?.filter((_, idx) => idx % (insights.themes?.length || 1) === i) || []
          const themeVerbatim = insights.verbatims?.[i]
          return (
            <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col gap-3 animate-fade-in`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${c.dot} flex-shrink-0`} />
                <p className={`text-sm font-mono font-bold ${c.text}`}>{theme.title}</p>
              </div>
              <p className="text-xs font-mono text-text-secondary leading-relaxed">{theme.description}</p>
              {themeInsights.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                  {themeInsights.map((ins, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <span className={`w-1 h-1 rounded-full ${c.dot} mt-1.5 flex-shrink-0 opacity-70`} />
                      <p className="text-xs font-mono text-text-primary leading-relaxed">{ins}</p>
                    </div>
                  ))}
                </div>
              )}
              {themeVerbatim && (
                <div className="mt-auto pt-2 border-t border-white/5">
                  <p className={`text-xs font-mono ${c.text} opacity-60 italic`}>"{themeVerbatim.quote}"</p>
                  <p className={`text-xs font-mono ${c.text} mt-1`}>— {themeVerbatim.participant}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {insights.verbatims?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">All Standout Verbatims</p>
          <div className="flex flex-wrap gap-3">
            {insights.verbatims.map((v, i) => (
              <div key={i} className="rounded-lg bg-surface2 border border-border px-3 py-2 max-w-xs group relative">
                <p className="text-xs font-mono text-text-primary italic">"{v.quote}"</p>
                <p className="text-xs font-mono text-text-secondary mt-1">— {v.participant}</p>
                <button onClick={() => handleCopy(`"${v.quote}" — ${v.participant}`)} className="absolute top-2 right-2 p-1 text-text-secondary/40 hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all" title="Copy">
                  <CopyIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 2×2 Priority Matrix View ──────────────────────────────────────────────────
function MatrixView({ insights, handleCopy }) {
  const recs = (insights.recommendations || []).map(parseMatrixRec)
  const quadrants = [
    { key: 'quickwin', label: 'Quick Wins', sub: 'High Impact · Low Effort', color: 'border-green-500/40 bg-green-500/5', labelColor: 'text-green-400', dotColor: 'bg-green-500', recs: [] },
    { key: 'strategic', label: 'Strategic Bets', sub: 'High Impact · High Effort', color: 'border-blue-500/40 bg-blue-500/5', labelColor: 'text-blue-400', dotColor: 'bg-blue-500', recs: [] },
    { key: 'optional', label: 'Low Priority', sub: 'Low Impact · Low Effort', color: 'border-border bg-surface2/30', labelColor: 'text-text-secondary', dotColor: 'bg-text-secondary', recs: [] },
    { key: 'avoid', label: 'Avoid / Deprioritize', sub: 'Low Impact · High Effort', color: 'border-red-500/40 bg-red-500/5', labelColor: 'text-red-400', dotColor: 'bg-red-500', recs: [] },
  ]
  for (const rec of recs) {
    if (rec.impact === 'high' && rec.effort === 'low') quadrants[0].recs.push(rec.text)
    else if (rec.impact === 'high' && rec.effort === 'high') quadrants[1].recs.push(rec.text)
    else if (rec.impact === 'low' && rec.effort === 'low') quadrants[2].recs.push(rec.text)
    else quadrants[3].recs.push(rec.text)
  }
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-text-secondary">Recommendations prioritized by impact vs effort — forces hard tradeoffs.</p>
      </div>
      {/* Axis labels */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between px-1">
          <span className="text-xs font-mono text-text-secondary/50">↑ High Impact</span>
          <span className="text-xs font-mono text-text-secondary/50">Low Effort → High Effort</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quadrants.map((q) => (
            <div key={q.key} className={`rounded-xl border ${q.color} p-4 flex flex-col gap-2 min-h-36`}>
              <div className="mb-1">
                <p className={`text-xs font-mono font-bold ${q.labelColor}`}>{q.label}</p>
                <p className="text-xs font-mono text-text-secondary/50">{q.sub}</p>
              </div>
              {q.recs.length === 0 && <p className="text-xs font-mono text-text-secondary/30 italic mt-auto">No items</p>}
              {q.recs.map((r, j) => (
                <div key={j} className="flex items-start gap-2 group">
                  <span className={`w-1.5 h-1.5 rounded-full ${q.dotColor} mt-1.5 flex-shrink-0 opacity-60`} />
                  <p className="text-xs font-mono text-text-primary leading-relaxed flex-1">{r}</p>
                  <button onClick={() => handleCopy(r)} className="p-1 text-text-secondary/30 hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Copy">
                    <CopyIcon />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1">
          <span className="text-xs font-mono text-text-secondary/50">↓ Low Impact</span>
        </div>
      </div>
      {insights.themes?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">Underlying Themes</p>
          <div className="flex flex-col gap-2">
            {insights.themes.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface2 border border-border">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <div>
                  <p className="text-xs font-mono font-semibold text-text-primary">{t.title}</p>
                  <p className="text-xs font-mono text-text-secondary leading-relaxed mt-0.5">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── How Might We View ─────────────────────────────────────────────────────────
function HMWView({ insights, handleCopy }) {
  const items = insights.hmw?.length > 0
    ? insights.hmw
    : insights.themes?.map(t => ({ statement: t.title, theme: t.description, opportunity: '' })) || []
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <p className="text-xs font-mono text-text-secondary">Problems reframed as opportunity spaces — designed to seed ideation and design thinking.</p>
      {items.map((h, i) => (
        <div key={i} className="rounded-xl border border-accent/20 bg-accent-light/10 overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <p className="text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-3">Opportunity {i + 1}</p>
            <p className="text-2xl font-mono font-bold text-text-primary leading-snug mb-4">
              How might we {(h.statement || '').replace(/^how might we\s*/i, '')}
            </p>
            {h.opportunity && <p className="text-sm font-mono text-text-secondary leading-relaxed">{h.opportunity}</p>}
          </div>
          {h.theme && (
            <div className="px-5 py-3 border-t border-accent/10 bg-accent-light/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent/60">From theme:</span>
                <span className="text-xs font-mono text-accent font-medium">{h.theme}</span>
              </div>
              <button onClick={() => handleCopy(`How might we ${(h.statement || '').replace(/^how might we\s*/i, '')}`)} className="p-1 text-accent/40 hover:text-accent transition-colors" title="Copy">
                <CopyIcon />
              </button>
            </div>
          )}
        </div>
      ))}
      {insights.verbatims?.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">Evidence from Participants</p>
          <div className="grid grid-cols-2 gap-3">
            {insights.verbatims.slice(0, 4).map((v, i) => (
              <div key={i} className="rounded-lg bg-surface2 border border-border p-3">
                <p className="text-xs font-mono text-text-primary italic leading-relaxed">"{v.quote}"</p>
                <p className="text-xs font-mono text-text-secondary mt-2">— {v.participant}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Five Whys View ────────────────────────────────────────────────────────────
function FiveWhyView({ insights, handleCopy }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <p className="text-xs font-mono text-text-secondary">Themes traced from surface behavior to root cause — the real "why" behind what users do.</p>
      {insights.themes?.map((theme, i) => {
        const color = THEME_BORDER_COLORS[i % THEME_BORDER_COLORS.length]
        const relatedInsight = insights.insights?.[i]
        const relatedVerbatim = insights.verbatims?.[i]
        return (
          <div key={i} className="flex flex-col animate-fade-in">
            {/* Level 1: Surface behavior */}
            <div className={`border-l-4 ${color} pl-4 py-3 bg-surface2/40 rounded-r-lg`}>
              <p className="text-xs font-mono text-text-secondary/60 uppercase tracking-wider mb-1">Surface Behavior</p>
              <p className="text-sm font-mono font-semibold text-text-primary">{theme.title}</p>
            </div>
            {/* Arrow */}
            <div className="flex items-center gap-2 pl-5 py-1">
              <div className="w-px h-5 bg-border" />
              <svg viewBox="0 0 10 7" fill="currentColor" className="w-2.5 h-2.5 text-text-secondary/30 -ml-[5px]"><path d="M5 7L0 0h10L5 7z"/></svg>
              <span className="text-xs font-mono text-text-secondary/40 ml-1">Why?</span>
            </div>
            {/* Level 2: Observed pattern */}
            <div className={`border-l-4 ${color} border-opacity-50 pl-4 py-3 bg-surface2/20 rounded-r-lg ml-5`}>
              <p className="text-xs font-mono text-text-secondary/60 uppercase tracking-wider mb-1">Observed Pattern</p>
              <p className="text-sm font-mono text-text-primary leading-relaxed">{theme.description}</p>
            </div>
            {relatedInsight && (
              <>
                {/* Arrow */}
                <div className="flex items-center gap-2 pl-10 py-1">
                  <div className="w-px h-5 bg-border" />
                  <svg viewBox="0 0 10 7" fill="currentColor" className="w-2.5 h-2.5 text-text-secondary/30 -ml-[5px]"><path d="M5 7L0 0h10L5 7z"/></svg>
                  <span className="text-xs font-mono text-text-secondary/40 ml-1">Root cause</span>
                </div>
                {/* Level 3: Root cause */}
                <div className={`border-l-4 ${color} border-opacity-25 pl-4 py-3 bg-accent-light/10 rounded-r-lg ml-10`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-mono text-accent uppercase tracking-wider font-semibold">Root Cause</p>
                    <button onClick={() => handleCopy(relatedInsight)} className="p-1 text-text-secondary/30 hover:text-text-secondary transition-colors" title="Copy">
                      <CopyIcon />
                    </button>
                  </div>
                  <p className="text-sm font-mono text-text-primary leading-relaxed font-medium">{relatedInsight}</p>
                  {relatedVerbatim && (
                    <p className="text-xs font-mono text-text-secondary italic mt-2 pt-2 border-t border-border/40">
                      "{relatedVerbatim.quote}" — {relatedVerbatim.participant}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── I Like / I Wish / What If View ───────────────────────────────────────────
function ILikeWishView({ insights, handleCopy }) {
  const { likes, wishes, whatifs } = parseILikeWish(insights.insights || [])
  const columns = [
    { key: 'likes', label: 'I Like', emoji: '✓', items: likes, bg: 'bg-green-500/5', border: 'border-green-500/30', text: 'text-green-400', chip: 'bg-green-500/8 border-green-500/20' },
    { key: 'wishes', label: 'I Wish', emoji: '△', items: wishes, bg: 'bg-yellow-500/5', border: 'border-yellow-500/30', text: 'text-yellow-400', chip: 'bg-yellow-500/8 border-yellow-500/20' },
    { key: 'whatifs', label: 'What If', emoji: '◇', items: whatifs, bg: 'bg-purple-500/5', border: 'border-purple-500/30', text: 'text-purple-400', chip: 'bg-purple-500/8 border-purple-500/20' },
  ]
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <p className="text-xs font-mono text-text-secondary">Insights organized into three constructive lenses — what's working, what needs to change, what's possible.</p>
      <div className="grid grid-cols-3 gap-4">
        {columns.map(col => (
          <div key={col.key} className={`rounded-xl border ${col.border} ${col.bg} p-4 flex flex-col gap-3`}>
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <span className={`text-xs font-mono ${col.text} opacity-60`}>{col.emoji}</span>
              <p className={`text-sm font-mono font-bold ${col.text}`}>{col.label}</p>
              <span className={`ml-auto text-xs font-mono ${col.text} opacity-50`}>{col.items.length}</span>
            </div>
            {col.items.length === 0 && (
              <p className="text-xs font-mono text-text-secondary/40 italic">No items detected — try regenerating with this framework selected.</p>
            )}
            {col.items.map((item, i) => (
              <div key={i} className={`rounded-lg border ${col.chip} px-3 py-2.5 group`}>
                <div className="flex items-start gap-2">
                  <p className="text-xs font-mono text-text-primary leading-relaxed flex-1">{item}</p>
                  <button onClick={() => handleCopy(item)} className="p-1 text-text-secondary/30 hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Copy">
                    <CopyIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {insights.verbatims?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">Participant Voices</p>
          <div className="grid grid-cols-2 gap-3">
            {insights.verbatims.map((v, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-surface2 border border-border">
                <span className="text-xl font-serif text-text-secondary/20 leading-none flex-shrink-0">"</span>
                <div>
                  <p className="text-xs font-mono text-text-primary italic leading-relaxed">{v.quote}</p>
                  <p className="text-xs font-mono text-text-secondary mt-1">— {v.participant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Headlines from the Future View ───────────────────────────────────────────
function HeadlinesView({ insights, handleCopy }) {
  const headlines = insights.hmw?.length > 0
    ? insights.hmw.map(h => ({ headline: h.statement, deck: h.opportunity, theme: h.theme }))
    : insights.themes?.map(t => ({ headline: t.title, deck: t.description, theme: '' })) || []
  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <p className="text-xs font-mono text-text-secondary">If the team acts on these findings brilliantly — what would the press say in 3 years?</p>
      {headlines.map((h, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface overflow-hidden animate-fade-in group">
          {/* Newspaper masthead */}
          <div className="px-5 py-2.5 bg-surface2 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-text-secondary/50 uppercase tracking-widest">InsightIQ · Future Press</span>
              <span className="text-text-secondary/20">|</span>
              <span className="text-xs font-mono text-accent font-semibold">Headline {i + 1} of {headlines.length}</span>
            </div>
            <button onClick={() => handleCopy(h.headline.replace(/^how might we\s*/i, ''))} className="p-1 text-text-secondary/40 hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all" title="Copy">
              <CopyIcon />
            </button>
          </div>
          <div className="px-6 py-5">
            {/* Big bold headline */}
            <p className="text-2xl font-mono font-bold text-text-primary leading-tight mb-3 border-b border-border pb-3">
              {h.headline.replace(/^how might we\s*/i, '')}
            </p>
            {h.deck && (
              <p className="text-sm font-mono text-text-secondary leading-relaxed">{h.deck}</p>
            )}
            {h.theme && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                <span className="text-xs font-mono text-text-secondary/40 uppercase tracking-wider">Research theme:</span>
                <span className="text-xs font-mono text-accent">{h.theme}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      {insights.insights?.length > 0 && (
        <div>
          <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">Supporting Evidence</p>
          <div className="grid grid-cols-2 gap-3">
            {insights.insights.slice(0, 4).map((ins, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface2 border border-border group">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <p className="text-xs font-mono text-text-primary leading-relaxed flex-1">{ins}</p>
                  <button onClick={() => handleCopy(ins)} className="p-1 text-text-secondary/30 hover:text-text-secondary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" title="Copy">
                    <CopyIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Framework content router ──────────────────────────────────────────────────
function FrameworkContent({ framework, insights, handleCopy }) {
  if (framework === 'affinity') return <AffinityView insights={insights} handleCopy={handleCopy} />
  if (framework === 'matrix') return <MatrixView insights={insights} handleCopy={handleCopy} />
  if (framework === 'hmw') return <HMWView insights={insights} handleCopy={handleCopy} />
  if (framework === 'fivewhy') return <FiveWhyView insights={insights} handleCopy={handleCopy} />
  if (framework === 'ilikewish') return <ILikeWishView insights={insights} handleCopy={handleCopy} />
  if (framework === 'headlines') return <HeadlinesView insights={insights} handleCopy={handleCopy} />
  return <StandardView insights={insights} handleCopy={handleCopy} />
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Insights() {
  const { project, update } = useOutletContext()
  const { stream, loading, error } = useClaude()
  const toast = useToast()
  const [streamText, setStreamText] = useState('')
  const [framework, setFramework] = useState('standard')

  const transcripts = project.transcripts || []
  const allInsights = project.insights || {}
  const insights = allInsights[framework] || null

  async function handleGenerateWithFramework(fw) {
    if (transcripts.length === 0) return
    setStreamText('')

    const prompt = buildInsightsPrompt(transcripts, fw)
    await stream({
      messages: [{ role: 'user', content: prompt }],
      onChunk: (_, full) => setStreamText(full),
      onDone: (full) => {
        const parsed = parseInsights(full)
        update({
          insights: {
            ...(project.insights || {}),
            [fw]: { ...parsed, generatedAt: new Date().toISOString() },
          },
        })
        setStreamText('')
        toast.success(`Insights generated using ${INSIGHT_FRAMEWORKS[fw]?.label} framework.`)
      },
    })
  }

  function handleGenerate() { handleGenerateWithFramework(framework) }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  }

  if (transcripts.length === 0) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="px-8 py-5 border-b border-border flex-shrink-0">
          <h1 className="text-lg font-mono font-bold text-text-primary mb-0.5">Research Insights</h1>
          <p className="text-xs font-mono text-text-secondary">AI-analyzed themes, insights, verbatims, and recommendations.</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center pb-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <path d="M32 8v8M32 48v8M8 32h8M48 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2"/>
            <path d="M32 26v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">No transcripts yet</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">Upload at least one transcript to generate insights.</p>
          <Link to={`/projects/${project.id}/transcripts`}>
            <Button variant="outline" size="sm">Go to Transcripts</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-8 py-5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-mono font-bold text-text-primary mb-0.5">Research Insights</h1>
            <p className="text-xs font-mono text-text-secondary">Select a framework, then generate. Each framework saves independently.</p>
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
        {/* Framework selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-text-secondary mr-1">Framework:</span>
          {Object.entries(INSIGHT_FRAMEWORKS).map(([key, fw]) => {
            const hasData = !!allInsights[key]
            return (
              <div key={key} className="relative group/tip">
                <button
                  onClick={() => setFramework(key)}
                  disabled={loading}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                    framework === key
                      ? 'bg-accent text-white'
                      : 'bg-surface2 text-text-secondary border border-border hover:text-text-primary hover:border-accent/40'
                  }`}
                >
                  {fw.label}
                  {hasData && (
                    <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${framework === key ? 'bg-white/60' : 'bg-accent'}`} />
                  )}
                </button>
                <div className="absolute top-full left-0 mt-2 w-60 px-3 py-2 rounded-lg bg-text-primary text-bg text-xs font-mono leading-relaxed whitespace-normal opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                  <div className="absolute bottom-full left-4 border-4 border-transparent border-b-text-primary" />
                  {fw.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-sm font-mono text-red-400">{error}</div>
          )}

          {loading && (
            <div className="flex flex-col gap-4">
              <Spinner text={`Analyzing with ${INSIGHT_FRAMEWORKS[framework]?.label}…`} />
              {streamText && (
                <div className="p-4 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {streamText}
                </div>
              )}
            </div>
          )}

          {!loading && !insights && (
            <div className="flex flex-col items-center gap-4 pt-16 text-center">
              <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
                <path d="M32 8v8M32 48v8M8 32h8M48 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="2"/>
                <path d="M32 26v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm font-mono text-text-primary font-semibold">No insights for this framework yet</p>
              <p className="text-xs font-mono text-text-secondary max-w-xs">
                You have {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}. Click "Generate Insights" to analyze using <span className="text-accent">{INSIGHT_FRAMEWORKS[framework]?.label}</span>.
              </p>
            </div>
          )}

          {!loading && insights && (
            <FrameworkContent framework={framework} insights={insights} handleCopy={handleCopy} />
          )}
        </div>
      </div>
    </div>
  )
}
