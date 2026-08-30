import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../../..')

const listFiles = (dir) => {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? listFiles(full) : [full]
  })
}

describe('intro art', () => {
  it('uses SVG vault art instead of Rive or PearPass lock videos', () => {
    const intro = readFileSync(path.join(__dirname, 'Intro.tsx'), 'utf8')
    expect(intro).toMatch(/VaultUnlockAnimation/)
    expect(intro).toMatch(/PeerLinkAnimation/)
    expect(intro).not.toMatch(
      /OnboardingLockVideo|SyncWithoutCloud|@rive-app|\.webm|\.riv/
    )
  })

  it('does not depend on a Rive runtime', () => {
    const pkg = JSON.parse(
      readFileSync(path.join(root, 'package.json'), 'utf8')
    )
    expect(JSON.stringify(pkg.dependencies || {})).not.toMatch(/@rive-app/)
    expect(JSON.stringify(pkg.devDependencies || {})).not.toMatch(/@rive-app/)
  })

  it('does not ship Rive files or onboarding lock videos', () => {
    const assets = listFiles(path.join(root, 'assets')).map((file) =>
      path.relative(path.join(root, 'assets'), file)
    )
    expect(assets.filter((file) => file.endsWith('.riv'))).toEqual([])
    expect(assets.filter((file) => file.includes('rive_webgl2'))).toEqual([])
    expect(
      assets.filter((file) => /onboarding_lock.*\.webm$/.test(file))
    ).toEqual([])
  })
})
