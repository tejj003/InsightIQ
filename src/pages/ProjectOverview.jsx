import { Link, useOutletContext } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

function StatBadge({ count, label }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 bg-surface2 rounded-lg border border-border">
      <span className="text-2xl font-mono font-bold text-text-primary">{count}</span>
      <span className="text-xs font-mono text-text-secondary">{label}</span>
    </div>
  )
}

function QuickActionCard({ to, icon, title, description }) {
  return (
    <Link to={to}>
      <Card hover className="flex items-start gap-4 h-full">
        <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-sm font-mono font-semibold text-text-primary mb-0.5">{title}</p>
          <p className="text-xs font-mono text-text-secondary">{description}</p>
        </div>
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-text-secondary ml-auto flex-shrink-0 mt-0.5">
          <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
        </svg>
      </Card>
    </Link>
  )
}

export default function ProjectOverview() {
  const { project } = useOutletContext()

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Page header */}
      <div className="px-8 py-5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-mono font-bold text-text-primary leading-tight truncate">
              {project.name}
            </h1>
            <p className="text-xs font-mono text-accent mt-0.5">{project.topic}</p>
          </div>
          <Badge variant="active">Active</Badge>
        </div>
      </div>

      {/* Body: two-column grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-6 h-full">

          {/* Left column (2/3): details */}
          <div className="col-span-2 flex flex-col gap-6">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <StatBadge count={project.transcripts?.length ?? 0} label="Transcripts" />
              <StatBadge count={project.questions?.length ?? 0} label="Questions" />
              <StatBadge count={Object.values(project.insights || {}).reduce((acc, fw) => acc + (fw?.themes?.length ?? 0), 0)} label="Themes" />
            </div>

            {/* Project details */}
            <Card>
              <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-4">Project Details</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                {project.description && (
                  <div className="col-span-2">
                    <p className="text-xs font-mono text-text-secondary/60 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm font-mono text-text-primary leading-relaxed">{project.description}</p>
                  </div>
                )}
                {project.targetAudience && (
                  <div>
                    <p className="text-xs font-mono text-text-secondary/60 uppercase tracking-wider mb-1">Target Audience</p>
                    <p className="text-sm font-mono text-text-primary leading-relaxed">{project.targetAudience}</p>
                  </div>
                )}
                {project.researchGoal && (
                  <div className={project.targetAudience ? '' : 'col-span-2'}>
                    <p className="text-xs font-mono text-text-secondary/60 uppercase tracking-wider mb-1">Research Goal</p>
                    <p className="text-sm font-mono text-text-primary leading-relaxed">{project.researchGoal}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-mono text-text-secondary/60 uppercase tracking-wider mb-1">Created</p>
                  <p className="text-sm font-mono text-text-primary">{formatDate(project.createdAt)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column (1/3): quick actions */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-mono text-text-secondary uppercase tracking-wider">Quick Actions</p>
            <QuickActionCard
              to={`/projects/${project.id}/questions`}
              title="Generate Questions"
              description="AI-powered discussion questions."
              icon={
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13A6.5 6.5 0 008 1.5zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 1a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.613.613 0 019 6.25c0 .177-.04.264-.077.318a.956.956 0 01-.277.245c-.076.051-.158.1-.258.161l-.00.01c-.09.056-.19.117-.285.188a1.17 1.17 0 00-.337.45.75.75 0 001.38.59.5.5 0 01.062-.147 1.25 1.25 0 01.17-.183c.077-.06.17-.12.267-.18.026-.016.051-.031.076-.047.134-.082.29-.176.428-.288A2.11 2.11 0 0010.5 6.25c0-.567-.265-1.059-.694-1.374C9.375 4.55 8.817 4.35 8 4.35c-.65 0-1.248.187-1.697.512a2.37 2.37 0 00-.863 1.155.75.75 0 001.48.236z"/>
                </svg>
              }
            />
            <QuickActionCard
              to={`/projects/${project.id}/transcripts`}
              title="Add Transcript"
              description="Paste interview transcripts."
              icon={
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M2 2.5A.5.5 0 012.5 2h8a.5.5 0 01.5.5v1a.5.5 0 01-1 0V3H3v10h7v-1.5a.5.5 0 011 0V13a.5.5 0 01-.5.5h-8A.5.5 0 012 13V2.5z"/>
                  <path d="M4 5.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z"/>
                </svg>
              }
            />
            <QuickActionCard
              to={`/projects/${project.id}/insights`}
              title="View Insights"
              description="Themes and recommendations."
              icon={
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8zm7-3.5a1 1 0 112 0v3.25L10.5 9a.75.75 0 01-1.06 1.06L8 8.62l-1.44 1.44A.75.75 0 015.5 9l1.5-1.25V4.5z"/>
                  <path d="M6.5 11a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 016.5 11z"/>
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
