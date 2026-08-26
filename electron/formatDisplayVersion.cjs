function normalizeSha6(gitSha) {
  if (typeof gitSha !== 'string') {
    return 'unknown'
  }

  const hex = gitSha.trim().toLowerCase().replace(/[^0-9a-f]/g, '')
  if (hex.length < 6) {
    return 'unknown'
  }

  return hex.slice(0, 6)
}

function formatDisplayVersion(version, gitSha) {
  if (typeof version !== 'string' || version.length === 0) {
    return ''
  }

  return `${version}-${normalizeSha6(gitSha)}`
}

function readGitSha6(repoRoot) {
  if (process.env.LOCKWRIGHT_GIT_SHA) {
    return normalizeSha6(process.env.LOCKWRIGHT_GIT_SHA)
  }

  const fs = require('fs')
  const path = require('path')
  const baked = path.join(__dirname, 'generated-git-sha.json')
  try {
    const data = JSON.parse(fs.readFileSync(baked, 'utf8'))
    return normalizeSha6(data.sha)
  } catch {
    // Dev / unpackaged: read this repo's HEAD.
  }

  try {
    const { execSync } = require('child_process')
    const raw = execSync('git rev-parse HEAD', {
      cwd: repoRoot || path.join(__dirname, '..'),
      encoding: 'utf8'
    })
    return normalizeSha6(raw)
  } catch {
    return 'unknown'
  }
}

module.exports = { formatDisplayVersion, normalizeSha6, readGitSha6 }
