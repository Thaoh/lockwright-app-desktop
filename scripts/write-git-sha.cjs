#!/usr/bin/env node
/**
 * Bake this desktop repo's HEAD into electron/generated-git-sha.json
 * so packaged builds can show X.Y.Z-{sha6} without a .git directory.
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const out = path.join(root, 'electron', 'generated-git-sha.json')

let sha = process.env.LOCKWRIGHT_GIT_SHA || ''
if (!sha) {
  sha = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim()
}

if (!/^[0-9a-fA-F]{6,}$/.test(sha.trim())) {
  console.error('write-git-sha: not a git sha')
  process.exit(1)
}

fs.writeFileSync(out, `${JSON.stringify({ sha: sha.trim() }, null, 2)}\n`)
