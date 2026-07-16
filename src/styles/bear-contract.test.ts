import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const theme = readFileSync(new URL('./app/theme.css', import.meta.url), 'utf8')
const base = readFileSync(new URL('./app/base.css', import.meta.url), 'utf8')
const feed = readFileSync(new URL('./app/feed.css', import.meta.url), 'utf8')
const typography = readFileSync(new URL('./content/typography.css', import.meta.url), 'utf8')
const syntax = readFileSync(new URL('./content/syntax.css', import.meta.url), 'utf8')
const sepia = readFileSync(new URL('../../public/themes/sepia.css', import.meta.url), 'utf8')
const aria = readFileSync(new URL('../../public/themes/aria.css', import.meta.url), 'utf8')
const terminal = readFileSync(new URL('../../public/themes/terminal-base.css', import.meta.url), 'utf8')

function compact(css: string): string {
  return css.replace(/\s+/g, ' ').trim()
}

describe('bear CSS contract', () => {
  it('keeps the twelve Bear variables at their contract values', () => {
    const variables = {
      '--width': '800px',
      '--font-main': 'Verdana, sans-serif',
      '--font-secondary': 'Verdana, sans-serif',
      '--font-scale': '1em',
      '--background-color': '#fff',
      '--heading-color': '#222',
      '--text-color': '#444',
      '--link-color': '#3273dc',
      '--visited-color': '#8b6fcb',
      '--code-background-color': '#f2f2f2',
      '--code-color': '#222',
      '--blockquote-color': '#222',
    }

    for (const [name, value] of Object.entries(variables)) {
      expect(theme).toContain(`${name}: ${value};`)
    }
  })

  it('keeps Bear content width inside tokenized border-box padding', () => {
    const css = compact(`${theme} ${base}`)

    expect(css).toContain('--body-padding-inline: 20px;')
    expect(css).toContain('width: 100%; max-width: calc(var(--width) + var(--body-padding-inline) + var(--body-padding-inline));')
    expect(css).toContain('padding-block: 20px; padding-inline: var(--body-padding-inline);')
  })

  it('limits the default visited color to feed post metadata', () => {
    expect(compact(base)).toContain('a:link, a:visited { color: var(--link-color); }')
    expect(compact(base)).not.toContain('a:visited { color: var(--visited-color); }')
    expect(compact(feed)).toContain('body.feed .post-meta a:visited { color: var(--visited-color); }')
  })

  it('keeps Bear inline and highlighted code geometry', () => {
    expect(compact(typography)).toContain(':not(pre) > code { padding: 2px; border-radius: 3px;')
    expect(compact(syntax)).toContain('.highlight, .code { overflow-x: auto; margin-block: 1em; padding: 1px 15px; border-radius: 3px;')
    expect(compact(syntax)).toContain('.highlight pre, .code pre { margin: 0; padding: 0; }')
  })

  it('keeps built-in theme padding tokens', () => {
    expect(sepia).toContain('--body-padding-inline: 1.25rem;')
    expect(compact(sepia)).toContain('padding-inline: var(--body-padding-inline);')
    expect(compact(sepia)).toContain('.highlight pre, .code pre { margin: 0; padding: 0; border: 0;')

    expect(aria).toContain('--body-padding-inline: 1.5rem;')
    expect(aria).toContain('--body-padding-inline: 1rem;')
    expect(aria).toContain('--body-padding-inline: 0.875rem;')
    expect(compact(aria)).toContain('padding: 0 var(--body-padding-inline) 1.5rem;')

    expect(terminal).toContain('--body-padding-inline: clamp(1rem, 4vw, 2.5rem);')
    expect(terminal).toContain('--body-padding-inline: 1rem;')
    expect(compact(terminal)).toContain('padding: var(--body-padding-inline);')
  })
})
