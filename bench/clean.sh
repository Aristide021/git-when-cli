#!/usr/bin/env bash
set -euo pipefail

# Remove the cloned VSCode repository
rm -rf "$(pwd)/bench/vscode"

# Remove all benchmark outputs
rm -f bench/output_*.json bench/output_*.ndjson bench/stats_*.txt

echo "Bench directory cleaned." 