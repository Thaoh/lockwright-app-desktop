/* eslint-env jest */

const fs = require('fs')
const path = require('path')

const APP_ID = 'works.dexterity.lockwright'

const root = path.join(__dirname, '..')

describe('Lockwright app id', () => {
  it('is works.dexterity.lockwright in package.json and electron-builder configs', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8')
    )
    expect(pkg.build.appId).toBe(APP_ID)

    for (const file of [
      'electron-builder.win.json',
      'electron-builder.linux.json',
      'electron-builder.mac.json'
    ]) {
      const cfg = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
      expect(cfg.appId).toBe(APP_ID)
    }
  })

  it('pins @tetherto/pearpass-lib-constants to Thaoh git, not Tether or file:', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8')
    )
    expect(pkg.dependencies['@tetherto/pearpass-lib-constants']).toBe(
      'git+https://github.com/Thaoh/lockwright-lib-constants.git'
    )
  })
})
