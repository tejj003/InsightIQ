import { useState, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildQuestionsPrompt } from '../lib/prompts'
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
  const [showAddInput, setShowAddInput] = useState(false)
  const [customQuestion, setCustomQuestion] = useState('')
  const addInputRef = useRef(null)

  const questions = project.questions || []

  async function handleGenerate() {
    setStreamText('')
    const prompt = buildQuestionsPrompt({
      topic: project.topic,
      goal: project.researchGoal,
      audience: project.targetAudience,
    })
    await stream({
      messages: [{ role: 'user', content: prompt }],
      onChunk: (_, full) => setStreamText(full),
      onDone: (full) => {
        const parsed = parseQuestions(full)
        update({ questions: parsed })
        setStreamText('')
        toast.success('Questions generated.')
      },
    })
  }

  function handleDelete(id) {
    update({ questions: questions.filter((q) => q.id !== id) })
    toast.success('Question removed.')
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  }

  function handleAddCustom(e) {
    e.preventDefault()
    if (!customQuestion.trim()) return
    const newQ = { id: generateId(), section: 'Core', text: customQuestion.trim() }
    update({ questions: [...questions, newQ] })
    setCustomQuestion('')
    setShowAddInput(false)
    toast.success('Question added.')
  }

  // Group questions by section
  const grouped = SECTIONS.reduce((acc, s) => {
    acc[s] = questions.filter((q) => q.section === s)
    return acc
  }, {})

  const isEmpty = questions.length === 0 && !loading && !streamText

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-xl font-mono font-bold text-text-primary mb-1">Discussion Questions</h1>
          <p className="text-sm font-mono text-text-secondary">
            AI-generated questions tailored to your research topic.
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

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-sm font-mono text-red-400">
          {error}
        </div>
      )}

      {/* Streaming skeleton */}
      {loading && (
        <div className="mt-8 flex flex-col gap-3">
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
        <div className="mt-16 flex flex-col items-center gap-4">
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
        <div className="mt-8 flex flex-col gap-8">
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
            {showAddInput ? (
              <form onSubmit={handleAddCustom} className="flex gap-2">
                <input
                  ref={addInputRef}
                  autoFocus
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Type your custom question…"
                  className="flex-1 bg-surface2 border border-accent rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-secondary/50 outline-none focus:ring-1 focus:ring-accent/30"
                />
                <Button type="submit" size="sm">Add</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowAddInput(false); setCustomQuestion('') }}>
                  Cancel
                </Button>
              </form>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAddInput(true)}>
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
                </svg>
                Add Custom Question
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
