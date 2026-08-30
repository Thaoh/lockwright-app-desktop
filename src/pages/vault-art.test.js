import { readFileSync } from 'fs'
import path from 'path'

const src = (...parts) => path.join(__dirname, ...parts)

describe('vault unlock art', () => {
  it('plays on splash and unlock, not only first-run intro', () => {
    const loading = readFileSync(src('LoadingPage', 'LoadingPage.tsx'), 'utf8')
    const unlock = readFileSync(
      src('WelcomePage', 'CardUnlockPearPass', 'index.tsx'),
      'utf8'
    )

    expect(loading).toMatch(/VaultUnlockAnimation/)
    expect(loading).not.toMatch(/OnboardingLock/)
    expect(unlock).toMatch(/VaultUnlockAnimation/)

    const vault = readFileSync(src('Intro', 'VaultUnlockAnimation.tsx'), 'utf8')
    expect(vault).toMatch(/infinite/)
  })
})
