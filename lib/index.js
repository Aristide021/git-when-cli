const path = require('path');
const pkg = require(path.join(__dirname, '..', 'package.json'));
const { loadPresets, savePreset, deletePreset, listPresets } = require('./presets');
const { parseDateRange } = require('./utils');
const { fetchCommits, streamCommits } = require('./gitClient');
const { applyFilters } = require('./filters');
const { formatTable, formatJSON, formatCSV, formatMarkdown } = require('./formatter');

function printUsage() {
  console.log(`
Usage: git when [preset] [options]

Commands:
  edit <name> [options]   Edit an existing preset
  --help                 Show this help message
  --version              Show version
  --list-presets         List saved presets
  --delete-preset <name> Delete preset by name

Options:
  -w, --when <range>     Date range (e.g. '2024-01..2024-03', 'last-week')
  -a, --who <author>     Author name (fuzzy)
  -k, --what <keyword>   Commit message keyword (fuzzy)
  -p, --path <glob>      File path glob (e.g. 'src/**/*.js')
  -f, --format <type>    Output format: table, json, csv, md
  --batch-size <num>     For pretty formats, render N commits per batch
  -s, --save <name>      Save current flags as preset
  -o, --overwrite        Overwrite existing preset without warning
  -n, --limit <number>   Limit the number of commits
`);
}

(async () => {
  try {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.length === 0) {
      printUsage();
      process.exit(0);
    }
    if (args.includes('--version')) {
      console.log(pkg.version);
      process.exit(0);
    }

    // List presets
    if (args.includes('--list-presets')) {
      const names = listPresets();
      if (names.length === 0) {
        console.log('No presets saved.');
      } else {
        console.log('Saved presets:');
        names.forEach((n) => console.log(`  ${n}`));
      }
      process.exit(0);
    }

    // Delete a preset
    const delIdx = args.indexOf('--delete-preset');
    if (delIdx !== -1) {
      const name = args[delIdx + 1];
      if (!name) {
        console.error('Error: --delete-preset requires a name');
        process.exit(1);
      }
      deletePreset(name);
      console.log(`Deleted preset '${name}'.`);
      process.exit(0);
    }

    // Load presets
    const presets = loadPresets();
    // Edit an existing preset
    if (args[0] === 'edit') {
      const name = args[1];
      if (!name) {
        console.error('Error: edit requires a preset name');
        process.exit(1);
      }
      if (!presets[name]) {
        console.error(`Error: preset '${name}' not found`);
        process.exit(1);
      }
      // Seed opts with existing preset
      let optsEdit = { ...presets[name] };
      // Remove 'edit' and preset name
      args.splice(0, 2);
      // Parse flags into optsEdit (reuse flag logic)
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        // Allow overwrite flag in edit
        if (arg === '--overwrite' || arg === '-o') {
          continue;
        }
        if (arg.startsWith('--when=')) { optsEdit.when = arg.slice('--when='.length); continue; }
        if (arg.startsWith('--who='))  { optsEdit.who   = arg.slice('--who='.length);   continue; }
        if (arg.startsWith('--what=')) { optsEdit.what  = arg.slice('--what='.length);  continue; }
        if (arg.startsWith('--path=')) { optsEdit.path  = arg.slice('--path='.length);  continue; }
        if (arg.startsWith('--format=')){ optsEdit.format= arg.slice('--format='.length);continue; }
        if (arg.startsWith('--limit=')){ optsEdit.limit = parseInt(arg.slice('--limit='.length), 10); continue; }
        switch (arg) {
          case '-w': case '--when': optsEdit.when = args[++i]; break;
          case '-a': case '--who':  optsEdit.who   = args[++i]; break;
          case '-k': case '--what': optsEdit.what  = args[++i]; break;
          case '-p': case '--path': optsEdit.path  = args[++i]; break;
          case '-f': case '--format':optsEdit.format= args[++i]; break;
          case '-n': case '--limit':
            optsEdit.limit = parseInt(args[++i], 10);
            if (isNaN(optsEdit.limit) || optsEdit.limit <= 0) {
              console.error('Error: --limit must be a positive integer');
              process.exit(1);
            }
            break;
          default:
            console.error(`Unknown option during edit: ${arg}`);
            process.exit(1);
        }
      }
      savePreset(name, optsEdit);
      console.log(`Updated preset '${name}'.`);
      process.exit(0);
    }

    // Existing logic to seed opts from presets or parse new flags
    let opts = {};
    const first = args[0];
    if (first && !first.startsWith('-') && presets[first]) {
      opts = presets[first];
      args.shift();
    } else {
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        // handle overwrite flag
        if (arg === '--overwrite' || arg === '-o') {
          opts.overwrite = true;
          continue;
        }
        // support --flag=value syntax
        if (arg.startsWith('--when=')) {
          opts.when = arg.slice('--when='.length);
          continue;
        }
        if (arg.startsWith('--who=')) {
          opts.who = arg.slice('--who='.length);
          continue;
        }
        if (arg.startsWith('--what=')) {
          opts.what = arg.slice('--what='.length);
          continue;
        }
        if (arg.startsWith('--path=')) {
          opts.path = arg.slice('--path='.length);
          continue;
        }
        if (arg.startsWith('--format=')) {
          opts.format = arg.slice('--format='.length);
          continue;
        }
        if (arg.startsWith('--save=')) {
          opts.save = arg.slice('--save='.length);
          continue;
        }
        if (arg.startsWith('--limit=')) {
          opts.limit = parseInt(arg.slice('--limit='.length), 10);
          if (isNaN(opts.limit) || opts.limit <= 0) {
            console.error('Error: --limit must be a positive integer');
            process.exit(1);
          }
          continue;
        }
        if (arg.startsWith('--batch-size=')) {
          opts.batchSize = parseInt(arg.slice('--batch-size='.length), 10);
          if (isNaN(opts.batchSize) || opts.batchSize <= 0) {
            console.error('Error: --batch-size must be a positive integer');
            process.exit(1);
          }
          continue;
        }
        switch (arg) {
          case '-w':
          case '--when':
            opts.when = args[++i];
            break;
          case '-a':
          case '--who':
            opts.who = args[++i];
            break;
          case '-k':
          case '--what':
            opts.what = args[++i];
            break;
          case '-p':
          case '--path':
            opts.path = args[++i];
            break;
          case '-f':
          case '--format':
            opts.format = args[++i];
            break;
          case '-s':
          case '--save':
            opts.save = args[++i];
            break;
          case '-n':
          case '--limit':
            opts.limit = parseInt(args[++i], 10);
            if (isNaN(opts.limit) || opts.limit <= 0) {
              console.error('Error: --limit must be a positive integer');
              process.exit(1);
            }
            break;
          case '--batch-size':
            opts.batchSize = parseInt(args[++i], 10);
            if (isNaN(opts.batchSize) || opts.batchSize <= 0) {
              console.error('Error: --batch-size must be a positive integer');
              process.exit(1);
            }
            break;
          default:
            console.error(`Unknown option: ${arg}`);
            printUsage();
            process.exit(1);
        }
      }
    }

    // Save preset if requested
    if (opts.save) {
      if (!opts.overwrite && presets[opts.save]) {
        console.error(`Preset '${opts.save}' already exists. Use --overwrite to overwrite.`);
        process.exit(1);
      }
      const name = opts.save;
      delete opts.save;
      delete opts.overwrite;
      savePreset(name, opts);
      console.log(`Saved preset '${name}'.`);
      process.exit(0);
    }

    // Parse date range
    let since, until;
    try {
      const range = opts.when || '';
      ({ since, until } = parseDateRange(range));
    } catch (e) {
      console.error('Invalid date range:', e.message);
      process.exit(1);
    }

    // Determine git log date filters: raw strings for explicit ranges, ISO for parsed dates
    let gitSince, gitUntil;
    if (opts.when && opts.when.includes('..')) {
      const parts = opts.when.split('..');
      // Use full UTC date-times to avoid local-timezone exclusion
      const start = parts[0];
      const end = parts[1];
      gitSince = `${start}T00:00:00+00:00`;
      gitUntil = `${end}T23:59:59+00:00`;
    } else {
      gitSince = since ? since.toISOString().replace(/\.\d+Z$/, 'Z') : undefined;
      gitUntil = until ? until.toISOString().replace(/\.\d+Z$/, 'Z') : undefined;
    }

    // Streaming NDJSON output: emit each commit as a JSON line and exit
    const fmt = opts.format || 'table';
    if (fmt === 'ndjson') {
      try {
        streamCommits(gitSince, gitUntil, opts.limit, opts.who, opts.what, opts.path);
      } catch (e) {
        console.error('Error streaming commits:', e.message);
        process.exit(1);
      }
      process.exit(0);
    }

    let commits;
    try {
      commits = await fetchCommits(gitSince, gitUntil, opts.limit, opts.who, opts.what, opts.path);
    } catch (e) {
      const msg = (e.stderr || e.message || '').toString();
      if (msg.includes('not a git repository')) {
        console.error('Error: current directory is not a Git repository');
      } else {
        console.error('Error fetching commits:', e.message);
      }
      process.exit(1);
    }
    // If we used an explicit '..' range, Git already filtered by date; otherwise, apply JS date filtering
    let dated = commits;
    if (since) dated = dated.filter(c => new Date(c.date) >= since);
    if (until) dated = dated.filter(c => new Date(c.date) <= until);
    const filtered = applyFilters(dated, opts);

    // Batch-size for pretty formats (table, CSV, Markdown)
    const batchSize = opts.batchSize;
    if (batchSize && fmt !== 'json' && fmt !== 'ndjson') {
      for (let i = 0; i < filtered.length; i += batchSize) {
        const chunk = filtered.slice(i, i + batchSize);
        let out;
        switch (fmt) {
          case 'csv':
            out = formatCSV(chunk);
            break;
          case 'md':
          case 'markdown':
            out = formatMarkdown(chunk);
            break;
          default:
            out = formatTable(chunk);
        }
        console.log(out);
      }
    } else {
      let output;
      switch (fmt) {
        case 'json':
          output = formatJSON(filtered);
          break;
        case 'csv':
          output = formatCSV(filtered);
          break;
        case 'md':
        case 'markdown':
          output = formatMarkdown(filtered);
          break;
        default:
          output = formatTable(filtered);
      }
      console.log(output);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
