#!/usr/bin/env node
/* eslint-disable no-console -- must print install guidance to stderr */
// Blocks installs (and other lifecycle entrypoints) unless the package manager is pnpm.
// Wired as package.json "preinstall" so npm/yarn/bun fail before they can mutate the tree.
// Complements package.json#devEngines.packageManager and pnpm-workspace.yaml#allowBuilds.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const userAgent = process.env.npm_config_user_agent ?? ''
const execPath = process.env.npm_execpath ?? ''
const isPnpm =
  userAgent.startsWith('pnpm/') ||
  /[\\/]pnpm(?:\.(?:cjs|js|mjs))?$/i.test(execPath) ||
  /[\\/]@pnpm[\\/]/.test(execPath)

if (isPnpm) {
  process.exit(0)
}

const detected =
  userAgent.split(' ')[0] ||
  (execPath ? `unknown (${execPath})` : 'unknown package manager')

let pinned = 'latest'
try {
  const pkgPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'package.json'
  )
  const { packageManager } = JSON.parse(readFileSync(pkgPath, 'utf8'))
  if (
    typeof packageManager === 'string' &&
    packageManager.startsWith('pnpm@')
  ) {
    pinned = packageManager.slice('pnpm@'.length)
  }
} catch {
  // ignore — fall back to "latest"
}

console.error(`
This project uses pnpm only. Detected: ${detected}

  Use:  pnpm install
  Get:  corepack enable && corepack prepare pnpm@${pinned} --activate
`)
process.exit(1)
