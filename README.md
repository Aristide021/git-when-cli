# Git-When CLI

[![CI](https://github.com/aristide021/git-when-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/aristide021/git-when-cli/actions/workflows/ci.yml) [![npm version](https://img.shields.io/npm/v/git-when-cli.svg)](https://www.npmjs.com/package/git-when-cli)
[![Coverage](https://img.shields.io/codecov/c/github/aristide021/git-when-cli?logo=codecov)](https://codecov.io/gh/aristide021/git-when-cli)
[Changelog](./CHANGELOG.md) •
[Presets example](./presets.example.json)

**Human-friendly, temporal & intent-driven wrapper around `git log`.**

Git-When provides natural-language-style flags, fuzzy search, glob path filters, named presets, and structured exports (table, JSON, CSV, Markdown).

---

## Installation

```bash
# Clone the repository
git clone https://github.com/aristide021/git-when-cli.git
cd git-when-cli

# Install dependencies
npm install  # or yarn install

# Link the CLI (on macOS/Linux)
npm link     # makes `git-when` globally available
```

On Windows, use:

```powershell
npm install -g .
```

## Dependencies

- fuse.js (>=7.1.0) — fuzzy matching on authors and commit messages
- minimatch (>=10.0.1) — glob pattern filtering for file paths
- jest (devDependency) — testing framework for unit & integration tests

---

## Common Pitfalls & FAQ

### Timezone Gotchas
• Dates passed to `--when` are interpreted in UTC by default (e.g. `2023-05-07` → `2023-05-07T00:00:00Z`). If your local timezone is behind UTC, a shorter-than-expected time window may appear. Always use ISO (`YYYY-MM-DD..YYYY-MM-DD`) or natural ranges (`today`, `last-week`).

### Glob Pattern Gotchas
• Your shell may expand globs before Git-When sees them. Quote patterns (e.g. `--path="src/**/*.js"`) to avoid unintended matches.

### Tips for Large Repositories
- Use `--limit <n>` to stop after the first _n_ commits.  
- Push filtering into Git: `--author`, `--grep`, and `--path` reduce data before JS processing.  
- Combine flags: `git-when --who Alice --limit 50 --format=json` for a quick API export.

### Fuzzy Search Tips
- **Default threshold**: 0.4 (balanced between strict and lenient)
- **Stricter matching**: Use `--fuzzy-level=0.1` to `0.3` for more precise results
- **Lenient matching**: Use `--fuzzy-level=0.6` to `0.8` to catch more variations
- **Exact matching**: Use Git's native `--author` and `--grep` flags instead of `--who`/`--what`

### Exit Codes
- **0**: Successful execution (even if no commits match).  
- **1**: An error occurred, such as invalid flags, invalid date ranges, malformed presets, or Git errors (e.g., not a Git repository).

### Sample Presets
```json
{
  "perf-q2": {
    "when": "2025-02-01..2025-02-28",
    "who": "Bob",
    "what": "perf",
    "fuzzyThreshold": 0.3
  },
  "alice-week": {
    "when": "last-week",
    "who": "Alice"
  },
  "strict-search": {
    "who": "john",
    "fuzzyThreshold": 0.1,
    "format": "json"
  }
}
```

### Sample Outputs
#### CSV
```csv
hash,author,date,message
"abc123","Alice","2025-02-01T12:00:00+00:00","Initial commit"
"def456","Bob","2025-02-15T15:30:00+00:00","Performance work"
```

---

## Usage

```bash
git-when [preset] [options]
```

- **Preset**: If the first argument matches a saved preset name, its filters load automatically.
- **Options**:
  - `-w`, `--when <range>`        Date range (e.g. `2023-01..2023-03`, `last-week`, `today`)
  - `-a`, `--who <author>`        Fuzzy author name
  - `-k`, `--what <keyword>`      Fuzzy commit message keyword
  - `-p`, `--path <glob>`         Glob file path (e.g. `src/**/*.js`, `*.md`)
  - `-f`, `--format <type>`       Output format: `table` (default), `json`, `csv`, `md`
  - `--fuzzy-level <0.0-1.0>`     Fuzzy search threshold (default: 0.4, lower = more strict)
  - `-s`, `--save <name>`         Save current filters as preset `<name>`
  - `-n`, `--limit <number>`      Limit the number of commits fetched
  - `--list-presets`              List saved preset names
  - `--delete-preset <name>`      Remove a saved preset
  - `--help`                      Show this help
  - `--version`                   Show version

---

## Presets

You can start from *presets.example.json*—copy it to `~/.config/git-when/presets.json` and edit your favorites.

## Examples

```bash
# 1. One-off: filter by author and date range
git-when --who="Alice" --when="2023-01-01..2023-03-31"

# 2. Glob path filter
git-when --path="src/**/*.js"

# 3. Save and reuse a preset
git-when -a="Bob" -w="last-week" --save weekly-bob
# later
git-when weekly-bob --format=markdown

# 4. Export JSON

git-when --what="fix" -w="today" --format=json > fixes-today.json

# 5. Manage presets
git-when --list-presets
git-when --delete-preset weekly-bob

# 6. Fine-tune fuzzy search sensitivity
git-when --who="john" --fuzzy-level=0.2  # Stricter matching
git-when --who="john" --fuzzy-level=0.8  # More lenient matching

# 7. Batch Markdown output
git-when --when="last-week" --format=markdown --batch-size=50
```

---

## Features

- **Natural flags** (`--when`, `--who`, `--what`, `--path`)
- **Configurable fuzzy search** on authors and commit messages via [`fuse.js`](https://github.com/krisk/Fuse) with adjustable threshold
- **Glob file filtering** via [`minimatch`](https://github.com/isaacs/minimatch)
- **Named presets** for saving and reusing common filters with validation
- **Structured output**: ASCII table, JSON, CSV, or Markdown
- **Cross-platform**: Node.js CLI (macOS, Linux, Windows)

---

## Project Structure

```
git-when-cli/
├── bin/git-when           # CLI entrypoint (shebang + dispatcher)
├── lib/
│   ├── index.js           # main command parser
│   ├── gitClient.js       # wraps `git log`
│   ├── filters.js         # fuzzy & glob filters
│   ├── presets.js         # load/save presets
│   ├── formatter.js       # table/json/csv/md exporters
│   └── utils.js           # date-range parsing
├── test/                  # Jest unit & integration tests
├── package.json
├── README.md
└── presets.json           # built-in default presets (empty)
```

---

## Testing

Run all tests with:

```bash
npm test
```

Integration tests require `git` installed on your PATH.

## Benchmarking

| Scenario                           | Time (s) | Mem (MB) |
|------------------------------------|----------|----------|
| Full history (no filter)           | 3.2      | 14.5     |
| 2020-01..2021-01 (no limit)        | 2.9      | 14.1     |
| --limit=50 k                       | 0.8      | 13.9     |

We provide a benchmark harness in `bench/benchmark.sh` to measure streaming performance against large repositories (e.g. VSCode).

Features:
- Clones the full VSCode repo into `bench/vscode` (with full history)
- Executes `git-when` with varying `--limit` values and a sample `--when` date range
- Measures real time, user/sys CPU, and peak memory with `/usr/bin/time`
- Outputs NDJSON results to `bench/output_<limit>.ndjson` and stats to `bench/stats_<limit>.txt`

To run benchmarks:
```bash
chmod +x bench/benchmark.sh
./bench/benchmark.sh
```

Adjust `LIMITS` and `DATE_RANGE` inside the script to customize runs. The `bench/vscode` clone and output files are ignored via `.gitignore` and safe to delete when done.

---

## Contributing

1. Fork the repo & clone
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write code & tests
4. Submit a pull request

---

## License

MIT
