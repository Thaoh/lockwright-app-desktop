type VaultUriEntry = {
    uri?: string
    match?: string
}

type VaultRecord = {
    id: string
    type: string
    isFavorite?: boolean
    data?: {
        title?: string
        username?: string
        email?: string
        websites?: Array<string | { website?: string | undefined }>
        uris?: VaultUriEntry[]
        [key: string]: unknown
    }
    folder?: string | null
}

export enum PassType {
  Password = 'password',
  PassPhrase = 'passPhrase'
}

export type { VaultRecord }
