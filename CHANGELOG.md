# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Restored `plugins/downloadman/stash_path_mappings.json` as the static source of truth for mappings instead of a manifest setting.

### Removed
- BREAKING: Removed Downloadman's Python task/config layer, cache, manager UI, and path-mapping baggage; the plugin is now a JS-only scene downloader.

## [1.0.0] - 2026-03-31

### Added
- Initial public release of this Stash plugin source index repository.
- Published the Downloadman plugin for Stash scene downloads.

### Changed
- Plugin archives now exclude Git metadata and Python cache files from generated packages.
- Disabled plugin manifests are skipped from the published source index so unpublished work stays out of releases.

[Unreleased]: https://github.com/mr-szgz/stash-plugins/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mr-szgz/stash-plugins/releases/tag/v1.0.0
