import { addHttps } from './addHttps'

/**
 * Derive generator-history context for a Use/insert action.
 * Prefer a site hostname when a website URL is present; otherwise the entry title.
 * Returns null when neither is usable (markHistoryUsed is then a no-op).
 *
 * @param {{ title?: unknown, websiteUrl?: unknown }} [input]
 * @returns {{ contextLabel: string, contextKind: 'site'|'entry' } | null}
 */
export const resolveHistoryContext = ({ title, websiteUrl } = {}) => {
  const hostname = hostnameFromUrl(websiteUrl)
  if (hostname) {
    return { contextLabel: hostname, contextKind: 'site' }
  }

  const label = typeof title === 'string' ? title.trim() : ''
  if (label) {
    return { contextLabel: label, contextKind: 'entry' }
  }

  return null
}

/**
 * @param {unknown} url
 * @returns {string | null}
 */
export const hostnameFromUrl = (url) => {
  if (typeof url !== 'string' || !url.trim()) return null
  try {
    const hostname = new URL(addHttps(url.trim())).hostname
    return hostname || null
  } catch {
    return null
  }
}
