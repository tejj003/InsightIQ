import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import Input, { Textarea } from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function NewProject() {
  const navigate = useNavigate()
  const { addProject } = useProjects()
  const [form, setForm] = useState({
    name: '',
    topic: '',
    description: '',
    targetAudience: '',
    researchGoal: '',
  })
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Project name is required.'
    if (!form.topic.trim()) errs.topic = 'Research topic is required.'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const project = addProject(form)
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Simple top bar */}
      <header className="h-14 border-b border-border bg-bg/80 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
        <div className="max-w-screen-xl mx-auto px-6 h-full flex items-center">
          <Link to="/" className="text-lg font-mono font-bold text-text-primary tracking-tight hover:text-accent transition-colors">
            Insight<span className="text-accent">IQ</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors mb-8"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z"/>
            </svg>
            Back
          </Link>

          <h1 className="text-xl font-mono font-bold text-text-primary mb-1">New Research Project</h1>
          <p className="text-sm font-mono text-text-secondary mb-8">
            Set up your project to start generating questions and analyzing transcripts.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Project Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Customer Onboarding Research"
              error={errors.name}
              autoFocus
            />

            <Input
              label="Research Topic"
              name="topic"
              value={form.topic}
              onChange={handleChange}
              placeholder="e.g. Customer onboarding experience"
              error={errors.topic}
            />

            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Briefly describe the context of this research…"
              rows={3}
            />

            <Input
              label="Target Audience"
              name="targetAudience"
              value={form.targetAudience}
              onChange={handleChange}
              placeholder="e.g. First-time SaaS users"
            />

            <Textarea
              label="Research Goal"
              name="researchGoal"
              value={form.researchGoal}
              onChange={handleChange}
              placeholder="What do you want to learn from this research?"
              rows={3}
            />

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full justify-center">
                Create Project
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
