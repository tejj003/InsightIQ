import { useState, useCallback, useRef } from 'react'

const CLAUDE_MODEL = 'claude-sonnet-4-6'
const OPENAI_MODEL = 'gpt-4o'
const ANTHROPIC_DEFAULT_URL = 'https://api.anthropic.com/v1/messages'
const OPENAI_DEFAULT_URL = 'https://api.openai.com/v1/chat/completions'

export const API_KEY_STORAGE_KEY = 'insightiq_api_key'
export const OPENAI_API_KEY_STORAGE_KEY = 'insightiq_openai_api_key'
export const AI_PROVIDER_KEY = 'insightiq_ai_provider' // 'claude' | 'openai'
export const ANTHROPIC_URL_STORAGE_KEY = 'insightiq_anthropic_url'
export const OPENAI_URL_STORAGE_KEY = 'insightiq_openai_url'

export function getProvider() {
  return localStorage.getItem(AI_PROVIDER_KEY) || 'claude'
}

function getApiKey() {
  const provider = getProvider()
  if (provider === 'openai') {
    return localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY) || import.meta.env.VITE_OPENAI_API_KEY || ''
  }
  return localStorage.getItem(API_KEY_STORAGE_KEY) || import.meta.env.VITE_ANTHROPIC_API_KEY || ''
}

function getEndpointUrl(provider) {
  if (provider === 'openai') {
    return localStorage.getItem(OPENAI_URL_STORAGE_KEY) || OPENAI_DEFAULT_URL
  }
  return localStorage.getItem(ANTHROPIC_URL_STORAGE_KEY) || ANTHROPIC_DEFAULT_URL
}

async function streamClaude({ messages, system, onChunk, onDone, apiKey, url, signal }) {
  const body = { model: CLAUDE_MODEL, max_tokens: 4096, stream: true, messages }
  if (system) body.system = system

  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.')
    if (res.status === 401) throw new Error('Invalid API key. Please check your Anthropic API key.')
    throw new Error(err?.error?.message || `Anthropic API error: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
          fullText += parsed.delta.text
          onChunk?.(parsed.delta.text, fullText)
        }
      } catch { /* skip malformed SSE lines */ }
    }
  }

  onDone?.(fullText)
}

async function streamOpenAI({ messages, system, onChunk, onDone, apiKey, url, signal }) {
  const allMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages

  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: OPENAI_MODEL, stream: true, messages: allMessages }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (res.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.')
    if (res.status === 401) throw new Error('Invalid API key. Please check your OpenAI API key.')
    throw new Error(err?.error?.message || `OpenAI API error: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of decoder.decode(value, { stream: true }).split('\n')) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const text = JSON.parse(data)?.choices?.[0]?.delta?.content
        if (text) {
          fullText += text
          onChunk?.(text, fullText)
        }
      } catch { /* skip malformed SSE lines */ }
    }
  }

  onDone?.(fullText)
}

export function useClaude() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const stream = useCallback(async ({ messages, system, onChunk, onDone }) => {
    const provider = getProvider()
    const apiKey = getApiKey()
    const url = getEndpointUrl(provider)

    if (!apiKey) {
      setError(
        provider === 'openai'
          ? 'No OpenAI API key set. Click the key icon in the top-right to add it.'
          : 'No Anthropic API key set. Click the key icon in the top-right to add it.'
      )
      return
    }

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      if (provider === 'openai') {
        await streamOpenAI({ messages, system, onChunk, onDone, apiKey, url, signal: controller.signal })
      } else {
        await streamClaude({ messages, system, onChunk, onDone, apiKey, url, signal: controller.signal })
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  return { stream, loading, error, cancel, clearError: () => setError(null) }
}
