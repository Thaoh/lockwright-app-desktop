export const URI_MATCH_TYPES = {
  DOMAIN: 'domain',
  HOST: 'host',
  STARTS_WITH: 'startsWith',
  EXACT: 'exact'
} as const

export type UriMatchType =
  (typeof URI_MATCH_TYPES)[keyof typeof URI_MATCH_TYPES]
