# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] – Initial Release

- Initial release of Git-When CLI with:
  - Natural-language flags (`--when`, `--who`, `--what`, `--path`)
  - Fuzzy search and glob filtering via `fuse.js` and `minimatch`
  - Named presets for saving and reusing filter sets
  - Structured outputs: ASCII table, JSON, CSV, Markdown
  - NDJSON streaming with backpressure and `--batch-size` support
  - Native Git-side filtering (`--since`, `--until`, `--author`, `--grep`, `--path`)
  - Unit & integration tests, CI workflows, and benchmarking harness

<!--
## [Unreleased]

### Added

### Changed

### Fixed
--> 