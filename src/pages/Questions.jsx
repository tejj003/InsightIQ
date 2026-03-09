import { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildQuestionsPrompt, QUESTION_FRAMEWORKS } from '../lib/prompts'
import { generateId } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'

const SECTIONS = ['Opening', 'Core', 'Closing']

const SECTION_COLORS = {
  Opening: 'border-blue-500/40 bg-blue-500/5',
  Core: 'border-accent/40 bg-accent/5',
  Closing: 'border-success/40 bg-success/5',
}

function parseQuestions(text) {
  const questions = []
  let currentSection = 'Opening'
  const lines = text.split('\n')
  for (const line of lines) {
    const sectionMatch = line.match(/^\*\*(Opening|Core|Closing)\*\*/)
    if (sectionMatch) {
      currentSection = sectionMatch[1]
      continue
    }
    const qMatch = line.match(/^(\d+)\.\s+(.+)/)
    if (qMatch) {
      questions.push({ id: generateId(), section: currentSection, text: qMatch[2].trim() })
    }
  }
  return questions
}

const SECTION_LABELS = {
  Opening: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  Core: { color: 'text-accent', bg: 'bg-accent/10 border-accent/30' },
  Closing: { color: 'text-success', bg: 'bg-success/10 border-success/30' },
}

function AddQuestionModal({ onAdd, onClose }) {
  const [text, setText] = useState('')
  const [section, setSection] = useState('Core')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd({ text: text.trim(), section })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-sm font-mono font-bold text-text-primary">Add Custom Question</h2>
            <p className="text-xs font-mono text-text-secondary mt-0.5">Write your own question and assign it to a section.</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface2 transition-all"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Section picker */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Section
            </label>
            <div className="flex gap-2">
              {SECTIONS.map((s) => {
                const style = SECTION_LABELS[s]
                const active = section === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSection(s)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-mono font-semibold transition-all duration-150 ${
                      active
                        ? `${style.bg} ${style.color} border-opacity-100`
                        : 'border-border text-text-secondary hover:bg-surface2 hover:text-text-primary'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="block text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Question
            </label>
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your question here…"
              rows={3}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm font-mono text-text-primary placeholder-text-secondary/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!text.trim()}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
              </svg>
              Add Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function QuestionCard({ question, index, onDelete, onCopy }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${SECTION_COLORS[question.section]} animate-fade-in`}>
      <span className="w-6 h-6 rounded-full bg-surface2 border border-border text-xs font-mono font-bold text-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
        {index + 1}
      </span>
      <p className="flex-1 text-sm font-mono text-text-primary leading-relaxed">{question.text}</p>
      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={() => onCopy(question.text)}
          className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded transition-all"
          title="Copy question"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
          </svg>
        </button>
        <button
          onClick={() => onDelete(question.id)}
          className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-900/10 rounded transition-all"
          title="Delete question"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225H5.405a.25.25 0 01-.249-.225l-.66-6.6z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function Questions() {
  const { project, update } = useOutletContext()
  const { stream, loading, error } = useClaude()
  const toast = useToast()
  const [streamText, setStreamText] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [qFramework, setQFramework] = useState('exploration')

  const questions = project.questions || []

  async function handleGenerateWithFramework(fw) {
    setQFramework(fw)
    setStreamText('')
    const prompt = buildQuestionsPrompt({
      topic: project.topic,
      goal: project.researchGoal,
      audience: project.targetAudience,
      framework: fw,
    })
    await stream({
      messages: [{ role: 'user', content: prompt }],
      onChunk: (_, full) => setStreamText(full),
      onDone: (full) => {
        const parsed = parseQuestions(full)
        update({ questions: parsed })
        setStreamText('')
        toast.success(`Questions generated using ${QUESTION_FRAMEWORKS[fw]?.label} framework.`)
      },
    })
  }

  function handleGenerate() {
    handleGenerateWithFramework(qFramework)
  }

  function handleDelete(id) {
    update({ questions: questions.filter((q) => q.id !== id) })
    toast.success('Question removed.')
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  }

  function handleAddCustom({ text, section }) {
    const newQ = { id: generateId(), section, text }
    update({ questions: [...questions, newQ] })
    toast.success('Question added.')
  }

  // Group questions by section
  const grouped = SECTIONS.reduce((acc, s) => {
    acc[s] = questions.filter((q) => q.section === s)
    return acc
  }, {})

  const isEmpty = questions.length === 0 && !loading && !streamText

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-8 py-5 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-mono font-bold text-text-primary mb-0.5">Discussion Questions</h1>
            <p className="text-xs font-mono text-text-secondary">
              AI-generated questions tailored to your research topic and framework.
            </p>
          </div>
          {questions.length > 0 && !loading && (
            <Button variant="outline" size="sm" onClick={handleGenerate}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"/>
              </svg>
              Regenerate
            </Button>
          )}
        </div>
        {/* Research framework selector */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          <span className="text-xs font-mono text-text-secondary mr-1">Framework:</span>
          {Object.entries(QUESTION_FRAMEWORKS).map(([key, fw]) => (
            <div key={key} className="relative group/tip">
              <button
                onClick={() => handleGenerateWithFramework(key)}
                disabled={loading}
                className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                  qFramework === key
                    ? 'bg-accent text-white'
                    : 'bg-surface2 text-text-secondary border border-border hover:text-text-primary hover:border-accent/40'
                }`}
              >
                {fw.label}
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 px-3 py-2 rounded-lg bg-text-primary text-bg text-xs font-mono leading-relaxed whitespace-normal opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 pointer-events-none z-50 shadow-lg">
                <div className="absolute bottom-full left-4 border-4 border-transparent border-b-text-primary" />
                {fw.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-sm font-mono text-red-400">
            {error}
          </div>
        )}

        {/* Streaming skeleton */}
        {loading && (
          <div className="flex flex-col gap-3">
            <Spinner text="Generating questions…" />
            {streamText && (
              <div className="mt-4 p-4 rounded-lg bg-surface border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {streamText}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center gap-4 pt-16">
            <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2"/>
              <path d="M24 24c0-4.418 3.582-8 8-8s8 3.582 8 8c0 3.5-2.5 6-5 7.5V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="32" cy="42" r="1.5" fill="currentColor"/>
            </svg>
            <div className="text-center">
              <p className="text-sm font-mono text-text-primary font-semibold mb-1">No questions yet</p>
              <p className="text-xs font-mono text-text-secondary mb-6">
                Generate AI-powered questions based on your research topic and goal.
              </p>
            </div>
            <Button onClick={handleGenerate}>
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.454 1.75 1.486 3.02l-5.49 7.327a1.516 1.516 0 0 1-2.438-1.713L7.583 10.5H5.461c-1.57 0-2.454-1.75-1.486-3.02Z"/>
              </svg>
              Generate Questions
            </Button>
          </div>
        )}

        {/* Questions list grouped by section */}
        {!loading && questions.length > 0 && (
          <div className="flex flex-col gap-8">
            {SECTIONS.map((section) => {
              const sectionQs = grouped[section]
              if (sectionQs.length === 0) return null
              return (
                <div key={section}>
                  <h2 className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    {section}
                  </h2>
                  <div className="flex flex-col gap-2">
                    {sectionQs.map((q, i) => {
                      const globalIndex = questions.indexOf(q)
                      return (
                        <QuestionCard
                          key={q.id}
                          question={q}
                          index={globalIndex}
                          onDelete={handleDelete}
                          onCopy={handleCopy}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Add custom question */}
            <div>
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                </svg>
                Add Custom Question
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>

      {showAddModal && (
        <AddQuestionModal
          onAdd={handleAddCustom}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
