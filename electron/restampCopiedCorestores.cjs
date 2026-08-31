const fs = require('fs')
const path = require('path')

function listCorestoreDeviceFiles(root, fsImpl = fs, depth = 0, out = []) {
  if (!root || depth > 4) return out
  let entries
  try {
    entries = fsImpl.readdirSync(root, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(root, entry.name)
    if (entry.isFile() && entry.name === 'CORESTORE') {
      out.push(full)
    } else if (entry.isDirectory()) {
      listCorestoreDeviceFiles(full, fsImpl, depth + 1, out)
    }
  }
  return out
}

// Node cpSync does not keep Linux user.device-file xattrs. Corestore then
// throws "Invalid device file, was moved unsafely" on password init.
// Drop the marker so Corestore writes a new one for this inode.
function restampCopiedCorestores(root, fsImpl = fs) {
  if (!root) return []
  const removed = []
  for (const file of listCorestoreDeviceFiles(root, fsImpl)) {
    try {
      fsImpl.unlinkSync(file)
      removed.push(file)
    } catch {
      // leave it; open will still fail loudly
    }
  }
  return removed
}

module.exports = {
  listCorestoreDeviceFiles,
  restampCopiedCorestores
}
