#!/usr/bin/env node
/**
 * Electron-builder afterPack hook.
 *
 * 1. Prune native `prebuilds/<platform>-<arch>` dirs that don't match the
 *    current target. Native modules in the bare/holepunch ecosystem ship
 *    prebuilds for every platform (darwin/linux/win32/android/ios × x64/arm64
 *    + simulators).
 *
 * 2. Restore nested dual-major deps that electron-builder's pnpm collector
 *    flattens incorrectly (e.g. hypercore needs compact-encoding@3 but the
 *    collector copies the root @2 into every nested slot).
 *
 * 3. Linux only: remove chrome-sandbox (squashfs/AppImage cannot preserve
 *    SUID bits, so Chromium's setuid sandbox probe crashes before Node.js
 *    even starts) and wrap the real Electron binary with a shell script that
 *    passes --no-sandbox. app.commandLine.appendSwitch('no-sandbox') in
 *    main.cjs is too late — Chromium's zygote sandbox decision happens
 *    before Node.js initializes. The wrapper ensures --no-sandbox reaches
 *    Chromium at process start.
 */
const fs = require('fs')
const fsp = require('fs/promises')
const path = require('path')

const ARCH_NAMES = {
  0: 'ia32',
  1: 'x64',
  2: 'armv7l',
  3: 'arm64',
  4: 'universal'
}

/** Packages known to ship a second major alongside a different root version. */
const NESTED_VERSION_SENSITIVE = ['compact-encoding']

exports.default = async function afterPack(context) {
  await prunePrebuilds(context)
  await restoreNestedPackageVersions(context)

  if (context.electronPlatformName === 'linux') {
    await wrapLinuxNoSandbox(context)
  }
}

function getAppRoot(context) {
  const { appOutDir, electronPlatformName, packager } = context
  if (electronPlatformName === 'darwin' || electronPlatformName === 'mas') {
    const appName = packager.appInfo.productFilename
    return path.join(
      appOutDir,
      `${appName}.app`,
      'Contents',
      'Resources',
      'app'
    )
  }
  return path.join(appOutDir, 'resources', 'app')
}

async function prunePrebuilds(context) {
  const { electronPlatformName, arch } = context
  const archName = ARCH_NAMES[arch] ?? String(arch)
  const target = `${electronPlatformName}-${archName}`
  const appRoot = getAppRoot(context)

  const nodeModules = path.join(appRoot, 'node_modules')
  if (!fs.existsSync(nodeModules)) {
    console.warn(
      `afterPack: node_modules not found at ${nodeModules}, skipping prune`
    )
    return
  }

  const stats = { kept: 0, removed: 0, bytes: 0 }
  await pruneTree(appRoot, target, stats)

  const mb = (stats.bytes / (1024 * 1024)).toFixed(1)
  console.log(
    `afterPack: pruned ${stats.removed} prebuild dir(s), kept ${stats.kept} ` +
      `matching '${target}'/-universal, freed ~${mb} MB`
  )
}

/**
 * electron-builder's pnpm collector often copies the wrong major into nested
 * node_modules when the same package name exists at two majors (root @2 vs
 * nested @3). Copy the project's real nested copies back over the packed ones.
 */
async function restoreNestedPackageVersions(context) {
  const appRoot = getAppRoot(context)
  const projectRoot = context.packager.projectDir
  const packedNm = path.join(appRoot, 'node_modules')
  const sourceNm = path.join(projectRoot, 'node_modules')

  if (!fs.existsSync(packedNm) || !fs.existsSync(sourceNm)) return

  let fixed = 0
  for await (const pkgRel of listDirectPackages(sourceNm)) {
    for (const depName of NESTED_VERSION_SENSITIVE) {
      const sourceNested = path.join(
        sourceNm,
        pkgRel,
        'node_modules',
        depName
      )
      const packedNested = path.join(
        packedNm,
        pkgRel,
        'node_modules',
        depName
      )
      if (!fs.existsSync(sourceNested) || !fs.existsSync(packedNested)) {
        continue
      }

      const sourceVer = readPackageVersion(sourceNested)
      const packedVer = readPackageVersion(packedNested)
      if (!sourceVer || !packedVer || sourceVer === packedVer) continue

      await fsp.rm(packedNested, { recursive: true, force: true })
      await fsp.mkdir(path.dirname(packedNested), { recursive: true })
      await fsp.cp(sourceNested, packedNested, {
        recursive: true,
        dereference: true
      })
      fixed++
      console.log(
        `afterPack: restored ${depName}@${sourceVer} under ${pkgRel} ` +
          `(was ${packedVer})`
      )
    }
  }

  if (fixed === 0) {
    console.log('afterPack: nested package versions already match project tree')
  } else {
    console.log(`afterPack: restored ${fixed} nested package version(s)`)
  }
}

function readPackageVersion(pkgDir) {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')
    ).version
  } catch {
    return null
  }
}

async function* listDirectPackages(nodeModulesDir) {
  const entries = await safeReadDir(nodeModulesDir)
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.bin' || entry.name === '.pnpm') {
      continue
    }
    if (entry.name.startsWith('@')) {
      const scoped = await safeReadDir(path.join(nodeModulesDir, entry.name))
      for (const sub of scoped) {
        if (sub.isDirectory()) yield path.join(entry.name, sub.name)
      }
    } else {
      yield entry.name
    }
  }
}

async function pruneTree(base, target, stats) {
  await pruneOneLevel(path.join(base, 'prebuilds'), target, stats)

  const nm = path.join(base, 'node_modules')
  const entries = await safeReadDir(nm)
  await Promise.all(
    entries.map(async (entry) => {
      if (!entry.isDirectory()) return
      const full = path.join(nm, entry.name)
      if (entry.name.startsWith('@')) {
        const subs = await safeReadDir(full)
        await Promise.all(
          subs.map((sub) =>
            sub.isDirectory()
              ? pruneTree(path.join(full, sub.name), target, stats)
              : null
          )
        )
      } else {
        await pruneTree(full, target, stats)
      }
    })
  )
}

async function pruneOneLevel(dir, target, stats) {
  const entries = await safeReadDir(dir)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name === target || entry.name.endsWith('-universal')) {
      stats.kept++
      continue
    }
    const full = path.join(dir, entry.name)
    stats.bytes += await dirSize(full)
    await fsp.rm(full, { recursive: true, force: true })
    stats.removed++
  }
}

async function safeReadDir(dir) {
  try {
    return await fsp.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

async function dirSize(dir) {
  let total = 0
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop()
    let entries
    try {
      entries = await fsp.readdir(d, { withFileTypes: true })
    } catch {
      continue
    }
    for (const e of entries) {
      const full = path.join(d, e.name)
      try {
        if (e.isDirectory()) stack.push(full)
        else {
          const s = await fsp.stat(full)
          total += (s.blocks ?? 0) * 512 || s.size
        }
      } catch {}
    }
  }
  return total
}

async function wrapLinuxNoSandbox(context) {
  const appOutDir = context.appOutDir

  // 1. Remove chrome-sandbox (cannot work inside squashfs / AppImage)
  const sandboxBin = path.join(appOutDir, 'chrome-sandbox')
  if (fs.existsSync(sandboxBin)) {
    fs.unlinkSync(sandboxBin)
    console.log(`afterPack: removed ${sandboxBin}`)
  }

  // 2. Wrap the real binary so --no-sandbox is on the command line
  //    before Chromium's early startup
  const execName = context.packager.executableName
  const realBin = path.join(appOutDir, execName)
  const renamedBin = path.join(appOutDir, `${execName}.bin`)

  if (!fs.existsSync(realBin)) {
    console.warn(
      `afterPack: executable not found at ${realBin}, skipping wrapper`
    )
    return
  }

  fs.renameSync(realBin, renamedBin)

  const wrapper = [
    '#!/bin/bash',
    `exec "$(dirname "$(readlink -f "$0")")/${execName}.bin" --no-sandbox "$@"`,
    ''
  ].join('\n')

  fs.writeFileSync(realBin, wrapper, { mode: 0o755 })
  console.log(`afterPack: created --no-sandbox wrapper for ${execName}`)
}
