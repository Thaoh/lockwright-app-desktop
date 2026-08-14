import {
  hostnameFromUrl,
  resolveHistoryContext
} from './passwordGeneratorHistoryContext'

describe('resolveHistoryContext', () => {
  it('prefers a site hostname from a website URL', () => {
    expect(
      resolveHistoryContext({
        title: 'My Login',
        websiteUrl: 'https://example.com/path'
      })
    ).toEqual({ contextLabel: 'example.com', contextKind: 'site' })
  })

  it('accepts a schemeless host via addHttps', () => {
    expect(resolveHistoryContext({ websiteUrl: 'example.com' })).toEqual({
      contextLabel: 'example.com',
      contextKind: 'site'
    })
  })

  it('falls back to the entry title', () => {
    expect(resolveHistoryContext({ title: '  Wi-Fi Home  ' })).toEqual({
      contextLabel: 'Wi-Fi Home',
      contextKind: 'entry'
    })
  })

  it('returns null when neither label is usable', () => {
    expect(resolveHistoryContext({})).toBeNull()
    expect(resolveHistoryContext({ title: '   ', websiteUrl: '' })).toBeNull()
  })
})

describe('hostnameFromUrl', () => {
  it('returns null for empty or invalid values', () => {
    expect(hostnameFromUrl('')).toBeNull()
    expect(hostnameFromUrl(null)).toBeNull()
    expect(hostnameFromUrl('not a url ://')).toBeNull()
  })
})
