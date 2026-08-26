const fs = require('fs')
const path = require('path')

const LEGACY_USER_DATA_DIR_NAME = 'PearPass'

const VAULT_DIR_NAMES = [
  'app-storage',
  'encryption',
  'vault',
  'vaults',
  'pear-runtime'
]

function dirHasEntries(dir, fsImpl) {
  try {
    if (!fsImpl.existsSync(dir)) return false
    if (!fsImpl.statSync(dir).isDirectory()) return false
    return fsImpl.readdirSync(dir).length > 0
  } catch {
    return false
  }
}

function hasVaultData(root, fsImpl) {
  if (!root || !dirHasEntries(root, fsImpl)) return false
  return VAULT_DIR_NAMES.some((name) =>
    dirHasEntries(path.join(root, name), fsImpl)
  )
}

function legacyUserDataDirs(destDir) {
  if (!destDir) return []
  return [path.join(path.dirname(destDir), LEGACY_USER_DATA_DIR_NAME)]
}

function migratePearPassUserData({
  destDir,
  sourceDirs,
  fsImpl = fs,
  logger
} = {}) {
  if (!destDir) {
    return { migrated: false, reason: 'no-dest' }
  }

  if (hasVaultData(destDir, fsImpl)) {
    return { migrated: false, reason: 'dest-has-data' }
  }

  const sources = (sourceDirs || []).filter(
    (dir) => dir && path.resolve(dir) !== path.resolve(destDir)
  )
  const from = sources.find((dir) => hasVaultData(dir, fsImpl))
  if (!from) {
    return { migrated: false, reason: 'no-source' }
  }

  fsImpl.mkdirSync(destDir, { recursive: true })
  fsImpl.cpSync(from, destDir, { recursive: true, force: false })
  logger?.info?.('[MAIN]', 'Migrated PearPass userData', { from, to: destDir })
  return { migrated: true, from, to: destDir }
}

module.exports = {
  LEGACY_USER_DATA_DIR_NAME,
  hasVaultData,
  legacyUserDataDirs,
  migratePearPassUserData
}
