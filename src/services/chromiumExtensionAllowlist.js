import { CHROMIUM_EXTENSION_ID } from '@tetherto/pearpass-lib-constants'

import { LOCAL_STORAGE_KEYS } from '../constants/localStorage'

/** Chromium extension IDs are 32 chars from a–p (encoded public key). */
export const CHROMIUM_EXTENSION_ID_PATTERN = /^[a-p]{32}$/

const LEGACY_STORAGE_KEY = 'CHROMIUM_EXTENSION_ID'

/**
 * @param {string} id
 * @returns {boolean}
 */
export const isValidChromiumExtensionId = (id) =>
  typeof id === 'string' && CHROMIUM_EXTENSION_ID_PATTERN.test(id)

/**
 * Parse a user-entered allowlist (comma / whitespace / newline separated).
 * @param {string} text
 * @returns {string[]}
 */
export const parseChromiumExtensionIdsText = (text) => {
  if (typeof text !== 'string' || !text.trim()) return []
  return text
    .split(/[\s,]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * @returns {string[]}
 */
export const getChromiumExtensionIds = () => {
  const raw = localStorage.getItem(
    LOCAL_STORAGE_KEYS.CHROMIUM_EXTENSION_ALLOWLIST
  )
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const ids = [
          ...new Set(
            parsed
              .filter((id) => typeof id === 'string')
              .map((id) => id.trim().toLowerCase())
              .filter(isValidChromiumExtensionId)
          )
        ]
        if (ids.length > 0) return ids
      }
    } catch {
      // fall through to legacy / default
    }
  }

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacy && isValidChromiumExtensionId(legacy.trim().toLowerCase())) {
    return [legacy.trim().toLowerCase()]
  }

  return [CHROMIUM_EXTENSION_ID]
}

/**
 * Persist approved Chromium extension IDs used in native-messaging allowed_origins.
 * @param {string[]} ids
 * @returns {{ ok: true, ids: string[] } | { ok: false, error: string }}
 */
export const setChromiumExtensionIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return {
      ok: false,
      error: 'At least one Chromium extension ID is required'
    }
  }

  const normalized = [
    ...new Set(
      ids
        .filter((id) => typeof id === 'string')
        .map((id) => id.trim().toLowerCase())
    )
  ]

  const invalid = normalized.filter((id) => !isValidChromiumExtensionId(id))
  if (invalid.length > 0) {
    return {
      ok: false,
      error: `Invalid Chromium extension ID(s): ${invalid.join(', ')}`
    }
  }

  localStorage.setItem(
    LOCAL_STORAGE_KEYS.CHROMIUM_EXTENSION_ALLOWLIST,
    JSON.stringify(normalized)
  )
  // Keep legacy single-value key in sync for older readers.
  localStorage.setItem(LEGACY_STORAGE_KEY, normalized[0])

  return { ok: true, ids: normalized }
}

/**
 * Format stored IDs for a text field.
 * @param {string[]} [ids]
 * @returns {string}
 */
export const formatChromiumExtensionIdsText = (
  ids = getChromiumExtensionIds()
) => ids.join('\n')
