const Fuse = require('fuse.js');
const mm = require('minimatch');
// `minimatch` may be exported as default or as a named function
const minimatch = mm.minimatch || mm.default || mm;

/**
 * Apply fuzzy and glob filters to commit list
 * @param {Array<Object>} commits
 * @param {Object} opts
 * @param {string} [opts.who]
 * @param {string} [opts.what]
 * @param {string} [opts.path]
 */
function applyFilters(commits, opts = {}) {
  let result = commits;

  // Fuzzy match on author
  if (opts.who) {
    const fuse = new Fuse(result, { keys: ['author'], threshold: 0.4 });
    result = fuse.search(opts.who).map(r => r.item);
  }

  // Fuzzy match on commit message
  if (opts.what) {
    const fuse = new Fuse(result, { keys: ['message'], threshold: 0.4 });
    result = fuse.search(opts.what).map(r => r.item);
  }

  // Glob match on file paths
  if (opts.path) {
    const pattern = opts.path;
    // Determine if pattern contains glob metacharacters
    const hasMeta = /[*?[\]!]/.test(pattern);
    if (hasMeta) {
      result = result.filter(c => {
        return c.files && c.files.some(f => {
          try {
            return minimatch(f, pattern, { nocase: true });
          } catch {
            return false;
          }
        });
      });
    } else {
      // simple substring match (case-insensitive)
      const substr = pattern.toLowerCase();
      result = result.filter(c => c.files && c.files.some(f => f.toLowerCase().includes(substr)));
    }
  }

  return result;
}

module.exports = { applyFilters };
