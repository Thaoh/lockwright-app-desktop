import { addHttps } from '../../utils/addHttps'
import { URI_MATCH_TYPES } from '../constants/uriMatch'

const VALID_MATCH_TYPES = new Set(Object.values(URI_MATCH_TYPES))

/** Vault schema uses Bitwarden-style `baseDomain`; UI uses `domain`. */
const VAULT_MATCH_BASE_DOMAIN = 'baseDomain'

const isValidMatchType = (value) => VALID_MATCH_TYPES.has(value)

/**
 * Map vault/lib-vault match string → UI UriMatchType.
 * @param {unknown} vaultMatch
 * @returns {string|null}
 */
export const fromVaultUriMatch = (vaultMatch) => {
  if (vaultMatch === VAULT_MATCH_BASE_DOMAIN) return URI_MATCH_TYPES.DOMAIN
  if (isValidMatchType(vaultMatch)) return vaultMatch
  return null
}

/**
 * Map UI UriMatchType → vault/lib-vault match string.
 * @param {string} matchType
 * @returns {string}
 */
export const toVaultUriMatch = (matchType) => {
  if (matchType === URI_MATCH_TYPES.DOMAIN) return VAULT_MATCH_BASE_DOMAIN
  if (isValidMatchType(matchType)) return matchType
  return VAULT_MATCH_BASE_DOMAIN
}

/**
 * @param {string|null|undefined} website
 * @returns {string|null}
 */
const normalizeWebsiteKey = (website) => {
  if (!website || typeof website !== 'string') return null
  const trimmed = website.trim()
  if (!trimmed) return null
  return addHttps(trimmed) || null
}

/**
 * @param {{ data?: { uris?: Array<{ uri?: string, match?: string }> } }} record
 * @param {string|null} websiteKey
 * @returns {string|null}
 */
const matchFromRecordUris = (record, websiteKey) => {
  if (!websiteKey) return null
  const uris = record?.data?.uris
  if (!Array.isArray(uris) || uris.length === 0) return null
  for (const entry of uris) {
    if (!entry || typeof entry.uri !== 'string') continue
    const entryKey = normalizeWebsiteKey(entry.uri)
    if (entryKey && entryKey === websiteKey) {
      return fromVaultUriMatch(entry.match)
    }
  }
  return null
}

/**
 * Resolve match type for a website row.
 * Prefers vault `record.data.uris`; defaults to domain (no AppPreferences on desktop).
 *
 * @param {{ id?: string, data?: { uris?: Array<{ uri?: string, match?: string }> } }|string|null|undefined} recordOrId
 * @param {string} website
 * @returns {string}
 */
export const resolveUriMatchType = (recordOrId, website) => {
  const key = normalizeWebsiteKey(website)

  if (recordOrId && typeof recordOrId === 'object') {
    const fromVault = matchFromRecordUris(recordOrId, key)
    if (fromVault) return fromVault
  }

  return URI_MATCH_TYPES.DOMAIN
}

/**
 * Build v2 `uris` entries from website rows (UI match types → vault).
 * Uses `addHttps` so websites/uris stay consistent with the create/edit save path.
 *
 * @param {Array<{ website?: string, matchType?: string }>} websiteRows
 * @returns {Array<{ uri: string, match: string }>}
 */
export const buildLoginUris = (websiteRows) => {
  /** @type {Array<{ uri: string, match: string }>} */
  const uris = []
  if (!Array.isArray(websiteRows)) return uris
  for (const row of websiteRows) {
    const trimmed = typeof row?.website === 'string' ? row.website.trim() : ''
    if (!trimmed) continue
    const uri = addHttps(trimmed)
    if (!uri) continue
    const matchType =
      row.matchType && isValidMatchType(row.matchType)
        ? row.matchType
        : URI_MATCH_TYPES.DOMAIN
    uris.push({ uri, match: toVaultUriMatch(matchType) })
  }
  return uris
}
