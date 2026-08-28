#!/usr/bin/env node
/**
 * Forgejo v0.0.5: `pnpm list --json --depth Infinity` + the builder logger
 * threw RangeError: Invalid string length after module collection.
 * Local `node` packs used the traversal collector and succeeded.
 */
const { Logger } = require('builder-util/out/log')
const packageManager = require('app-builder-lib/out/node-module-collector/packageManager')

function forceTraversalCollector() {
  packageManager.detectPackageManager = async function detectPackageManager() {
    return {
      pm: packageManager.PM.TRAVERSAL,
      resolvedDirectory: undefined,
      corepackConfig: undefined,
      detectionMethod: 'forced-traversal'
    }
  }
}

forceTraversalCollector()

const LOG_CAP = 8000

function capValue(value) {
  if (typeof value !== 'string' || value.length <= LOG_CAP) return value
  return `${value.slice(0, LOG_CAP)}\n...[truncated ${value.length - LOG_CAP} chars]`
}

function capFields(fields) {
  if (fields == null || typeof fields !== 'object') return fields
  const next = {}
  for (const [key, value] of Object.entries(fields)) {
    next[key] = capValue(value)
  }
  return next
}

const origCreateMessage = Logger.createMessage.bind(Logger)
Logger.createMessage = function createMessage(message, fields, level, color, pad) {
  return origCreateMessage(
    capValue(typeof message === 'string' ? message : String(message)),
    capFields(fields),
    level,
    color,
    pad
  )
}

module.exports = { LOG_CAP, capValue, capFields, forceTraversalCollector }

if (require.main === module) {
  require('electron-builder/cli')
}
