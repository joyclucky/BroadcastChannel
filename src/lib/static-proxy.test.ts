import { describe, expect, it } from 'vitest'
import { isStaticProxyWhitelisted, resolveStaticProxyTarget } from './static-proxy'

describe('static proxy target handling', () => {
  it('accepts whitelisted Telegram CDN targets', () => {
    expect(isStaticProxyWhitelisted(new URL('https://cdn-telegram.org/a.png'))).toBe(true)
  })

  it('continues to accept t.me and telegram.me targets', () => {
    expect(isStaticProxyWhitelisted(new URL('https://t.me/i/emoji/1.webp'))).toBe(true)
    expect(isStaticProxyWhitelisted(new URL('https://telegram.me/i/emoji/1.webp'))).toBe(true)
  })

  it('rejects lookalike domains', () => {
    expect(isStaticProxyWhitelisted(new URL('https://eviltelegram.org/a.png'))).toBe(false)
  })

  it('normalizes protocol-relative targets to HTTPS', () => {
    expect(resolveStaticProxyTarget('//cdn-telegram.org/a.png').toString()).toBe('https://cdn-telegram.org/a.png')
  })
})
