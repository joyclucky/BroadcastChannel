import { describe, expect, it } from 'vitest'
import vercelConfig from './vercel.json'

describe('vercel configuration', () => {
  it('does not bypass the Astro static proxy route', () => {
    const rewrites = (vercelConfig as { rewrites?: unknown[] }).rewrites ?? []

    expect(rewrites).not.toContainEqual({
      source: '/static/:path*',
      destination: '/api/static?path=:path*',
    })
  })
})
