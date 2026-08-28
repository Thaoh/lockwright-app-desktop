/* eslint-env jest */

const { Logger } = require('builder-util/out/log')
const path = require('path')
const { LOG_CAP, capValue, capFields } = require('./run-electron-builder.cjs')
const {
  detectPackageManager,
  PM
} = require('app-builder-lib/out/node-module-collector/packageManager')

describe('run-electron-builder log cap', () => {
  it('shortens a field past LOG_CAP so createMessage does not see the raw blob', () => {
    const huge = `${'path/to/file\n'.repeat(LOG_CAP)}\nstack`
    expect(huge.length).toBeGreaterThan(LOG_CAP)

    const capped = capValue(huge)
    expect(capped.length).toBeLessThan(huge.length)
    expect(capped).toMatch(/\[truncated \d+ chars\]/)
    expect(capped.startsWith(huge.slice(0, LOG_CAP))).toBe(true)

    const fields = capFields({ stackTrace: huge, failedTask: 'build' })
    expect(fields.failedTask).toBe('build')
    expect(fields.stackTrace).toBe(capped)

    expect(() =>
      Logger.createMessage('pack failed', fields, 'error', (s) => s, 2)
    ).not.toThrow()
  })

  it('forces the traversal collector so pnpm list --json cannot blow the build', async () => {
    const got = await detectPackageManager([path.join(__dirname, '..')])
    expect(got.pm).toBe(PM.TRAVERSAL)
    expect(got.detectionMethod).toBe('forced-traversal')
  })
})

describe('run-electron-builder heartbeat', () => {
  it('prints start then still-running once the interval fires', () => {
    const { startHeartbeat } = require('./run-electron-builder.cjs')
    const lines = []
    let t = Date.parse('2026-08-29T00:00:00Z')
    let tick
    const stop = startHeartbeat({
      write: (s) => lines.push(s),
      now: () => t,
      intervalMs: 60_000,
      setIntervalFn: (fn) => {
        tick = fn
        return 1
      },
      clearIntervalFn: () => {}
    })
    expect(lines).toEqual(['electron-builder: start 2026-08-29T00:00:00.000Z\n'])
    t += 60_000
    tick()
    expect(lines[1]).toBe('electron-builder: still running 60s\n')
    stop()
  })
})
