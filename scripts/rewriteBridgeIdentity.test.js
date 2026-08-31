/* eslint-env jest */

const {
  assertLockwrightBridgeIdentity,
  rewriteBridgeIdentity
} = require('./rewriteBridgeIdentity.cjs')

// Shape of @tetherto/pearpass-lib-native-messaging-bridge after esbuild.
const PEARPASS_BRIDGE_SNIPPET = `
var IPC_SOCKET_DIR_NAME = ".pearpass";
var getIpcPath = (socketName) => {
  return path.join(os.homedir(), IPC_SOCKET_DIR_NAME, \`\${socketName}.sock\`);
};
this.socketPath = getIpcPath("pearpass-native-messaging");
const logDir = path.join(os.homedir(), ".pearpass", "logs");
`

describe('rewriteBridgeIdentity', () => {
  it('points the native host at Lockwright IPC, not PearPass', () => {
    const out = rewriteBridgeIdentity(PEARPASS_BRIDGE_SNIPPET)
    expect(out).toContain('IPC_SOCKET_DIR_NAME = ".lockwright"')
    expect(out).toContain('getIpcPath("lockwright-native-messaging")')
    expect(out).not.toContain('.pearpass')
    expect(out).not.toContain('pearpass-native-messaging')
    expect(() => assertLockwrightBridgeIdentity(out)).not.toThrow()
  })

  it('rejects a PearPass-identity bundle', () => {
    expect(() =>
      assertLockwrightBridgeIdentity(PEARPASS_BRIDGE_SNIPPET)
    ).toThrow(/pearpass-native-messaging|\.pearpass/)
  })
})
