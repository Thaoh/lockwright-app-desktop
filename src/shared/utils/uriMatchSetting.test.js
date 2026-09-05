import {
  buildLoginUris,
  fromVaultUriMatch,
  resolveUriMatchType,
  toVaultUriMatch,
  websiteRowsFromRecord
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
    it('stores the trimmed URI as typed', () => {
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
          },
          {
            website: 'androidapp://com.twitter.android',
            matchType: URI_MATCH_TYPES.HOST
          }
        ])
      ).toEqual([
        { uri: 'example.com', match: 'baseDomain' },
        { uri: 'https://other.com/path', match: 'host' },
        { uri: 'exact.com', match: 'exact' },
        { uri: 'prefix.com/x', match: 'startsWith' },
        { uri: 'androidapp://com.twitter.android', match: 'host' }
      ])
    })

    it('defaults invalid/missing matchType to baseDomain', () => {
      expect(buildLoginUris([{ website: 'a.com' }])).toEqual([
        { uri: 'a.com', match: 'baseDomain' }
      ])
      expect(
        buildLoginUris([{ website: 'a.com', matchType: 'regex' }])
      ).toEqual([{ uri: 'a.com', match: 'baseDomain' }])
    })

    it('returns empty array for non-array input', () => {
      expect(buildLoginUris(null)).toEqual([])
      expect(buildLoginUris(undefined)).toEqual([])
    })

    it('keeps stored match when the form row omitted matchType', () => {
      expect(
        buildLoginUris(
          [{ website: 'https://example.com' }],
          [{ uri: 'https://example.com', match: 'exact' }]
        )
      ).toEqual([{ uri: 'https://example.com', match: 'exact' }])
    })

    it('unwraps glued https on androidapp URIs so save repairs vault rows', () => {
      expect(
        buildLoginUris([
          {
            website: 'https://androidapp://com.twitter.android',
            matchType: URI_MATCH_TYPES.HOST
          }
        ])
      ).toEqual([{ uri: 'androidapp://com.twitter.android', match: 'host' }])
    })

    it('keeps stored match when the typed URI is schemeless and vault has https', () => {
      expect(
        buildLoginUris(
          [{ website: 'example.com' }],
          [{ uri: 'https://example.com', match: 'exact' }]
        )
      ).toEqual([{ uri: 'example.com', match: 'exact' }])
    })
  })

  describe('websiteRowsFromRecord', () => {
    it('keeps stored match type on each website row', () => {
      expect(
        websiteRowsFromRecord({
          data: {
            websites: ['https://example.com', 'https://other.com'],
            uris: [
              { uri: 'https://example.com', match: 'host' },
              { uri: 'https://other.com', match: 'baseDomain' }
            ]
          }
        })
      ).toEqual([
        { website: 'https://example.com', matchType: URI_MATCH_TYPES.HOST },
        { website: 'https://other.com', matchType: URI_MATCH_TYPES.DOMAIN }
      ])
    })

    it('falls back to uris when websites is empty', () => {
      expect(
        websiteRowsFromRecord({
          data: {
            websites: [],
            uris: [{ uri: 'https://dashboard.stripe.com', match: 'exact' }]
          }
        })
      ).toEqual([
        {
          website: 'https://dashboard.stripe.com',
          matchType: URI_MATCH_TYPES.EXACT
        }
      ])
    })

    it('returns one empty domain row when the record has no sites', () => {
      expect(websiteRowsFromRecord(null)).toEqual([
        { website: '', matchType: URI_MATCH_TYPES.DOMAIN }
      ])
    })

    it('shows unwrapped androidapp URIs in edit rows', () => {
      expect(
        websiteRowsFromRecord({
          data: {
            websites: ['https://androidapp://com.twitter.android'],
            uris: [
              {
                uri: 'https://androidapp://com.twitter.android',
                match: 'host'
              }
            ]
          }
        })
      ).toEqual([
        {
          website: 'androidapp://com.twitter.android',
          matchType: URI_MATCH_TYPES.HOST
        }
      ])
    })
  })
})
