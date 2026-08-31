/**
 * The shipped native-messaging bridge is still
 * @tetherto/pearpass-lib-native-messaging-bridge. It talks to
 * ~/.pearpass/pearpass-native-messaging.sock. Desktop listens on
 * ~/.lockwright/lockwright-native-messaging.sock. Firefox then times out
 * nmGetAppIdentity because the host never reaches the app.
 */
function rewriteBridgeIdentity(source) {
  return source
    .replaceAll('".pearpass"', '".lockwright"')
    .replaceAll("'.pearpass'", "'.lockwright'")
    .replaceAll('pearpass-native-messaging', 'lockwright-native-messaging')
}

function assertLockwrightBridgeIdentity(source) {
  if (source.includes('pearpass-native-messaging')) {
    throw new Error(
      'bridge still names pearpass-native-messaging; desktop listens on lockwright-native-messaging'
    )
  }
  if (source.includes('".pearpass"') || source.includes("'.pearpass'")) {
    throw new Error(
      'bridge still uses .pearpass; desktop IPC lives under .lockwright'
    )
  }
  if (!source.includes('lockwright-native-messaging')) {
    throw new Error('bridge missing lockwright-native-messaging socket name')
  }
  if (!source.includes('.lockwright')) {
    throw new Error('bridge missing .lockwright socket dir')
  }
}

module.exports = {
  assertLockwrightBridgeIdentity,
  rewriteBridgeIdentity
}
