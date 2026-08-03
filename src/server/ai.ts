/**
 * Provider-agnostic AI adapter (server only).
 *
 * The user chooses the provider and supplies the key as an environment secret,
 * so nothing here is hard-wired to one vendor. Configure via:
 *   AI_PROVIDER   'anthropic' (default) | 'openai'
 *   AI_API_KEY    the key (falls back to ANTHROPIC_API_KEY / OPENAI_API_KEY)
 *   AI_MODEL      optional model override
 *
 * If no key is present the app still works: callers fall back to the built-in,
 * PDF-derived content banks.
 */

export type Provider = 'anthropic' | 'openai'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

// Conservative, widely-available defaults. Override with AI_MODEL to use a
// newer model your account has access to (e.g. a Claude 4.x/5 Sonnet snapshot).
const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-3-5-sonnet-latest',
  openai: 'gpt-4o',
}

function provider(): Provider {
  const p = (process.env.AI_PROVIDER ?? 'anthropic').toLowerCase()
  return p === 'openai' ? 'openai' : 'anthropic'
}

function apiKey(): string | null {
  return (
    process.env.AI_API_KEY ??
    (provider() === 'openai' ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY) ??
    null
  )
}

function model(): string {
  return process.env.AI_MODEL ?? DEFAULT_MODELS[provider()]
}

export function isConfigured(): boolean {
  return apiKey() != null
}

export function providerInfo(): { provider: Provider; model: string; configured: boolean } {
  return { provider: provider(), model: model(), configured: isConfigured() }
}

/** A minimal JSON-Schema object for structured tool output. */
export type JsonSchema = Record<string, unknown>

/**
 * Ask the model to emit a single structured JSON object matching `schema`,
 * using the provider's tool/function-calling so the output is reliable.
 */
export async function generateJSON<T>(args: {
  system: string
  user: string
  schema: JsonSchema
  maxTokens?: number
  temperature?: number
}): Promise<T> {
  const key = apiKey()
  if (!key) throw new Error('AI not configured')
  const maxTokens = args.maxTokens ?? 4096
  const temperature = args.temperature ?? 0.7

  if (provider() === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model(),
        max_tokens: maxTokens,
        temperature,
        system: args.system,
        tools: [{ name: 'emit', description: 'Return the result.', input_schema: args.schema }],
        tool_choice: { type: 'tool', name: 'emit' },
        messages: [{ role: 'user', content: args.user }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const data = (await res.json()) as {
      content: { type: string; input?: unknown }[]
    }
    const tool = data.content.find((c) => c.type === 'tool_use')
    if (!tool?.input) throw new Error('No tool output from Anthropic')
    return tool.input as T
  }

  // OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model(),
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: args.system },
        { role: 'user', content: args.user },
      ],
      tools: [
        {
          type: 'function',
          function: { name: 'emit', description: 'Return the result.', parameters: args.schema },
        },
      ],
      tool_choice: { type: 'function', function: { name: 'emit' } },
    }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as {
    choices: { message: { tool_calls?: { function: { arguments: string } }[] } }[]
  }
  const raw = data.choices[0]?.message?.tool_calls?.[0]?.function?.arguments
  if (!raw) throw new Error('No tool output from OpenAI')
  return JSON.parse(raw) as T
}

/**
 * Streams plain-text deltas from the model as a ReadableStream of UTF-8 chunks,
 * so the group chat can render tokens as they arrive.
 */
export async function streamText(args: {
  system: string
  messages: ChatMessage[]
  maxTokens?: number
  temperature?: number
}): Promise<ReadableStream<Uint8Array>> {
  const key = apiKey()
  if (!key) throw new Error('AI not configured')
  const maxTokens = args.maxTokens ?? 1024
  const temperature = args.temperature ?? 0.85
  const encoder = new TextEncoder()

  if (provider() === 'anthropic') {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model(),
        max_tokens: maxTokens,
        temperature,
        system: args.system,
        stream: true,
        messages: args.messages,
      }),
    })
    if (!upstream.ok || !upstream.body) {
      throw new Error(`Anthropic ${upstream.status}: ${await upstream.text()}`)
    }
    return parseSSE(upstream.body, encoder, (json) => {
      if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
        return json.delta.text as string
      }
      return null
    })
  }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: model(),
      max_tokens: maxTokens,
      temperature,
      stream: true,
      messages: [{ role: 'system', content: args.system }, ...args.messages],
    }),
  })
  if (!upstream.ok || !upstream.body) {
    throw new Error(`OpenAI ${upstream.status}: ${await upstream.text()}`)
  }
  return parseSSE(upstream.body, encoder, (json) => json.choices?.[0]?.delta?.content ?? null)
}

/** Turns a provider SSE byte stream into a plain-text delta stream. */
function parseSSE(
  body: ReadableStream<Uint8Array>,
  encoder: TextEncoder,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extract: (json: any) => string | null,
): ReadableStream<Uint8Array> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') continue
        try {
          const text = extract(JSON.parse(payload))
          if (text) controller.enqueue(encoder.encode(text))
        } catch {
          // Ignore keep-alive or non-JSON lines.
        }
      }
    },
    cancel() {
      void reader.cancel()
    },
  })
}
