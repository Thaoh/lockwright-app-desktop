const {
  getFlatpakCompatRoots,
  getSandboxSafePath,
  getSnapRealHome,
  isFlatpakRuntime,
  isSnapRuntime,
  mapFlatpakPathToSandbox
} = require('./flatpak-paths.cjs')

describe('flatpak path helpers', () => {
  const env = {
    HOME: '/home/alvaro',
    XDG_CONFIG_HOME: '/home/alvaro/.var/app/works.dexterity.lockwright/config',
    XDG_DATA_HOME: '/home/alvaro/.var/app/works.dexterity.lockwright/data',
    XDG_CACHE_HOME: '/home/alvaro/.var/app/works.dexterity.lockwright/cache'
  }

  it('detects flatpak via FLATPAK_ID', () => {
    expect(isFlatpakRuntime({ env: { FLATPAK_ID: 'works.dexterity.lockwright' } })).toBe(
      true
    )
  })

  it('derives flatpak compatibility roots under the user config directory', () => {
    expect(getFlatpakCompatRoots({ env })).toEqual({
      config: '/home/alvaro/.config',
      data: '/home/alvaro/.config/pearpass-flatpak-data',
      cache: '/home/alvaro/.config/pearpass-flatpak-cache'
    })
  })

  it('maps host-side flatpak config paths into sandbox-safe paths', () => {
    expect(
      mapFlatpakPathToSandbox(
        '/home/alvaro/.var/app/works.dexterity.lockwright/config/PearPass',
        { env }
      )
    ).toBe('/home/alvaro/.config/PearPass')
  })

  it('detects snap via SNAP_NAME', () => {
    expect(isSnapRuntime({ env: { SNAP_NAME: 'pearpass' } })).toBe(true)
    expect(isSnapRuntime({ env: {} })).toBe(false)
  })

  it('returns SNAP_REAL_HOME inside snap, HOME otherwise', () => {
    expect(
      getSnapRealHome({
        env: {
          SNAP_NAME: 'pearpass',
          SNAP_REAL_HOME: '/home/alvaro',
          HOME: '/home/alvaro/snap/pearpass/current'
        }
      })
    ).toBe('/home/alvaro')
    expect(getSnapRealHome({ env: { HOME: '/home/alvaro' } })).toBe(
      '/home/alvaro'
    )
    expect(getSnapRealHome({ env: {} })).toBe('')
  })

  it('returns sandbox-safe path only when running inside flatpak', () => {
    const targetPath = '/home/alvaro/.var/app/works.dexterity.lockwright/data/PearPass'

    expect(
      getSandboxSafePath(targetPath, {
        env: { ...env, FLATPAK_ID: 'works.dexterity.lockwright' }
      })
    ).toBe('/home/alvaro/.config/pearpass-flatpak-data/PearPass')
    expect(
      getSandboxSafePath(targetPath, { env, existsSync: () => false })
    ).toBe(targetPath)
  })
})
