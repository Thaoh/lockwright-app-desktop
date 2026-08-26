<p align="center">
  <img src="docs/logo.svg" alt="Lockwright" width="128"/>
</p>

# Lockwright Desktop

> The desktop app for Lockwright, an open-source, end-to-end encrypted password and identity manager built on Pear Runtime.

Community fork of PearPass (Apache 2.0). Not affiliated with or endorsed by Tether Data or the Pears project.

Package names, store listings, and shipped binaries still say PearPass until identity `works.dexterity.lockwright` lands.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
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

Lockwright is an open-source, privacy-first password and identity manager. It encrypts and stores all data locally on your device.

Unlike traditional password managers that rely on centralized servers, Lockwright is built on [Pear Runtime](https://pears.com/) and uses peer-to-peer technology to sync your credentials directly between your devices. No cloud account. The credentials stay under your control.

The on-disk vault at the fork point is PearPass's. Vault work in this tree aims to open those vaults in place. Test that on a copy.

---

## Features

- **Encrypted-at-rest storage.** Lockwright encrypts passwords, credit cards, secure notes, and custom fields before writing them to disk.
- **Cross-device sync.** Credentials sync directly between your devices using Pear Runtime, with no central server.
- **Offline access.** Access your vault anytime, even without a network connection.
- **Password health.** Analyse password strength and identify weak passwords.
- **Random password generator.** Generate strong, unique passwords.
- **Multi-platform.** Runs on macOS, Linux, and Windows. Lockwright is also available on [mobile](https://github.com/Thaoh/lockwright-app-mobile) and as a [browser extension](https://github.com/Thaoh/lockwright-app-browser-extension).

---

## Installation

### Prerequisites

- **Node.js.** Check the required version in `.nvmrc` and verify with:

```bash
node --version
```

- **pnpm** `11.10.0` (`packageManager` in `package.json`)
- **Pear Runtime.** [Installation guide](https://docs.pears.com/guide/getting-started.html).

### Steps

```bash
# 1. Clone the repository
git clone git@github.com:Thaoh/lockwright-app-desktop.git

# 2. Go to the cloned directory
cd lockwright-app-desktop

# 3. Install dependencies
pnpm install

# 4. Generate translation keys
pnpm run build

# 5. Start the development app
pnpm run dev
```

In the Lockwright superproject, run `./scripts/fetch-packages.sh --layout` so `file:../pearpass-lib-vault` resolves.

---

## Usage Examples

PearPass docs at [docs.pass.pears.com](https://docs.pass.pears.com) still describe setup, vault management, syncing, browser extension usage, and the rest of the product at the fork point. They are not Lockwright docs.

Intel-based Mac builds are deprecated and provided without official support or active testing. They stay available for now. Use them at your own risk. Open a ticket if you hit issues. A fix is not guaranteed, but it helps to know whether these builds are still in use.

---

## Logging

Off by default. When enabled, logs are written under `<userData>/logs/`: `main.log` from the host process and `core.log` from the vault worker. The worker's sink redacts known sensitive fields (passwords, keys, tokens, etc.) before writing to `core.log`. The host process logger does not redact, so treat anything passed to `logger.*` in `main.cjs` as on-disk-visible in `main.log`.

Three ways to enable:

- **In-app toggle** (Settings → Diagnostics → **Enable logs**). Persists across launches; toggling **on** clears any previous log files to start a clean session. Toggling **off** stops writing but preserves the existing files so you can share them.
- **Launch flag:** pass `--enable-logging` at startup. Forces logging on regardless of the toggle.
- **Nightly builds** (`PearPass-nightly`): logging is on automatically and the in-app toggle is locked. Channel name is still PearPass until identity lands.

When logging is on, **Open logs folder** in the same screen reveals the directory.

---

## Testing

### Unit Testing

Run unit tests with Jest:

```bash
pnpm test
```

---

## Staging to Dev

Ensure the app runs correctly using `pnpm run dev`.

If successful, stage it, for example: `pear stage dev`.

Then run the app: `pear run pear://GENERATED_URL`.

Pear serves files from the `dist/` folder:

```html
<!-- index.html -->
<script type="module" src="./dist/app.js"></script>
```

The `src/` folder is for development and it's ignored in `package.json`:

```json
"ignore": [".github", "appling", ".git", ".gitignore", "packages", "src"]
```

---

## Workspace Dependencies

The following sibling modules must be present in the workspace (they are not declared as npm dependencies). npm names are still `@tetherto/pearpass-*`. Git clones for vault, vault-core, and constants are the Lockwright repos.

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
| [`lockwright-app-mobile`](https://github.com/Thaoh/lockwright-app-mobile) | Mobile app for Lockwright |
| [`lockwright-app-browser-extension`](https://github.com/Thaoh/lockwright-app-browser-extension) | Browser extension for Lockwright |
| [`lockwright-lib-vault`](https://github.com/Thaoh/lockwright-lib-vault) | Vault management library |
| [`lockwright-lib-vault-core`](https://github.com/Thaoh/lockwright-lib-vault-core) | Bare worker and client for Lockwright vaults |
| [`lockwright-lib-constants`](https://github.com/Thaoh/lockwright-lib-constants) | Shared constants |
| [`@tetherto/pearpass-lib-ui-kit`](https://github.com/tetherto/pearpass-lib-ui-kit) | UI kit (still upstream) |

---

## Contributing

We welcome contributions. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and coding conventions.

---

## License

Apache License 2.0. See `LICENSE.md` and `NOTICE.md`.
