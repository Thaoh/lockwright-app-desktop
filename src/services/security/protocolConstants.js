/**
 * Protocol domain separation tags for handshake transcript binding
 * These prevent cross-protocol signature replay attacks
 */
export const PROTOCOL_TAGS = {
  CLIENT_FINISH: 'lockwright/handshake/v1/clientFinish'
}
