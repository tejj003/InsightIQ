import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { formatDate, classNames } from '../lib/utils'
import { API_KEY_STORAGE_KEY, OPENAI_API_KEY_STORAGE_KEY, getProvider } from '../hooks/useClaude'
import { ApiKeyModal } from '../components/layout/Navbar'

function checkHasKey() {
  const p = getProvider()
  return p === 'openai'
    ? !!(localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY)
    : !!(localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_ANTHROPIC_API_KEY)
}

function ProjectCard({ project }) {
  const transcripts = project.transcripts?.length ?? 0
  const questions = project.questions?.length ?? 0
  const hasInsights = Object.keys(project.insights || {}).length > 0
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="group bg-surface border border-border rounded-xl p-5 hover:border-accent/50 hover:shadow-xl hover:shadow-black/30 transition-all duration-200 cursor-pointer flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-mono font-semibold text-text-primary leading-snug group-hover:text-accent transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-xs font-mono text-accent/70 mt-0.5 truncate">{project.topic}</p>
          </div>
          <span className={classNames(
            'flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-mono font-medium border',
            project.status === 'active'
              ? 'text-success border-success/20 bg-success/5'
              : 'text-text-secondary border-border bg-surface2'
          )}>
            {project.status === 'active' ? 'Active' : 'Complete'}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-xs font-mono text-text-secondary leading-relaxed line-clamp-2 flex-1">
            {project.description}
          </p>
        )}

        {/* Footer stats */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/60">
          <span className="text-xs font-mono text-text-secondary/50">{formatDate(project.createdAt)}</span>
          <div className="flex items-center gap-3 ml-auto">
            {transcripts > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono text-text-secondary">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-60">
                  <path d="M2 2.5A.5.5 0 012.5 2h8a.5.5 0 01.5.5v1a.5.5 0 01-1 0V3H3v10h7v-1.5a.5.5 0 011 0V13a.5.5 0 01-.5.5h-8A.5.5 0 012 13V2.5z"/>
                  <path d="M4 5.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z"/>
                </svg>
                {transcripts}
              </span>
            )}
            {questions > 0 && (
              <span className="flex items-center gap-1 text-xs font-mono text-text-secondary">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 opacity-60">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 1a1 1 0 11-2 0 1 1 0 012 0z"/>
                </svg>
                {questions}
              </span>
            )}
            {hasInsights && (
              <span className="text-xs font-mono text-success/80">✓ insights</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const { projects } = useProjects()
  const [hasKey, setHasKey] = useState(checkHasKey)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    function onKeyChange() { setHasKey(checkHasKey()) }
    window.addEventListener('insightiq:keychange', onKeyChange)
    return () => window.removeEventListener('insightiq:keychange', onKeyChange)
  }, [])

  function handleModalClose() {
    setShowModal(false)
    setHasKey(checkHasKey())
    window.dispatchEvent(new Event('insightiq:keychange'))
  }

  const totalTranscripts = projects.reduce((sum, p) => sum + (p.transcripts?.length ?? 0), 0)
  const totalQuestions = projects.reduce((sum, p) => sum + (p.questions?.length ?? 0), 0)
  const activeCount = projects.filter(p => p.status === 'active').length

  return (
    <div className="h-screen bg-bg flex overflow-hidden">

      {/* ── Left sidebar ─────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 border-r border-border bg-surface flex flex-col">
        {/* Header: logo + new project */}
        <div className="px-4 h-12 flex items-center justify-between border-b border-border flex-shrink-0">
          <span className="text-sm font-mono font-bold text-text-primary tracking-tight">
            Insight<span className="text-accent">IQ</span>
          </span>
          <Link
            to="/projects/new"
            title="New Project"
            className="w-6 h-6 flex items-center justify-center rounded-md text-text-secondary hover:text-text-primary hover:bg-surface2 transition-all"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
            </svg>
          </Link>
        </div>

        {/* Projects section */}
        <div className="flex-1 flex flex-col overflow-hidden py-2">
          <p className="px-4 pb-1 text-xs font-mono text-text-secondary/50 uppercase tracking-wider">
            Projects
          </p>
          <nav className="flex-1 overflow-y-auto px-2 flex flex-col gap-0.5">
            {projects.length === 0 ? (
              <p className="text-xs font-mono text-text-secondary/40 px-2 py-1.5">No projects yet</p>
            ) : (
              projects.map(p => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface2 transition-all group"
                >
                  <span className={classNames(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    p.status === 'active' ? 'bg-success' : 'bg-border'
                  )} />
                  <span className="truncate flex-1">{p.name}</span>
                  {p.transcripts?.length > 0 && (
                    <span className="text-text-secondary/30 group-hover:text-text-secondary/60 tabular-nums">
                      {p.transcripts.length}
                    </span>
                  )}
                </Link>
              ))
            )}
          </nav>
        </div>

        {/* Bottom: API key status */}
        <div className="border-t border-border flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2.5 w-full px-4 h-10 text-xs font-mono transition-all hover:bg-surface2"
          >
            <span className={classNames(
              'w-1.5 h-1.5 rounded-full flex-shrink-0',
              hasKey ? 'bg-success' : 'bg-warning'
            )} />
            <span className={hasKey ? 'text-text-secondary' : 'text-warning'}>
              {hasKey
                ? `${getProvider() === 'openai' ? 'OpenAI' : 'Claude'} connected`
                : 'Add API key'}
            </span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex-shrink-0 border-b border-border px-8 py-4 flex items-center justify-between bg-bg/60 backdrop-blur-sm">
          <div>
            <h2 className="text-base font-mono font-bold text-text-primary">Research Projects</h2>
            <p className="text-xs font-mono text-text-secondary mt-0.5">
              {activeCount > 0 ? `${activeCount} active` : 'No active projects'}
              {totalTranscripts > 0 && ` · ${totalTranscripts} transcript${totalTranscripts !== 1 ? 's' : ''}`}
              {totalQuestions > 0 && ` · ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''}`}
            </p>
          </div>
          {!hasKey && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-warning/10 border border-warning/20 text-xs font-mono text-warning hover:bg-warning/15 transition-all"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575Zm1.763.707a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368Zm.53 3.996v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0ZM9 11a1 1 0 11-2 0 1 1 0 012 0Z"/>
              </svg>
              Add API key to enable AI
            </button>
          )}
        </header>

        {/* Project grid */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-16 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
                <svg viewBox="0 0 64 64" fill="none" className="w-8 h-8 text-text-secondary/40">
                  <rect x="8" y="8" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 20h20M16 28h20M16 36h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="48" cy="48" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M55 55l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-mono font-semibold text-text-primary mb-1">No projects yet</p>
              <p className="text-xs font-mono text-text-secondary mb-6 text-center max-w-xs leading-relaxed">
                Create your first research project to start generating AI-powered questions and insights.
              </p>
              <Link
                to="/projects/new"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-mono font-medium hover:bg-blue-500 transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                </svg>
                Create First Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && <ApiKeyModal onClose={handleModalClose} />}
    </div>
  )
}
