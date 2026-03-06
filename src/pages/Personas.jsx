import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildPersonasPrompt } from '../lib/prompts'
import { formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

// Archetype color mapping
const ARCHETYPE_STYLES = {
  'Power User':        { badge: 'accent',   border: 'border-l-accent',      avatar: 'bg-accent-light text-accent' },
  'Casual User':       { badge: 'success',  border: 'border-l-success',     avatar: 'bg-success/10 text-success' },
  'Business User':     { badge: 'warning',  border: 'border-l-warning',     avatar: 'bg-warning/10 text-warning' },
  'Mobile-First User': { badge: 'default',  border: 'border-l-blue-400',    avatar: 'bg-blue-500/10 text-blue-400' },
}

function getArchetypeStyle(archetype) {
  for (const [key, style] of Object.entries(ARCHETYPE_STYLES)) {
    if (archetype?.toLowerCase().includes(key.toLowerCase().split(' ')[0])) return style
  }
  return ARCHETYPE_STYLES['Casual User']
}

function getInitials(name) {
  return name
    ?.split('—')[0]
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?'
}

function parsePersonas(text) {
  const personas = []
  // Split on ## PERSONA: headers
  const blocks = text.split(/(?=## PERSONA:)/g).filter((b) => b.trim().startsWith('## PERSONA:'))

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)

    const headerMatch = lines[0]?.match(/^## PERSONA:\s*(.+)/)
    if (!headerMatch) continue
    const fullName = headerMatch[1].trim()

    const quoteMatch = block.match(/\*\*Quote:\*\*\s*"([^"]+)"/)
    const archetypeMatch = block.match(/\*\*Archetype:\*\*\s*(.+)/)

    const extractList = (sectionTitle) => {
      const regex = new RegExp(`### ${sectionTitle}\\s*([\\s\\S]*?)(?=###|---|$)`, 'i')
      const match = block.match(regex)
      if (!match) return []
      return match[1]
        .split('\n')
        .map((l) => l.replace(/^[-•*]\s*/, '').trim())
        .filter((l) => l.length > 2 && !l.startsWith('#'))
    }

    const extractDemographics = () => {
      const demo = {}
      const demoSection = block.match(/### Demographics\s*([\s\S]*?)(?=###|---|$)/i)?.[1] || ''
      for (const line of demoSection.split('\n')) {
        const match = line.match(/^[-•*]?\s*([^:]+):\s*(.+)/)
        if (match) demo[match[1].trim()] = match[2].trim()
      }
      return demo
    }

    personas.push({
      fullName,
      quote: quoteMatch?.[1]?.trim() || '',
      archetype: archetypeMatch?.[1]?.trim() || 'Casual User',
      demographics: extractDemographics(),
      motivations: extractList('Motivations'),
      goals: extractList('Goals'),
      frustrations: extractList('Frustrations'),
      designImplications: extractList('Design Implications'),
    })
  }

  return personas
}

function PersonaCard({ persona }) {
  const style = getArchetypeStyle(persona.archetype)
  const initials = getInitials(persona.fullName)
  const [namePart, rolePart] = persona.fullName.split('—').map((s) => s.trim())

  return (
    <Card className={`border-l-4 ${style.border} flex flex-col gap-5 animate-fade-in`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-mono font-bold flex-shrink-0 ${style.avatar}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-mono font-bold text-text-primary leading-tight">{namePart}</h3>
          {rolePart && <p className="text-xs font-mono text-text-secondary mt-0.5">{rolePart}</p>}
          <div className="mt-1.5">
            <Badge variant={style.badge}>{persona.archetype}</Badge>
          </div>
        </div>
      </div>

      {/* Quote */}
      {persona.quote && (
        <blockquote className="border-l-2 border-border pl-3 italic text-xs font-mono text-text-secondary leading-relaxed">
          "{persona.quote}"
        </blockquote>
      )}

      {/* Demographics */}
      {Object.keys(persona.demographics).length > 0 && (
        <div>
          <p className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">Demographics</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(persona.demographics).map(([key, val]) => (
              <div key={key} className="bg-surface2 rounded-md px-2.5 py-1.5">
                <p className="text-xs font-mono text-text-secondary leading-none mb-0.5">{key}</p>
                <p className="text-xs font-mono text-text-primary font-medium">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Motivations */}
        {persona.motivations.length > 0 && (
          <div>
            <p className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">Motivations</p>
            <ul className="flex flex-col gap-1">
              {persona.motivations.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs font-mono text-text-primary">
                  <span className="text-accent mt-0.5 flex-shrink-0">↗</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Goals */}
        {persona.goals.length > 0 && (
          <div>
            <p className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">Goals</p>
            <ul className="flex flex-col gap-1">
              {persona.goals.map((g, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs font-mono text-text-primary">
                  <span className="text-success mt-0.5 flex-shrink-0">✓</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Frustrations */}
        {persona.frustrations.length > 0 && (
          <div>
            <p className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">Frustrations</p>
            <ul className="flex flex-col gap-1">
              {persona.frustrations.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs font-mono text-text-primary">
                  <span className="text-warning mt-0.5 flex-shrink-0">!</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Design Implications */}
      {persona.designImplications.length > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">Design Implications</p>
          <div className="flex flex-wrap gap-2">
            {persona.designImplications.map((d, i) => (
              <span key={i} className="text-xs font-mono bg-accent-light text-accent px-2.5 py-1 rounded-full">
                → {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default function Personas() {
  const { project, update } = useOutletContext()
  const { stream, loading, error } = useClaude()
  const toast = useToast()
  const [streamText, setStreamText] = useState('')

  const transcripts = project.transcripts || []
  const personas = project.personas || null

  async function handleGenerate() {
    if (transcripts.length === 0) return
    setStreamText('')

    await stream({
      messages: [{ role: 'user', content: buildPersonasPrompt(transcripts) }],
      onChunk: (_, full) => setStreamText(full),
      onDone: (full) => {
        const parsed = parsePersonas(full)
        update({ personas: { list: parsed, generatedAt: new Date().toISOString() } })
        setStreamText('')
        toast.success(`${parsed.length} persona${parsed.length !== 1 ? 's' : ''} generated.`)
      },
    })
  }

  // No transcripts
  if (transcripts.length === 0) {
    return (
      <div className="p-8 max-w-3xl animate-fade-in">
        <h1 className="text-xl font-mono font-bold text-text-primary mb-1">User Personas</h1>
        <p className="text-sm font-mono text-text-secondary mb-8">
          AI-generated research personas built from your interview transcripts.
        </p>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <circle cx="24" cy="20" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 52c0-11 9-18 20-18s20 7 20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="46" cy="22" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M36 52c0-8 5-13 10-15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">No transcripts yet</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">
            Upload interview transcripts first to generate research personas.
          </p>
          <Link to={`/projects/${project.id}/transcripts`}>
            <Button variant="outline" size="sm">Go to Transcripts</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-mono font-bold text-text-primary mb-1">User Personas</h1>
          <p className="text-sm font-mono text-text-secondary">
            Research-backed personas generated from your interview transcripts.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {personas?.generatedAt && (
            <span className="text-xs font-mono text-text-secondary hidden sm:block">
              Generated {formatDate(personas.generatedAt)}
            </span>
          )}
          <Button
            variant={personas ? 'outline' : 'primary'}
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
            {personas ? 'Regenerate' : 'Generate Personas'}
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
          <Spinner text="Building personas from your research…" />
          {streamText && (
            <div className="p-4 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {streamText}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && !personas && (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <circle cx="24" cy="20" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 52c0-11 9-18 20-18s20 7 20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="46" cy="22" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M36 52c0-8 5-13 10-15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">No personas yet</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">
            You have {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}. Click "Generate Personas" to build research personas.
          </p>
        </div>
      )}

      {/* Persona cards */}
      {!loading && personas?.list?.length > 0 && (
        <div className="mt-6 flex flex-col gap-6">
          {personas.list.map((persona, i) => (
            <PersonaCard key={i} persona={persona} />
          ))}
        </div>
      )}
    </div>
  )
}
