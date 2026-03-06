import { useState, useRef, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildChatSystemPrompt } from '../lib/prompts'
import { generateId, formatDate } from '../lib/utils'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

const STARTER_QUESTIONS = [
  'What are the most common pain points?',
  'What do participants value most?',
  'What surprised you most in this research?',
]

function UserMessage({ message }) {
  return (
    <div className="flex justify-end animate-fade-in">
      <div className="max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm bg-accent text-white text-sm font-mono leading-relaxed">
        {message.content}
      </div>
    </div>
  )
}

function AssistantMessage({ message, streaming }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-accent">
          <path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.454 1.75 1.486 3.02l-5.49 7.327a1.516 1.516 0 0 1-2.438-1.713L7.583 10.5H5.461c-1.57 0-2.454-1.75-1.486-3.02Z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-border text-sm font-mono text-text-primary leading-relaxed whitespace-pre-wrap">
          {message.content}
          {streaming && (
            <span className="inline-block w-1.5 h-4 bg-accent ml-0.5 animate-pulse rounded-sm align-text-bottom" />
          )}
        </div>
        {!streaming && (
          <p className="text-xs font-mono text-text-secondary mt-1 ml-1">Based on your research</p>
        )}
      </div>
    </div>
  )
}

export default function Ask() {
  const { project, update } = useOutletContext()
  const { stream, loading, error, cancel } = useClaude()
  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const transcripts = project.transcripts || []
  const chatHistory = project.chatHistory || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streamingContent])

  async function handleSend(text) {
    const question = (text || input).trim()
    if (!question || loading) return
    setInput('')

    const userMsg = { id: generateId(), role: 'user', content: question, timestamp: new Date().toISOString() }
    const updatedHistory = [...chatHistory, userMsg]
    update({ chatHistory: updatedHistory })

    setStreamingContent('')

    const systemPrompt = buildChatSystemPrompt({
      topic: project.topic,
      transcripts,
      insights: project.insights,
    })

    const apiMessages = updatedHistory.map(({ role, content }) => ({ role, content }))

    await stream({
      messages: apiMessages,
      system: systemPrompt,
      onChunk: (_, full) => setStreamingContent(full),
      onDone: (full) => {
        const assistantMsg = {
          id: generateId(),
          role: 'assistant',
          content: full,
          timestamp: new Date().toISOString(),
        }
        update({ chatHistory: [...updatedHistory, assistantMsg] })
        setStreamingContent('')
      },
    })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // No transcripts state
  if (transcripts.length === 0) {
    return (
      <div className="p-8 max-w-3xl animate-fade-in">
        <h1 className="text-xl font-mono font-bold text-text-primary mb-1">Ask InsightIQ</h1>
        <p className="text-sm font-mono text-text-secondary mb-8">
          Ask anything about your research. Answers are grounded in your transcripts.
        </p>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <path d="M8 16a8 8 0 018-8h32a8 8 0 018 8v20a8 8 0 01-8 8H32l-12 8v-8h-4a8 8 0 01-8-8V16z" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 28h24M20 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">Add transcripts first</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">
            Upload at least one interview transcript to start asking questions about your research.
          </p>
          <Link to={`/projects/${project.id}/transcripts`}>
            <Button variant="outline" size="sm">Go to Transcripts</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border flex-shrink-0">
        <h1 className="text-xl font-mono font-bold text-text-primary mb-1">Ask InsightIQ</h1>
        <p className="text-sm font-mono text-text-secondary">
          Ask anything about your research. Answers are based on your transcripts.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
        {/* Starter questions shown before first message */}
        {chatHistory.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-accent">
                <path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.454 1.75 1.486 3.02l-5.49 7.327a1.516 1.516 0 0 1-2.438-1.713L7.583 10.5H5.461c-1.57 0-2.454-1.75-1.486-3.02Z"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-mono font-semibold text-text-primary mb-1">InsightIQ is ready</p>
              <p className="text-xs font-mono text-text-secondary">
                Ask anything about your {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-left px-4 py-3 rounded-xl border border-border bg-surface text-sm font-mono text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-surface2 transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {chatHistory.map((msg) =>
          msg.role === 'user' ? (
            <UserMessage key={msg.id} message={msg} />
          ) : (
            <AssistantMessage key={msg.id} message={msg} streaming={false} />
          )
        )}

        {/* Streaming assistant message */}
        {streamingContent && (
          <AssistantMessage
            message={{ id: 'streaming', role: 'assistant', content: streamingContent }}
            streaming
          />
        )}

        {/* Loading indicator (before first chunk) */}
        {loading && !streamingContent && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-accent">
                <path d="M9.504.43a1.516 1.516 0 0 1 2.437 1.713L10.415 5.5h2.123c1.57 0 2.454 1.75 1.486 3.02l-5.49 7.327a1.516 1.516 0 0 1-2.438-1.713L7.583 10.5H5.461c-1.57 0-2.454-1.75-1.486-3.02Z"/>
              </svg>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-border">
              <Spinner size="sm" text="Thinking…" />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-sm font-mono text-red-400">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-8 py-4 border-t border-border flex-shrink-0 bg-bg">
        <div className="flex gap-3 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your research…"
            rows={1}
            disabled={loading}
            className="flex-1 bg-surface2 border border-border rounded-xl px-4 py-3 text-sm font-mono text-text-primary placeholder-text-secondary/50 outline-none transition-all duration-150 focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none disabled:opacity-50 leading-relaxed"
            style={{ minHeight: '48px', maxHeight: '160px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
            }}
          />
          {loading ? (
            <Button variant="danger" size="md" onClick={cancel} className="flex-shrink-0">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              </svg>
              Stop
            </Button>
          ) : (
            <Button
              size="md"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="flex-shrink-0"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M.989 8 .064 2.68a1.342 1.342 0 0 1 1.85-1.462l13.402 5.744a1.13 1.13 0 0 1 0 2.076L1.913 14.782a1.343 1.343 0 0 1-1.85-1.463L.99 8Zm.603-5.288L2.38 7.25h4.87a.75.75 0 0 1 0 1.5H2.38l-.788 4.538L13.929 8Z"/>
              </svg>
              Send
            </Button>
          )}
        </div>
        <p className="text-xs font-mono text-text-secondary mt-2">
          Press <kbd className="px-1 py-0.5 bg-surface2 border border-border rounded text-xs">Enter</kbd> to send,{' '}
          <kbd className="px-1 py-0.5 bg-surface2 border border-border rounded text-xs">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
