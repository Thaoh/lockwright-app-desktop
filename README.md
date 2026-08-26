<p align="center">
  <img src="docs/logo.svg" alt="Lockwright" width="128"/>
</p>

# Lockwright Desktop

Desktop app for Lockwright. Peer-to-peer password manager. Vaults stay on the device. Sync is device to device.

Community fork of PearPass (Apache 2.0). Not affiliated with or endorsed by Tether Data or the Pears project.

npm names, store listings, and shipped binaries still say PearPass until identity `works.dexterity.lockwright` lands.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Logging](#logging)
- [Testing](#testing)
- [Staging to Dev](#staging-to-dev)
- [Workspace Dependencies](#workspace-dependencies)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

Lockwright encrypts and stores credentials on the device. Sync uses Pear Runtime peer-to-peer transport. No cloud account.

The on-disk vault at the fork point is PearPass's. Vault work in this tree aims to open those vaults in place. Test that on a copy.

---

## Features

- Encrypted-at-rest storage for passwords, cards, notes, and custom fields
- Direct device-to-device sync, no central server
- Offline access
- Password health and a random password generator
- macOS, Linux, and Windows. Also [mobile](https://github.com/Thaoh/lockwright-app-mobile) and a [browser extension](https://github.com/Thaoh/lockwright-app-browser-extension)

---

## Installation

### Prerequisites

- **Node.js** — version in `.nvmrc`
- **pnpm** `11.10.0` (`packageManager` in `package.json`)
- **Pear Runtime** — [installation guide](https://docs.pears.com/guide/getting-started.html)

```bash
git clone git@github.com:Thaoh/lockwright-app-desktop.git
cd lockwright-app-desktop
pnpm install
pnpm run build
pnpm run dev
```

In the Lockwright superproject, run `./scripts/fetch-packages.sh --layout` so `file:../pearpass-lib-vault` resolves.

---

## Usage

PearPass docs at [docs.pass.pears.com](https://docs.pass.pears.com) describe the product at the fork point. They are not Lockwright docs.

Intel Mac builds are deprecated. No official support. Open a ticket if you still run them.

---

## Logging

Off by default. When enabled, logs go under `<userData>/logs/`: `main.log` from the host process, `core.log` from the vault worker. The worker sink redacts known sensitive fields before writing `core.log`. The host logger does not redact. Treat anything passed to `logger.*` in `main.cjs` as visible on disk in `main.log`.

Three ways to enable:

- In-app: Settings → Diagnostics → **Enable logs**. Persists. Turning on clears previous log files. Turning off stops writes and keeps the files.
- Launch flag `--enable-logging`. Forces logging on.
- Nightly builds (`PearPass-nightly`): logging on, toggle locked. Channel name is still PearPass until identity lands.

**Open logs folder** on that screen reveals the directory.

---

## Testing

```bash
pnpm test
```

---

## Staging to Dev

Confirm `pnpm run dev` works, then for example `pear stage dev` and `pear run pear://GENERATED_URL`.

Pear serves files from `dist/`:

```html
<!-- index.html -->
<script type="module" src="./dist/app.js"></script>
```

`src/` is development-only. `package.json` ignores it:

```json
"ignore": [".github", "appling", ".git", ".gitignore", "packages", "src"]
```

---

## Workspace Dependencies

Sibling modules expected in the workspace (not all declared as npm dependencies). npm names are still `@tetherto/pearpass-*`. Git clones for vault, vault-core, and constants are the Lockwright repos.

- [`@tetherto/tether-dev-docs`](../tether-dev-docs)
- [`@tetherto/pear-apps-lib-feedback`](../pear-apps-lib-feedback)
- [`@tetherto/pear-apps-lib-ui-react-hooks`](../pear-apps-lib-ui-react-hooks)
- [`@tetherto/pear-apps-utils-avatar-initials`](../pear-apps-utils-avatar-initials)
- [`@tetherto/pear-apps-utils-date`](../pear-apps-utils-date)
- [`@tetherto/pear-apps-utils-generate-unique-id`](../pear-apps-utils-generate-unique-id)
- [`@tetherto/pear-apps-utils-pattern-search`](../pear-apps-utils-pattern-search)
- [`@tetherto/pear-apps-utils-qr`](../pear-apps-utils-qr)
- [`@tetherto/pear-apps-utils-validator`](../pear-apps-utils-validator)
- [`@tetherto/pearpass-lib-constants`](https://github.com/Thaoh/lockwright-lib-constants)
- [`@tetherto/pearpass-lib-data-export`](../pearpass-lib-data-export)
- [`@tetherto/pearpass-lib-data-import`](../pearpass-lib-data-import)
- [`@tetherto/pearpass-lib-ui-theme-provider`](../pearpass-lib-ui-theme-provider)
- [`@tetherto/pearpass-lib-vault`](https://github.com/Thaoh/lockwright-lib-vault)
- [`@tetherto/pearpass-lib-vault-core`](https://github.com/Thaoh/lockwright-lib-vault-core)
- [`@tetherto/pearpass-utils-password-check`](../pearpass-utils-password-check)
- [`@tetherto/pearpass-utils-password-generator`](../pearpass-utils-password-generator)

---

## Dependencies

- [Pear Runtime](https://pears.com/)
- [React](https://reactjs.org/)
- [Lingui](https://lingui.dev/)
- [Redux](https://redux.js.org/)

---

## Related Projects

| Project | Description |
| --- | --- |
| [`lockwright-app-mobile`](https://github.com/Thaoh/lockwright-app-mobile) | Mobile |
| [`lockwright-app-browser-extension`](https://github.com/Thaoh/lockwright-app-browser-extension) | Browser extension |
| [`lockwright-lib-vault`](https://github.com/Thaoh/lockwright-lib-vault) | Vault |
| [`lockwright-lib-vault-core`](https://github.com/Thaoh/lockwright-lib-vault-core) | Vault core |
| [`lockwright-lib-constants`](https://github.com/Thaoh/lockwright-lib-constants) | Shared constants |

Umbrella and CI: the Lockwright superproject.

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## License

Apache License 2.0. See `LICENSE.md` and `NOTICE.md`.

`NOTICE.md` keeps the PearPass / Tether Inc copyright for the original Work and adds Lockwright Contributors for Modifications.
