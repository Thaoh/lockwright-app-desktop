/* eslint-env jest */

const fs = require('fs')
const os = require('os')
const path = require('path')

const {
  LEGACY_USER_DATA_DIR_NAME,
  legacyUserDataDirs,
  migratePearPassUserData
} = require('./migrateUserData.cjs')

function makeTree() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lockwright-migrate-'))
  const destDir = path.join(root, 'Lockwright')
  const sourceDir = path.join(root, 'PearPass')
  return { root, destDir, sourceDir }
}

function writeVault(dir) {
  const vaultFile = path.join(dir, 'app-storage', 'local', 'vault', 'core')
  fs.mkdirSync(path.dirname(vaultFile), { recursive: true })
  fs.writeFileSync(vaultFile, 'vault-bytes')
  return vaultFile
}

describe('migratePearPassUserData', () => {
  let root

  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true })
    root = null
  })

  it('names the legacy folder PearPass next to Lockwright userData', () => {
    expect(LEGACY_USER_DATA_DIR_NAME).toBe('PearPass')
    expect(legacyUserDataDirs('/home/x/.config/Lockwright')).toEqual([
      '/home/x/.config/PearPass'
    ])
  })

  it('copies PearPass vault data into an empty Lockwright userData dir', () => {
    const tree = makeTree()
    root = tree.root
    writeVault(tree.sourceDir)

    const result = migratePearPassUserData({
      destDir: tree.destDir,
      sourceDirs: [tree.sourceDir]
    })

    expect(result).toEqual({
      migrated: true,
      from: tree.sourceDir,
      to: tree.destDir
    })
    expect(
      fs.readFileSync(
        path.join(tree.destDir, 'app-storage', 'local', 'vault', 'core'),
        'utf8'
      )
    ).toBe('vault-bytes')
    expect(
      fs.readFileSync(
        path.join(tree.sourceDir, 'app-storage', 'local', 'vault', 'core'),
        'utf8'
      )
    ).toBe('vault-bytes')
  })

  it('does not overwrite a Lockwright dir that already has vault data', () => {
    const tree = makeTree()
    root = tree.root
    writeVault(tree.sourceDir)
    const destVault = writeVault(tree.destDir)
    fs.writeFileSync(destVault, 'lockwright-bytes')

    const result = migratePearPassUserData({
      destDir: tree.destDir,
      sourceDirs: [tree.sourceDir]
    })

    expect(result).toEqual({ migrated: false, reason: 'dest-has-data' })
    expect(fs.readFileSync(destVault, 'utf8')).toBe('lockwright-bytes')
  })

  it('skips when PearPass has no vault data', () => {
    const tree = makeTree()
    root = tree.root
    fs.mkdirSync(tree.sourceDir, { recursive: true })
    fs.writeFileSync(path.join(tree.sourceDir, 'Cookies'), 'chrome')

    const result = migratePearPassUserData({
      destDir: tree.destDir,
      sourceDirs: [tree.sourceDir]
    })

    expect(result).toEqual({ migrated: false, reason: 'no-source' })
    expect(fs.existsSync(path.join(tree.destDir, 'app-storage'))).toBe(false)
  })

  it('still copies when Lockwright already has Chromium files but no vault', () => {
    const tree = makeTree()
    root = tree.root
    writeVault(tree.sourceDir)
    fs.mkdirSync(tree.destDir, { recursive: true })
    fs.writeFileSync(path.join(tree.destDir, 'Cookies'), 'chrome')

    const result = migratePearPassUserData({
      destDir: tree.destDir,
      sourceDirs: [tree.sourceDir]
    })

    expect(result.migrated).toBe(true)
    expect(
      fs.readFileSync(
        path.join(tree.destDir, 'app-storage', 'local', 'vault', 'core'),
        'utf8'
      )
    ).toBe('vault-bytes')
    expect(fs.readFileSync(path.join(tree.destDir, 'Cookies'), 'utf8')).toBe(
      'chrome'
    )
  })
})

describe('desktop main process wiring', () => {
  it('migrates PearPass userData after setName and before whenReady', () => {
    const main = fs.readFileSync(path.join(__dirname, 'main.cjs'), 'utf8')
    const setNameAt = main.indexOf('app.setName(pkg.productName)')
    const migrateAt = main.indexOf('migratePearPassUserData({')
    const readyAt = main.indexOf('app.whenReady()')
    expect(setNameAt).toBeGreaterThan(-1)
    expect(migrateAt).toBeGreaterThan(-1)
    expect(readyAt).toBeGreaterThan(-1)
    expect(setNameAt).toBeLessThan(migrateAt)
    expect(migrateAt).toBeLessThan(readyAt)
  })
})
