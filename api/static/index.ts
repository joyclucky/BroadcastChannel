export const config = {
  runtime: 'edge',
}

const TARGET_WHITELIST = [
  't.me',
  'telegram.org',
  'telegram.me',
  'telegram.dog',
  'cdn-telegram.org',
  'telesco.pe',
  'yandex.ru',
]

const FORWARDED_HEADERS = new Set([
  'accept',
  'accept-language',
  'if-modified-since',
  'if-none-match',
  'range',
  'user-agent',
])

function isWhitelisted(target: URL): boolean {
  return (target.protocol === 'http:' || target.protocol === 'https:')
    && TARGET_WHITELIST.some(domain => target.hostname === domain || target.hostname.endsWith(`.${domain}`))
}

function getForwardedHeaders(request: Request): Headers {
  const headers = new Headers()

  for (const [key, value] of request.headers.entries()) {
    if (FORWARDED_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  }

  return headers
}

export default async function handler(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const pathTarget = url.searchParams.get('path')
    const pathPrefix = '/static/'
    const rawPath = pathTarget ?? (url.pathname.startsWith(pathPrefix) ? url.pathname.slice(pathPrefix.length) : '')

    url.searchParams.delete('path')

    if (!rawPath) {
      return new Response('Not Found', { status: 404 })
    }

    const rawTarget = rawPath + url.search
    const target = new URL(rawTarget.startsWith('//') ? `https:${rawTarget}` : rawTarget)

    if (!isWhitelisted(target)) {
      return new Response('Proxy target not allowed', { status: 403 })
    }

    const response = await fetch(target.toString(), {
      headers: getForwardedHeaders(request),
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  }
  catch {
    return new Response('Static proxy failed', { status: 502 })
  }
}
