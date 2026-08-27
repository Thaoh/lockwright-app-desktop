/* eslint-env jest */

const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  adoptInheritedVault,
  pickRuntimeStorageDir
} = require('./pickRuntimeStorage.cjs')

const OLD_ID = 'oldpearpassdkey11111111111111111111111111111111111'
const NEW_ID = 'newlockwrightdkey222222222222222222222222222222222'

function writeVault(storageRoot) {
  const vaultFile = path.join(storageRoot, 'vault', 'core')
  fs.mkdirSync(path.dirname(vaultFile), { recursive: true })
  fs.writeFileSync(vaultFile, 'vault-bytes')
  return vaultFile
}

describe('pickRuntimeStorageDir', () => {
  let root

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
    root = null
  })

  it('opens app-storage/by-dkey/{id} when that is the copied PearPass vault', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-pick-'))
    const userDataDir = path.join(root, 'Lockwright')
    const inherited = path.join(userDataDir, 'app-storage', 'by-dkey', OLD_ID)
    writeVault(inherited)

    expect(
      pickRuntimeStorageDir({
        userDataDir,
        upgrade: `pear://${NEW_ID}`
      })
    ).toBe(inherited)
  })

  it('opens by-dkey/{id} even when the upgrade link is null (Windows / no OTA)', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-pick-'))
    const userDataDir = path.join(root, 'Lockwright')
    const inherited = path.join(userDataDir, 'app-storage', 'by-dkey', OLD_ID)
    writeVault(inherited)

    expect(
      pickRuntimeStorageDir({
        userDataDir,
        upgrade: null
      })
    ).toBe(inherited)
  })

  it('prefers app-storage/local when that folder already has a vault', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-pick-'))
    const userDataDir = path.join(root, 'Lockwright')
    const local = path.join(userDataDir, 'app-storage', 'local')
    writeVault(local)
    writeVault(path.join(userDataDir, 'app-storage', 'by-dkey', OLD_ID))

    expect(
      pickRuntimeStorageDir({
        userDataDir,
        upgrade: null
      })
    ).toBe(local)
  })

  it('prefers the inherited by-dkey over the current upgrade link id', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-pick-'))
    const userDataDir = path.join(root, 'Lockwright')
    const inherited = path.join(userDataDir, 'app-storage', 'by-dkey', OLD_ID)
    const current = path.join(userDataDir, 'app-storage', 'by-dkey', NEW_ID)
    writeVault(inherited)
    writeVault(current)

    expect(
      pickRuntimeStorageDir({
        userDataDir,
        upgrade: `pear://${NEW_ID}`
      })
    ).toBe(inherited)
  })

  it('falls back to app-storage/local when there is no vault and no upgrade link', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-pick-'))
    const userDataDir = path.join(root, 'Lockwright')

    expect(
      pickRuntimeStorageDir({
        userDataDir,
        upgrade: null
      })
    ).toBe(path.join(userDataDir, 'app-storage', 'local'))
  })
})

describe('adoptInheritedVault', () => {
  let root

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
    root = null
  })

  it('copies PearPass by-dkey/{id} into Lockwright userData when dest has no inherited vault', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-adopt-'))
    const destDir = path.join(root, 'Lockwright')
    const sourceDir = path.join(root, 'PearPass')
    const sourceVault = path.join(sourceDir, 'app-storage', 'by-dkey', OLD_ID)
    writeVault(sourceVault)
    writeVault(path.join(destDir, 'app-storage', 'by-dkey', NEW_ID))

    const adopted = adoptInheritedVault({
      destDir,
      sourceDirs: [sourceDir],
      upgrade: `pear://${NEW_ID}`
    })

    const destInherited = path.join(destDir, 'app-storage', 'by-dkey', OLD_ID)
    expect(adopted).toBe(destInherited)
    expect(fs.readFileSync(path.join(destInherited, 'vault', 'core'), 'utf8')).toBe(
      'vault-bytes'
    )
    expect(fs.readFileSync(path.join(sourceVault, 'vault', 'core'), 'utf8')).toBe(
      'vault-bytes'
    )
  })
})

describe('desktop main process wiring', () => {
  it('adopts an inherited PearPass by-dkey vault before opening storage', () => {
    const main = fs.readFileSync(path.join(__dirname, 'main.cjs'), 'utf8')
    expect(main).toMatch(/pickRuntimeStorage/)
    expect(main).toMatch(/adoptInheritedVault\(/)
    const adoptAt = main.indexOf('adoptInheritedVault(')
    const fallbackLocalAt = main.indexOf(
      "path.join(storageDir, 'app-storage', 'local')"
    )
    expect(adoptAt).toBeGreaterThan(-1)
    expect(fallbackLocalAt).toBeGreaterThan(-1)
    expect(adoptAt).toBeLessThan(fallbackLocalAt)
  })
})
