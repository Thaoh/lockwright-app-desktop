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

  it('ships productName Lockwright, not PearPass', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8')
    )
    expect(pkg.productName).toBe('Lockwright')
    expect(pkg.description).toMatch(/Lockwright/)
    expect(pkg.author).toBe('Lockwright')
    expect(pkg.productName).not.toMatch(/PearPass/)

    const win = JSON.parse(
      fs.readFileSync(path.join(root, 'electron-builder.win.json'), 'utf8')
    )
    expect(win.productName).toBe('Lockwright')
    expect(win.nsis.shortcutName).toBe('Lockwright')
    expect(win.nsis.uninstallDisplayName).toBe('Lockwright')
  })

  it('points Lockwright import help at lockwright.dexterity.works, not PearPass docs', () => {
    const src = fs.readFileSync(
      path.join(
        root,
        'src/pages/SettingsView/content/ImportItemsContent/index.tsx'
      ),
      'utf8'
    )
    expect(src).not.toMatch(/docs\.pass\.pears\.com/)
    expect(src).toMatch(/PEARPASS_WEBSITE/)
  })

  it('report-a-problem opens the Lockwright contact form, not Tether Slack or Google Form', () => {
    const src = fs.readFileSync(
      path.join(
        root,
        'src/pages/SettingsView/content/ReportAProblemContent/index.tsx'
      ),
      'utf8'
    )
    expect(src).not.toMatch(/sendSlackFeedback|sendGoogleFormFeedback/)
    expect(src).toMatch(/PEARPASS_WEBSITE/)
    expect(src).toMatch(/\/contact\//)

    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8')
    )
    const links = (pkg.pear.links || []).join('\n')
    expect(links).not.toMatch(/slack\.com/)
    expect(links).not.toMatch(/docs\.google\.com\/forms/)
  })
})
