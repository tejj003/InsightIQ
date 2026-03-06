import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { formatDate, truncate } from '../lib/utils'
import { API_KEY_STORAGE_KEY, OPENAI_API_KEY_STORAGE_KEY, getProvider } from '../hooks/useClaude'
import Navbar from '../components/layout/Navbar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

function checkHasKey() {
  const p = getProvider()
  return p === 'openai'
    ? !!(localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY)
    : !!(localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_ANTHROPIC_API_KEY)
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <svg viewBox="0 0 64 64" fill="none" className="w-16 h-16 mb-6 text-text-secondary/40" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 20h20M16 28h20M16 36h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="48" cy="48" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M55 55l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <h2 className="text-lg font-mono font-semibold text-text-primary mb-2">No projects yet</h2>
      <p className="text-sm font-mono text-text-secondary mb-6 text-center max-w-xs">
        Start by creating your first research project.
      </p>
      <Link to="/projects/new">
        <Button>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
          </svg>
          Create Project
        </Button>
      </Link>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card hover className="h-full flex flex-col gap-3 animate-fade-in">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-mono font-semibold text-text-primary leading-snug flex-1 min-w-0">
            {project.name}
          </h3>
          <Badge variant={project.status === 'active' ? 'active' : 'complete'} className="flex-shrink-0">
            {project.status === 'active' ? 'Active' : 'Complete'}
          </Badge>
        </div>

        <p className="text-xs font-mono text-accent font-medium truncate">{project.topic}</p>

        {project.description && (
          <p className="text-xs font-mono text-text-secondary leading-relaxed line-clamp-2">
            {truncate(project.description, 100)}
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border">
          <span className="text-xs font-mono text-text-secondary">
            {formatDate(project.createdAt)}
          </span>
          {project.transcripts?.length > 0 && (
            <Badge variant="default">
              {project.transcripts.length} transcript{project.transcripts.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {project.questions?.length > 0 && (
            <Badge variant="default">
              {project.questions.length} question{project.questions.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  )
}

export default function Home() {
  const { projects } = useProjects()
  const [hasKey, setHasKey] = useState(checkHasKey)

  useEffect(() => {
    function onKeyChange() { setHasKey(checkHasKey()) }
    window.addEventListener('insightiq:keychange', onKeyChange)
    return () => window.removeEventListener('insightiq:keychange', onKeyChange)
  }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      {/* No API key banner */}
      {!hasKey && (
        <div className="bg-warning/10 border-b border-warning/20 px-6 py-2.5 flex items-center justify-center gap-2">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-warning flex-shrink-0">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575Zm1.763.707a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368Zm.53 3.996v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0ZM9 11a1 1 0 11-2 0 1 1 0 012 0Z"/>
          </svg>
          <p className="text-xs font-mono text-warning">
            No API key set — AI features won't work until you add one.
          </p>
          <button
            onClick={() => document.querySelector('[title*="API key"]')?.click()}
            className="text-xs font-mono text-warning underline hover:no-underline ml-1"
          >
            Add key →
          </button>
        </div>
      )}

      <div className="flex-1 max-w-screen-lg mx-auto w-full px-6 py-10">
        {projects.length > 0 && (
          <div className="mb-8">
            <h1 className="text-xl font-mono font-bold text-text-primary mb-1">
              Your Research Projects
            </h1>
            <p className="text-sm font-mono text-text-secondary">
              Pick up where you left off, or start something new.
            </p>
          </div>
        )}

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
