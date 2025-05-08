const { spawn } = require('child_process');
const readline = require('readline');
const { pipeline, Transform } = require('stream');

/**
 * Fetch commits by streaming git log output with optional filters.
 * @param {string} [since] ISO or git date string for --since
 * @param {string} [until] ISO or git date string for --until
 * @param {number} [limit] max commits (--max-count)
 * @param {string} [author] --author filter
 * @param {string} [grep] --grep filter
 * @param {string} [pathGlob] --pathspec filter
 * @returns {Promise<Commit[]>}
 */
async function fetchCommits(since, until, limit, author, grep, pathGlob) {
  const args = ['log', '--pretty=format:%H|%an|%aI|%s', '--name-only'];
  if (since) args.push(`--since=${since}`);
  if (until) args.push(`--until=${until}`);
  if (author) args.push(`--author=${author}`);
  if (grep) args.push(`--grep=${grep}`);
  if (limit) args.push(`--max-count=${limit}`); // Git handles the limit
  if (pathGlob) args.push('--', pathGlob);

  const child = spawn('git', args);
  const rl = readline.createInterface({ input: child.stdout });
  let stderrData = '';
  const commits = [];
  let buffer = [];

  return new Promise((resolve, reject) => {
    child.once('error', reject);
    child.stderr.on('data', data => { stderrData += data.toString(); });

    const headerRx = /^([^|]+\|){3}/;
    rl.on('line', line => {
      if (headerRx.test(line)) {
        if (buffer.length > 0) {
          commits.push(parseBuffer(buffer));
        }
        buffer = [line];
      } else {
        buffer.push(line);
      }
    });

    let rlClosed = false;
    let childExited = false;
    let finalExitCode = -1; // Use a different variable name to avoid confusion with 'code' parameter

    rl.on('close', () => {
      rlClosed = true;
      if (buffer.length > 0) {
        commits.push(parseBuffer(buffer));
        buffer = []; // Clear buffer
      }
      if (childExited) { // If child has already exited
        if (finalExitCode === 0) {
          resolve(commits);
        } else {
          const error = new Error(stderrData || `Git command failed with exit code ${finalExitCode}`);
          error.stderr = stderrData;
          error.status = finalExitCode;
          reject(error);
        }
      }
    });

    child.on('exit', (code) => {
      childExited = true;
      finalExitCode = code;
      if (rlClosed) { // If readline has already closed
        if (finalExitCode === 0) {
          resolve(commits);
        } else {
          const error = new Error(stderrData || `Git command failed with exit code ${finalExitCode}`);
          error.stderr = stderrData;
          error.status = finalExitCode; // Use the stored exit code
          reject(error);
        }
      }
      // If rlClosed is false, rl.on('close') will handle the resolve/reject
    });
  });
}

/**
 * Parse a block of lines into a Commit object.
 * @param {string[]} lines
 */
function parseBuffer(lines) {
  const header = lines[0];
  const parts = header.split('|');
  const hash = parts[0];
  const author = parts[1];
  const date = parts[2];
  const message = parts.slice(3).join('|');
  const files = lines.slice(1).filter(f => f); // Filter out empty strings (like the blank line between commits)
  return { hash, author, date, message, files };
}

// Streaming function using pipeline for NDJSON output with backpressure
function streamCommits(since, until, limit, author, grep, pathGlob) {
  const args = ['log', '--pretty=format:%H|%an|%aI|%s', '--name-only'];
  if (since) args.push(`--since=${since}`);
  if (until) args.push(`--until=${until}`);
  if (author) args.push(`--author=${author}`);
  if (grep)   args.push(`--grep=${grep}`);
  if (limit)  args.push(`--max-count=${limit}`);
  if (pathGlob) args.push('--', pathGlob);

  const child = spawn('git', args);
  child.once('error', err => { console.error('Error spawning git:', err.message); process.exit(1); });
  child.stderr.on('data', data => { console.error(data.toString()); process.exit(1); });

  const headerRx = /^([^|]+\|){3}/;

  class CommitTransform extends Transform {
    constructor() {
      super();
      this._rem = '';
      this._bufferedLines = [];
      this._count = 0;
    }
    _transform(chunk, encoding, callback) {
      const data = this._rem + chunk.toString('utf8');
      const lines = data.split(/\r?\n/);
      this._rem = lines.pop() || '';
      for (const line of lines) {
        if (headerRx.test(line)) {
          if (this._bufferedLines.length) {
            const commit = parseBuffer(this._bufferedLines);
            this.push(JSON.stringify(commit) + '\n');
            this._count++;
            if (limit && this._count >= limit) { child.kill(); return callback(); }
          }
          this._bufferedLines = [line];
        } else {
          this._bufferedLines.push(line);
        }
      }
      callback();
    }
    _flush(callback) {
      if (this._rem) {
        const line = this._rem;
        if (headerRx.test(line)) {
          if (this._bufferedLines.length) {
            const commit = parseBuffer(this._bufferedLines);
            this.push(JSON.stringify(commit) + '\n');
          }
          this._bufferedLines = [line];
        } else {
          this._bufferedLines.push(line);
        }
      }
      if (this._bufferedLines.length && (!limit || this._count < limit)) {
        const commit = parseBuffer(this._bufferedLines);
        this.push(JSON.stringify(commit) + '\n');
      }
      callback();
    }
  }

  pipeline(
    child.stdout,
    new CommitTransform(),
    process.stdout,
    err => {
      if (err) {
        console.error('Pipeline failed:', err.message);
        process.exit(1);
      }
    }
  );
}

// Export both batch and streaming APIs
module.exports = { fetchCommits, streamCommits };
