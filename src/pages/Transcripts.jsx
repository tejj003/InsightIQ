import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { generateId, formatDate, wordCount } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input, { Textarea } from '../components/ui/Input'
import Badge from '../components/ui/Badge'

function TranscriptCard({ transcript, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const toast = useToast()

  function handleCopy() {
    navigator.clipboard.writeText(transcript.text)
    toast.success('Transcript copied to clipboard.')
  }

  return (
    <Card className="animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-mono font-semibold text-text-primary truncate">
              {transcript.label}
            </p>
            <Badge variant="default">
              {wordCount(transcript.text).toLocaleString()} words
            </Badge>
          </div>
          <p className="text-xs font-mono text-text-secondary">
            Added {formatDate(transcript.uploadedAt)}
          </p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded transition-all"
            title={expanded ? 'Collapse' : 'View transcript'}
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              {expanded ? (
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
              ) : (
                <path d="M0 5.75C0 4.784.784 4 1.75 4h12.5c.966 0 1.75.784 1.75 1.75v4.5A1.75 1.75 0 0114.25 12H1.75A1.75 1.75 0 010 10.25v-4.5zM6.5 8.5V7H5v1.5H3.5V10H5v1.5h1.5V10H8V8.5H6.5zm3.75 1a.75.75 0 100-1.5.75.75 0 000 1.5zm2.25-.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              )}
            </svg>
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface2 rounded transition-all"
            title="Copy transcript"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
              <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(transcript.id)}
            className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-900/10 rounded transition-all"
            title="Delete transcript"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.576l.66-6.6a.75.75 0 00-1.492-.149l-.66 6.6a.25.25 0 01-.249.225H5.405a.25.25 0 01-.249-.225l-.66-6.6z"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
            {transcript.text}
          </pre>
        </div>
      )}
    </Card>
  )
}

export default function Transcripts() {
  const { project, update } = useOutletContext()
  const toast = useToast()
  const [label, setLabel] = useState('')
  const [text, setText] = useState('')
  const [labelError, setLabelError] = useState('')
  const [textError, setTextError] = useState('')

  const transcripts = project.transcripts || []

  function handleAdd(e) {
    e.preventDefault()
    let hasError = false
    if (!label.trim()) { setLabelError('Participant label is required.'); hasError = true }
    if (!text.trim()) { setTextError('Transcript text is required.'); hasError = true }
    if (hasError) return

    const newTranscript = {
      id: generateId(),
      label: label.trim(),
      text: text.trim(),
      uploadedAt: new Date().toISOString(),
    }
    update({ transcripts: [...transcripts, newTranscript] })
    setLabel('')
    setText('')
    toast.success('Transcript added.')
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this transcript? This cannot be undone.')) return
    update({ transcripts: transcripts.filter((t) => t.id !== id) })
    toast.success('Transcript deleted.')
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Page header */}
      <div className="px-8 py-5 border-b border-border flex-shrink-0">
        <h1 className="text-lg font-mono font-bold text-text-primary mb-0.5">Transcripts</h1>
        <p className="text-xs font-mono text-text-secondary">Paste interview transcripts to include them in your analysis.</p>
      </div>

      {/* Two-column body */}
      <div className="flex-1 overflow-hidden flex gap-0">
        {/* Left: add form */}
        <div className="w-[420px] flex-shrink-0 border-r border-border overflow-y-auto p-6">
          <p className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-4">Add Transcript</p>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <Input
              label="Participant Label"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setLabelError('') }}
              placeholder="e.g. User 01 — Sarah"
              error={labelError}
            />
            <Textarea
              label="Transcript Text"
              value={text}
              onChange={(e) => { setText(e.target.value); setTextError('') }}
              placeholder="Paste the interview transcript here…"
              rows={12}
              error={textError}
            />
            <Button type="submit" className="w-full justify-center">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z"/>
              </svg>
              Add Transcript
            </Button>
          </form>
        </div>

        {/* Right: transcript list */}
        <div className="flex-1 overflow-y-auto p-6">
          {transcripts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center pb-16">
              <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-text-secondary/30">
                <rect x="10" y="6" width="36" height="44" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M18 18h20M18 26h20M18 34h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M40 38l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-sm font-mono text-text-secondary">No transcripts yet.</p>
              <p className="text-xs font-mono text-text-secondary/50">Add your first transcript using the form.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-1">
                {transcripts.length} Transcript{transcripts.length !== 1 ? 's' : ''}
              </p>
              {transcripts.map((t) => (
                <TranscriptCard key={t.id} transcript={t} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
