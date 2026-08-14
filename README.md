<p align="center">
  <img src="assets/images/logo.png" alt="Pearpass logo" width="264"/>
</p>

> [!WARNING]
> 🍐 PearPass is currently paused from active development, so please use at your own caution until further notice.

# PearPass Desktop

> The desktop app for PearPass, an open-source, end-to-end encrypted password and identity manager built on Pear Runtime.

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

PearPass is an open-source, privacy-first password and identity manager that gives you full control over your sensitive information. It makes storing and managing your credentials simple, secure, and private. PearPass encrypts and stores all data locally on your device.

Unlike traditional password managers that rely on centralized servers, PearPass is built on [Pear Runtime](https://pears.com/) and uses peer-to-peer technology to sync your credentials directly between your devices, ensuring they remain private, secure, and always under your control.

---

## Features

- **Encrypted-at-rest storage** — PearPass encrypts passwords, credit cards, secure notes, and custom fields before writing them to disk.
- **Cross-device sync** — PearPass syncs credentials directly between your devices using Pear Runtime, with no central server.
- **Offline access** — Access your vault anytime, even without a network connection.
- **Password health** — Analyse password strength and identify weak passwords.
- **Random password generator** — Generate strong, unique passwords.
- **Multi-platform** — Runs on macOS, Linux, and Windows. PearPass is also available on [mobile](https://github.com/tetherto/pearpass-app-mobile) and as a [browser extension](https://github.com/tetherto/pearpass-app-browser-extension).

---

## Installation

### Prerequisites

- **Node.js** — check the required version in `.nvmrc` and verify with:

```bash
node --version
```

- **Pear Runtime** — [Installation guide](https://docs.pears.com/guide/getting-started.html).

### Steps

```bash
# 1. Clone the repository
git clone git@github.com:tetherto/pearpass-app-desktop.git

# 2. Go to the cloned directory
cd pearpass-app-desktop

# 3. Install dependencies
npm install

# 4. Generate translation keys
npm run build

# 5. Start the development app
npm run dev
```

---

## Usage Examples

Visit the official PearPass documentation for step-by-step guides on setup, vault management, syncing across devices, browser extension usage, and all other PearPass features:

**[docs.pass.pears.com](https://docs.pass.pears.com)**

> ⚠️ Intel Mac Support: Intel-based Mac builds are deprecated and provided without official support or active testing. We're keeping them available for now, but use them at your own risk. If you run into issues, feel free to open a ticket. While we can't guarantee a fix, we'd like to know if these builds are still being used!

---

## Logging

Off by default. When enabled, logs are written under `<userData>/logs/` — `main.log` from the host process and `core.log` from the vault worker. The worker's sink redacts known sensitive fields (passwords, keys, tokens, etc.) before writing to `core.log`. The host process logger does not redact, so treat anything passed to `logger.*` in `main.cjs` as on-disk-visible in `main.log`.

Three ways to enable:

- **In-app toggle** (Settings → Diagnostics → **Enable logs**). Persists across launches; toggling **on** clears any previous log files to start a clean session. Toggling **off** stops writing but preserves the existing files so you can share them.
- **Launch flag:** pass `--enable-logging` at startup. Forces logging on regardless of the toggle.
- **Nightly builds** (`PearPass-nightly`): logging is on automatically and the in-app toggle is locked.

When logging is on, **Open logs folder** in the same screen reveals the directory.

---

## Testing

### Unit Testing

Run unit tests with Jest:

```bash
npm test
```


---

## Staging to Dev

Ensure the app runs correctly using `npm run dev`.

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

The following sibling modules must be present in the workspace (they are not declared as npm dependencies):

- [`@tetherto/tether-dev-docs`](../tether-dev-docs)
- [`@tetherto/pear-apps-lib-feedback`](../pear-apps-lib-feedback)
- [`@tetherto/pear-apps-lib-ui-react-hooks`](../pear-apps-lib-ui-react-hooks)
- [`@tetherto/pear-apps-utils-avatar-initials`](../pear-apps-utils-avatar-initials)
- [`@tetherto/pear-apps-utils-date`](../pear-apps-utils-date)
- [`@tetherto/pear-apps-utils-generate-unique-id`](../pear-apps-utils-generate-unique-id)
- [`@tetherto/pear-apps-utils-pattern-search`](../pear-apps-utils-pattern-search)
- [`@tetherto/pear-apps-utils-qr`](../pear-apps-utils-qr)
- [`@tetherto/pear-apps-utils-validator`](../pear-apps-utils-validator)
- [`@tetherto/pearpass-lib-constants`](../pearpass-lib-constants)
- [`@tetherto/pearpass-lib-data-export`](../pearpass-lib-data-export)
- [`@tetherto/pearpass-lib-data-import`](../pearpass-lib-data-import)
- [`@tetherto/pearpass-lib-ui-theme-provider`](../pearpass-lib-ui-theme-provider)
- [`@tetherto/pearpass-lib-vault`](../pearpass-lib-vault)
- [`@tetherto/pearpass-lib-vault-core`](../pearpass-lib-vault-core)
- [`@tetherto/pearpass-utils-password-check`](../pearpass-utils-password-check)
- [`@tetherto/pearpass-utils-password-generator`](../pearpass-utils-password-generator)

---

## Dependencies

- [Pear Runtime](https://pears.com/)
- [React](https://reactjs.org/)
- [Styled Components](https://styled-components.com/)
- [Lingui](https://lingui.dev/)
- [Redux](https://redux.js.org/)

---

## Related Projects

| Project                                                                                                          | Description                                |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| [`pearpass-app-mobile`](https://github.com/tetherto/pearpass-app-mobile)                                         | Mobile app for PearPass                    |
| [`pearpass-app-browser-extension`](https://github.com/tetherto/pearpass-app-browser-extension)                   | Browser extension for PearPass             |
| [`pearpass-lib-vault`](https://github.com/tetherto/pearpass-lib-vault)                                           | Vault management library                   |
| [`pearpass-lib-vault-core`](https://github.com/tetherto/pearpass-lib-vault-core)                                 | Bare worker and client for PearPass vaults |
| [`pearpass-lib-ui-react-components`](https://github.com/tetherto/pearpass-lib-ui-react-components)               | React UI component library                 |
| [`pearpass-lib-ui-react-native-components`](https://github.com/tetherto/pearpass-lib-ui-react-native-components) | React Native UI component library          |
| [`tether-dev-docs`](https://github.com/tetherto/tether-dev-docs)                                                 | Developer documentation and guides         |

---

## Contributing

We welcome contributions. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow and coding conventions.

---

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.
