import { useState, useRef } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { useClaude } from '../hooks/useClaude'
import { buildReportPrompt } from '../lib/prompts'
import { formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

// Converts the markdown report into HTML for the print window
function markdownToHtml(md) {
  return md
    // H1
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Bullet points
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>[\s\S]+?<\/li>)(?=\s*(?!<li>))/g, (m) => `<ul>${m}</ul>`)
    // Paragraphs (double newline separated)
    .split(/\n{2,}/)
    .map((block) => {
      block = block.trim()
      if (!block) return ''
      if (/^<(h[123]|ul|blockquote|hr)/.test(block)) return block
      if (block.startsWith('<li>')) return `<ul>${block}</ul>`
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')
}

function openPrintWindow(reportText, projectName) {
  const html = markdownToHtml(reportText)
  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${projectName} — Research Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');

    :root {
      --text: #0f172a;
      --muted: #475569;
      --accent: #6366f1;
      --border: #e2e8f0;
      --surface: #f8fafc;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.75;
      color: var(--text);
      background: #fff;
      padding: 0;
    }

    .page-wrap {
      max-width: 820px;
      margin: 0 auto;
      padding: 56pt 56pt 72pt;
    }

    /* Cover strip */
    .cover-bar {
      background: var(--accent);
      height: 6pt;
      border-radius: 3pt;
      margin-bottom: 36pt;
    }

    h1 {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 24pt;
      font-weight: 700;
      color: var(--text);
      line-height: 1.25;
      margin-bottom: 6pt;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: var(--text);
      margin-top: 32pt;
      margin-bottom: 10pt;
      padding-bottom: 6pt;
      border-bottom: 2pt solid var(--accent);
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: var(--accent);
      margin-top: 18pt;
      margin-bottom: 6pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 10pt;
      color: var(--text);
    }

    p em {
      font-style: italic;
      color: var(--muted);
      font-size: 9.5pt;
    }

    strong {
      font-weight: 600;
      color: var(--text);
    }

    ul {
      padding-left: 18pt;
      margin-bottom: 10pt;
    }

    li {
      margin-bottom: 5pt;
      color: var(--text);
    }

    blockquote {
      margin: 14pt 0;
      padding: 12pt 18pt;
      background: var(--surface);
      border-left: 4pt solid var(--accent);
      border-radius: 0 6pt 6pt 0;
      font-style: italic;
      color: var(--muted);
      page-break-inside: avoid;
    }

    blockquote strong {
      display: block;
      margin-top: 6pt;
      font-style: normal;
      font-size: 9.5pt;
      color: var(--accent);
      font-weight: 600;
    }

    hr {
      border: none;
      border-top: 1pt solid var(--border);
      margin: 24pt 0;
    }

    .footer {
      margin-top: 48pt;
      padding-top: 12pt;
      border-top: 1pt solid var(--border);
      font-size: 8.5pt;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }

    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      body { padding: 0; }
      .page-wrap { padding: 18mm 20mm 22mm; }
      .no-print { display: none !important; }
      h2 { page-break-before: auto; }
      blockquote, li, p { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="page-wrap">
    <div class="cover-bar"></div>
    ${html}
    <div class="footer">
      <span>InsightIQ · Research Report</span>
      <span>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>
  </div>
  <script>
    window.onload = () => { window.focus(); window.print(); }
  <\/script>
</body>
</html>`)
  win.document.close()
}

// Lightweight markdown renderer for the in-app preview
function ReportPreview({ text }) {
  const sections = text.split(/\n(?=#{1,3} )/)

  return (
    <div className="font-mono text-sm leading-relaxed space-y-1">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('# '))
          return <h1 key={i} className="text-xl font-bold text-text-primary mt-6 mb-1 font-sans">{line.slice(2)}</h1>
        if (line.startsWith('## '))
          return <h2 key={i} className="text-base font-bold text-accent mt-8 mb-2 pb-2 border-b border-accent/30">{line.slice(3)}</h2>
        if (line.startsWith('### '))
          return <h3 key={i} className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-5 mb-1">{line.slice(4)}</h3>
        if (line.startsWith('> '))
          return <blockquote key={i} className="border-l-4 border-accent/50 bg-accent-light/30 px-4 py-2 my-2 italic text-text-primary rounded-r-lg">{line.slice(2)}</blockquote>
        if (line === '---')
          return <hr key={i} className="border-border my-6" />
        if (line.startsWith('- ') || line.match(/^\d+\. /))
          return <li key={i} className="ml-5 text-text-primary list-disc">{line.replace(/^[-•\d.] /, '')}</li>
        if (line.trim() === '')
          return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-text-primary leading-relaxed">
            {line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')}
          </p>
        )
      })}
    </div>
  )
}

export default function Report() {
  const { project } = useOutletContext()
  const { stream, loading, error } = useClaude()
  const toast = useToast()
  const [reportText, setReportText] = useState(project.report?.text || '')
  const [streamText, setStreamText] = useState('')
  const previewRef = useRef(null)

  const transcripts = project.transcripts || []
  const hasData = transcripts.length > 0

  async function handleGenerate() {
    if (!hasData) return
    setStreamText('')
    setReportText('')

    const prompt = buildReportPrompt({
      topic: project.topic,
      goal: project.goal,
      audience: project.audience,
      transcripts,
      insights: Object.values(project.insights || {}).length > 0 ? {
        themes: Object.values(project.insights || {}).flatMap(fw => fw?.themes || []),
        insights: Object.values(project.insights || {}).flatMap(fw => fw?.insights || []),
        verbatims: Object.values(project.insights || {}).flatMap(fw => fw?.verbatims || []),
        recommendations: Object.values(project.insights || {}).flatMap(fw => fw?.recommendations || []),
      } : null,
      personas: project.personas,
    })

    await stream({
      messages: [{ role: 'user', content: prompt }],
      onChunk: (_, full) => setStreamText(full),
      onDone: (full) => {
        setReportText(full)
        setStreamText('')
        toast.success('Report generated. Ready to export as PDF.')
      },
    })
  }

  function handleDownloadPdf() {
    openPrintWindow(reportText, project.name || project.topic)
  }

  function handleCopyText() {
    navigator.clipboard.writeText(reportText)
    toast.success('Report copied to clipboard.')
  }

  const displayText = reportText || streamText

  // No transcripts state
  if (!hasData) {
    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="px-8 py-5 border-b border-border flex-shrink-0">
          <h1 className="text-lg font-mono font-bold text-text-primary mb-0.5">Research Report</h1>
          <p className="text-xs font-mono text-text-secondary">
            FAANG-standard executive report — ready to share with leadership.
          </p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center pb-16">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 text-text-secondary/30">
            <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="2"/>
            <path d="M20 20h24M20 28h24M20 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm font-mono text-text-primary font-semibold">No data to report</p>
          <p className="text-xs font-mono text-text-secondary max-w-xs">
            Upload transcripts first. The richer your data, the stronger the report.
          </p>
          <Link to={`/projects/${project.id}/transcripts`}>
            <Button variant="outline" size="sm">Go to Transcripts</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-8 py-5 border-b border-border flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-mono font-bold text-text-primary mb-0.5">Research Report</h1>
          <p className="text-xs font-mono text-text-secondary">
            FAANG-standard executive report — ready to share with leadership.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {reportText && (
            <>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary border border-border hover:text-text-primary hover:bg-surface2 transition-all"
                title="Copy report text"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"/>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"/>
                </svg>
                Copy
              </button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z"/>
                  <path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 6.779a.75.75 0 111.06-1.06l1.97 1.97z"/>
                </svg>
                Export PDF
              </Button>
            </>
          )}
          <Button
            variant={reportText ? 'outline' : 'primary'}
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
            {reportText ? 'Regenerate' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-8" ref={previewRef}>
        <div className="max-w-4xl mx-auto">

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/10 border border-red-500/20 text-sm font-mono text-red-400">
              {error}
            </div>
          )}

          {/* Streaming */}
          {loading && (
            <div className="flex flex-col gap-4">
              <Spinner text="Writing your FAANG-standard research report…" />
              {streamText && (
                <div className="p-5 rounded-xl bg-surface border border-border text-xs font-mono text-text-secondary whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {streamText}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !displayText && (
            <div className="flex flex-col items-center gap-4 pt-16 text-center">
              {/* Report icon */}
              <div className="w-16 h-16 rounded-2xl bg-accent-light border border-accent/20 flex items-center justify-center">
                <svg viewBox="0 0 64 64" fill="none" className="w-9 h-9 text-accent">
                  <rect x="12" y="8" width="40" height="48" rx="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20 20h24M20 28h24M20 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm font-mono text-text-primary font-semibold">No report yet</p>
              <p className="text-xs font-mono text-text-secondary max-w-sm leading-relaxed">
                Generate a FAANG-standard executive research report from your {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''}{Object.keys(project.insights || {}).length > 0 ? ', insights' : ''}{project.personas?.list?.length ? ', and personas' : ''}.
              </p>
              <div className="flex flex-col gap-1.5 text-xs font-mono text-text-secondary/70 mt-1">
                <p className="flex items-center gap-2"><span className="text-accent">✓</span> Executive Summary</p>
                <p className="flex items-center gap-2"><span className="text-accent">✓</span> Key Findings with evidence</p>
                <p className="flex items-center gap-2"><span className="text-accent">✓</span> Theme Analysis</p>
                <p className="flex items-center gap-2"><span className="text-accent">✓</span> Strategic Recommendations with priority</p>
                <p className="flex items-center gap-2"><span className="text-accent">✓</span> Next Steps for cross-functional teams</p>
              </div>
            </div>
          )}

          {/* Report preview */}
          {!loading && displayText && (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              {/* Report header bar */}
              <div className="h-1.5 bg-accent w-full" />
              <div className="px-8 py-8">
                <ReportPreview text={displayText} />
              </div>
              {reportText && (
                <div className="px-8 py-4 border-t border-border bg-surface2/50 flex items-center justify-between">
                  <span className="text-xs font-mono text-text-secondary">
                    InsightIQ Research Report · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 text-xs font-mono text-accent hover:underline transition-colors"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z"/>
                      <path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 6.779a.75.75 0 111.06-1.06l1.97 1.97z"/>
                    </svg>
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
