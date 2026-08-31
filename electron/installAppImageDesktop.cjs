const fs = require('fs')
const os = require('os')
const path = require('path')

const APP_ID = 'works.dexterity.lockwright'

function isAppImageMountPath(filePath) {
  if (!filePath) return false
  return filePath.includes('/.mount_') || filePath.includes('\\.mount_')
}

function quoteExec(filePath) {
  return `"${String(filePath).replace(/"/g, '\\"')}"`
}

/**
 * GNOME/KDE "pin to taskbar" records the running argv[0]. For an AppImage
 * that is /tmp/.mount_Lockwr<random>/lockwright-app-desktop.bin, which
 * vanishes when the squashfs unmounts. Write a persistent .desktop whose
 * Exec is the APPIMAGE file the runtime exported.
 */
function installAppImageDesktop({
  appImagePath,
  home = os.homedir(),
  productName = 'Lockwright',
  appId = APP_ID,
  iconSourcePath
} = {}) {
  if (!appImagePath) {
    return { installed: false, reason: 'not-appimage' }
  }
  if (isAppImageMountPath(appImagePath)) {
    return { installed: false, reason: 'mount-path' }
  }

  const desktopDir = path.join(home, '.local', 'share', 'applications')
  const iconDir = path.join(
    home,
    '.local',
    'share',
    'icons',
    'hicolor',
    '256x256',
    'apps'
  )
  const desktopPath = path.join(desktopDir, `${appId}.desktop`)
  const iconName = appId
  const iconDest = path.join(iconDir, `${iconName}.png`)

  fs.mkdirSync(desktopDir, { recursive: true })
  if (iconSourcePath && fs.existsSync(iconSourcePath)) {
    fs.mkdirSync(iconDir, { recursive: true })
    fs.copyFileSync(iconSourcePath, iconDest)
  }

  const body = [
    '[Desktop Entry]',
    `Name=${productName}`,
    'GenericName=Password Manager',
    'Comment=A secure, decentralized and fully local password manager',
    `Exec=${quoteExec(appImagePath)} %U`,
    `Icon=${iconName}`,
    'Terminal=false',
    'Type=Application',
    'Categories=Utility;Security;',
    'Keywords=password;manager;vault;security;credentials;encryption;sync;',
    'StartupNotify=true',
    `StartupWMClass=${productName}`,
    ''
  ].join('\n')

  fs.writeFileSync(desktopPath, body, { encoding: 'utf8', mode: 0o644 })
  return { installed: true, desktopPath }
}

module.exports = {
  APP_ID,
  installAppImageDesktop,
  isAppImageMountPath
}
