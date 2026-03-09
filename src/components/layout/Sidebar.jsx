import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { classNames } from '../../lib/utils'
import { useToast } from '../ui/Toast'

const navItems = [
  {
    id: 'overview',
    label: 'Overview',
    path: '',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M2 2.5A.5.5 0 012.5 2h4a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-4A.5.5 0 012 6.5v-4zm7 0a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-4zm-7 7A.5.5 0 012.5 9h4a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-4zm7 0a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5v-4z"/>
      </svg>
    ),
  },
  {
    id: 'questions',
    label: 'Questions',
    path: 'questions',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 1a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.613.613 0 019 6.25c0 .177-.04.264-.077.318a.956.956 0 01-.277.245c-.076.051-.158.1-.258.161l-.00.01c-.09.056-.19.117-.285.188a1.17 1.17 0 00-.337.45.75.75 0 001.38.59.5.5 0 01.062-.147 1.25 1.25 0 01.17-.183c.077-.06.17-.12.267-.18.026-.016.051-.031.076-.047.134-.082.29-.176.428-.288A2.11 2.11 0 0010.5 6.25c0-.567-.265-1.059-.694-1.374C9.375 4.55 8.817 4.35 8 4.35c-.65 0-1.248.187-1.697.512a2.37 2.37 0 00-.863 1.155.75.75 0 001.48.236z"/>
      </svg>
    ),
  },
  {
    id: 'transcripts',
    label: 'Transcripts',
    path: 'transcripts',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M2 2.5A.5.5 0 012.5 2h8a.5.5 0 01.5.5v1a.5.5 0 01-1 0V3H3v10h7v-1.5a.5.5 0 011 0V13a.5.5 0 01-.5.5h-8A.5.5 0 012 13V2.5z"/>
        <path d="M4 5.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm7.854-1.646a.5.5 0 010 .707l-3 3a.5.5 0 01-.707 0l-1.5-1.5a.5.5 0 01.707-.707L8.5 10.793l2.646-2.646a.5.5 0 01.707 0z"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    path: 'insights',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8zm7-3.5a1 1 0 112 0v3.25L10.5 9a.75.75 0 01-1.06 1.06L8 8.62l-1.44 1.44A.75.75 0 015.5 9l1.5-1.25V4.5z"/>
        <path d="M6.5 11a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 016.5 11z"/>
      </svg>
    ),
  },
  {
    id: 'personas',
    label: 'Personas',
    path: 'personas',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M5 3.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM7.5 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-3 8A3.5 3.5 0 0 0 1 11.5V13a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1.5A3.5 3.5 0 0 0 10.5 8h-6zM2 11.5A2.5 2.5 0 0 1 4.5 9h6a2.5 2.5 0 0 1 2.5 2.5V13H2v-1.5z"/>
      </svg>
    ),
  },
  {
    id: 'report',
    label: 'Report',
    path: 'report',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M3.75 2A1.75 1.75 0 002 3.75v10.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 14.25V6.414a1.75 1.75 0 00-.513-1.237L10.75 2.513A1.75 1.75 0 009.586 2H3.75zM3.5 3.75a.25.25 0 01.25-.25h5.586a.25.25 0 01.177.073l2.737 2.737a.25.25 0 01.073.177v7.763a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25V3.75zM5 6.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5H5zm0 2.5a.75.75 0 000 1.5h6a.75.75 0 000-1.5H5zm0 2.5a.75.75 0 000 1.5h4a.75.75 0 000-1.5H5z"/>
      </svg>
    ),
  },
  {
    id: 'ask',
    label: 'Ask InsightIQ',
    path: 'ask',
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M2.678 11.894a1 1 0 01.287.801 10.97 10.97 0 01-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 01.71-.074A8.06 8.06 0 008 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 01-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 00.244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 01-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
      </svg>
    ),
  },
]

export default function Sidebar({ project, onDelete, onRename }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(project?.name || '')

  function handleDelete() {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    onDelete()
    navigate('/')
    toast.success('Project deleted.')
  }

  function handleRename(e) {
    e.preventDefault()
    if (!newName.trim()) return
    onRename(newName.trim())
    setRenaming(false)
    toast.success('Project renamed.')
  }

  const transcripts = project?.transcripts?.length ?? 0
  const questions = project?.questions?.length ?? 0
  const hasInsights = !!project?.insights

  return (
    <aside className="w-60 flex-shrink-0 border-r border-border bg-surface flex flex-col h-full">
      {/* Project header (merged with back link) */}
      <div className="px-4 py-5 border-b border-border flex-shrink-0">
        <Link
          to="/"
          className="flex items-center gap-1 text-xs font-mono text-text-secondary/60 hover:text-text-secondary transition-colors mb-2"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M9.78 3.22a.75.75 0 010 1.06L6.56 7.5l3.22 3.22a.75.75 0 11-1.06 1.06L4.94 8.03a.75.75 0 010-1.06l3.78-3.78a.75.75 0 011.06 0z"/>
          </svg>
          All Projects
        </Link>
        {renaming ? (
          <form onSubmit={handleRename} className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => setRenaming(false)}
              className="flex-1 min-w-0 bg-surface2 border border-accent rounded px-2 py-1 text-sm font-mono text-text-primary outline-none"
            />
          </form>
        ) : (
          <p
            className="text-sm font-mono font-semibold text-text-primary truncate cursor-pointer hover:text-accent transition-colors"
            title={project?.name}
            onDoubleClick={() => { setNewName(project?.name || ''); setRenaming(true) }}
          >
            {project?.name || 'Untitled Project'}
          </p>
        )}
        <p className="text-xs font-mono text-text-secondary mt-0.5 truncate">{project?.topic}</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path === '' ? `/projects/${project?.id}` : `/projects/${project?.id}/${item.path}`}
            end={item.path === ''}
            className={({ isActive }) =>
              classNames(
                'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent',
                isActive
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface2'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                )}
                {item.icon}
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-3 border-t border-border flex flex-col gap-0.5">
        <button
          onClick={() => { setNewName(project?.name || ''); setRenaming(true) }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface2 transition-all duration-150 w-full text-left"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81l-6.286 6.287a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064L11.189 6.25z"/>
          </svg>
          Rename Project
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono text-red-400/60 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150 w-full text-left"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225H5.405a.25.25 0 01-.249-.225l-.66-6.6z"/>
          </svg>
          Delete Project
        </button>
      </div>
    </aside>
  )
}
