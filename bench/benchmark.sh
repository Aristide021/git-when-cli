#!/usr/bin/env bash
set -euo pipefail

# Directory for VSCode repo
REPO_DIR="$(pwd)/bench/vscode"
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Cloning VSCode repository..."
  rm -rf "$REPO_DIR"
  git clone https://github.com/microsoft/vscode "$REPO_DIR"
fi

cd "$REPO_DIR"
# Ensure full history for full commit access
if git rev-parse --is-shallow-repository >/dev/null 2>&1 && [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
  echo "Fetching full history..."
  git fetch --unshallow
fi
cd - >/dev/null

# Ensure dependencies are installed for the CLI
echo "Installing dependencies..."
npm ci

# Choose time command based on OS
if [ "$(uname)" = "Darwin" ]; then
  TIME_CMD="/usr/bin/time -l"
else
  TIME_CMD="/usr/bin/time -v"
fi

# Define limits to test
LIMITS=(1000 5000 10000 20000 50000)

# Define a realistic date range to test Git-side filtering
DATE_RANGE="2020-01-01..2021-01-01"

# Unbounded full-repo benchmarks
echo "=== Baseline: full history (no --limit) ==="
pushd "$REPO_DIR" > /dev/null
$TIME_CMD node "$OLDPWD/bin/git-when" -f ndjson > "$OLDPWD/bench/output_full.ndjson" 2> "$OLDPWD/bench/stats_full.txt"
popd > /dev/null

echo "=== Filtered: full history --when $DATE_RANGE ==="
pushd "$REPO_DIR" > /dev/null
$TIME_CMD node "$OLDPWD/bin/git-when" --when "$DATE_RANGE" -f ndjson > "$OLDPWD/bench/output_full_date.ndjson" 2> "$OLDPWD/bench/stats_full_date.txt"
popd > /dev/null

# Run benchmarks for each limit: baseline and date-filtered
for limit in "${LIMITS[@]}"; do
  echo "=== Baseline: --limit $limit ==="
  pushd "$REPO_DIR" > /dev/null
  $TIME_CMD node "$OLDPWD/bin/git-when" --limit "$limit" -f ndjson > "$OLDPWD/bench/output_${limit}.ndjson" 2> "$OLDPWD/bench/stats_${limit}.txt"
  popd > /dev/null

  echo "=== Filtered: --limit $limit --when $DATE_RANGE ==="
  pushd "$REPO_DIR" > /dev/null
  $TIME_CMD node "$OLDPWD/bin/git-when" --limit "$limit" --when "$DATE_RANGE" -f ndjson > "$OLDPWD/bench/output_${limit}_date.ndjson" 2> "$OLDPWD/bench/stats_${limit}_date.txt"
  popd > /dev/null

  echo
done

# Summarize
echo "Benchmark completed. Detailed time/memory stats printed above. Output NDJSON and stats files in bench/" 