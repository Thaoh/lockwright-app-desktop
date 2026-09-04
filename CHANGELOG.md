# Changelog

All notable changes to Lockwright desktop are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Headings are App versions (`package.json` / AppxManifest), not superproject Release tags.

Starts at 0.0.17, after the Lockwright package rename. Earlier history is git.

## [Unreleased]

### Fixed

- Authenticator asks for OTP codes so digits and the 1s timer show after Home skipped them.
- Native-messaging vault list no longer probes encryption and vault status before the list.

## [0.0.19] - 2026-09-04

`eb6d08ec8b068eb517c80d1d2bddd1857ecc0521`

### Added

- Settings lists paired browsers. Unpair one without wiping the rest.

## [0.0.18] - 2026-09-02

`b9dea4cc24cbcc34a7dca6354897f9d86b6d1e18`

### Added

- Pairing uses the Chrome Web Store Chromium extension id `mjkngfebbgbofnimnppidjfbifpbimgp`.

### Fixed

- Stale AppImage native-messaging hosts are killed so a new AppImage can bind.
- Splash does not redraw on an unchanged resize.
- AppImage taskbar `.desktop` Exec stays on this install.
- `linux.desktop` nested under `entry` for electron-builder 26.
- Native-host IPC and CORESTORE restamped to Lockwright after a PearPass copy.

## [0.0.17] - 2026-08-31

`ca6d8c856cff54c3fdccabf9a0c6d8272a63f1fd`

### Fixed

- A PearPass vault copied onto disk is treated as a vault, not empty.

[unreleased]: https://github.com/Thaoh/lockwright-app-desktop/compare/eb6d08ec8b068eb517c80d1d2bddd1857ecc0521...HEAD
[0.0.19]: https://github.com/Thaoh/lockwright-app-desktop/compare/b9dea4cc24cbcc34a7dca6354897f9d86b6d1e18...eb6d08ec8b068eb517c80d1d2bddd1857ecc0521
[0.0.18]: https://github.com/Thaoh/lockwright-app-desktop/compare/ca6d8c856cff54c3fdccabf9a0c6d8272a63f1fd...b9dea4cc24cbcc34a7dca6354897f9d86b6d1e18
[0.0.17]: https://github.com/Thaoh/lockwright-app-desktop/compare/21b9f29828856acad42fda07d65da0e2e75c1944...ca6d8c856cff54c3fdccabf9a0c6d8272a63f1fd
