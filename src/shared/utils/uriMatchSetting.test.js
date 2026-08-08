import {
  buildLoginUris,
  fromVaultUriMatch,
  resolveUriMatchType,
  toVaultUriMatch
} from './uriMatchSetting'
import { URI_MATCH_TYPES } from '../constants/uriMatch'

describe('uriMatchSetting', () => {
  describe('fromVaultUriMatch / toVaultUriMatch', () => {
    it('maps domain ↔ baseDomain for vault storage', () => {
      expect(toVaultUriMatch(URI_MATCH_TYPES.DOMAIN)).toBe('baseDomain')
      expect(fromVaultUriMatch('baseDomain')).toBe(URI_MATCH_TYPES.DOMAIN)
      expect(toVaultUriMatch(URI_MATCH_TYPES.HOST)).toBe(URI_MATCH_TYPES.HOST)
      expect(fromVaultUriMatch('exact')).toBe(URI_MATCH_TYPES.EXACT)
      expect(fromVaultUriMatch('startsWith')).toBe(URI_MATCH_TYPES.STARTS_WITH)
      expect(fromVaultUriMatch('unknown')).toBeNull()
      expect(toVaultUriMatch('regex')).toBe('baseDomain')
    })
  })

  describe('resolveUriMatchType', () => {
    it('prefers record.data.uris match over default domain', () => {
      const record = {
        id: 'rec-1',
        data: {
          websites: ['https://example.com'],
          uris: [{ uri: 'https://example.com', match: 'host' }]
        }
      }

      expect(resolveUriMatchType(record, 'https://example.com')).toBe(
        URI_MATCH_TYPES.HOST
      )
      expect(resolveUriMatchType(record, 'example.com')).toBe(
        URI_MATCH_TYPES.HOST
      )
    })

    it('maps baseDomain from vault uris to domain UI type', () => {
      const record = {
        data: {
          uris: [{ uri: 'https://example.com', match: 'baseDomain' }]
        }
      }

      expect(resolveUriMatchType(record, 'https://example.com')).toBe(
        URI_MATCH_TYPES.DOMAIN
      )
    })

    it('defaults to domain when uris absent or website missing', () => {
      expect(
        resolveUriMatchType(
          { id: 'rec-1', data: { websites: ['https://example.com'] } },
          'https://example.com'
        )
      ).toBe(URI_MATCH_TYPES.DOMAIN)

      expect(
        resolveUriMatchType(
          {
            id: 'rec-1',
            data: {
              uris: [{ uri: 'https://other.com', match: 'exact' }]
            }
          },
          'https://example.com'
        )
      ).toBe(URI_MATCH_TYPES.DOMAIN)

      expect(resolveUriMatchType(null, 'https://example.com')).toBe(
        URI_MATCH_TYPES.DOMAIN
      )
    })
  })

  describe('buildLoginUris', () => {
    it('maps domain→baseDomain and normalizes with addHttps', () => {
      expect(
        buildLoginUris([
          { website: 'example.com', matchType: URI_MATCH_TYPES.DOMAIN },
          {
            website: 'https://other.com/path',
            matchType: URI_MATCH_TYPES.HOST
          },
          { website: '  ', matchType: URI_MATCH_TYPES.EXACT },
          { website: 'exact.com', matchType: URI_MATCH_TYPES.EXACT },
          {
            website: 'prefix.com/x',
            matchType: URI_MATCH_TYPES.STARTS_WITH
          }
        ])
      ).toEqual([
        { uri: 'https://example.com', match: 'baseDomain' },
        { uri: 'https://other.com/path', match: 'host' },
        { uri: 'https://exact.com', match: 'exact' },
        { uri: 'https://prefix.com/x', match: 'startsWith' }
      ])
    })

    it('defaults invalid/missing matchType to baseDomain', () => {
      expect(buildLoginUris([{ website: 'a.com' }])).toEqual([
        { uri: 'https://a.com', match: 'baseDomain' }
      ])
      expect(
        buildLoginUris([{ website: 'a.com', matchType: 'regex' }])
      ).toEqual([{ uri: 'https://a.com', match: 'baseDomain' }])
    })

    it('returns empty array for non-array input', () => {
      expect(buildLoginUris(null)).toEqual([])
      expect(buildLoginUris(undefined)).toEqual([])
    })
  })
})
