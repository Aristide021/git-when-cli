const { applyFilters } = require('../lib/filters');

describe('applyFilters', () => {
  const commits = [
    { author: 'Alice', message: 'Fix bug', files: ['src/index.js'] },
    { author: 'Bob', message: 'Add feature', files: ['README.md'] },
    { author: 'Carol', message: 'Update docs', files: ['docs/guide.md'] }
  ];

  test('no filters returns all commits', () => {
    expect(applyFilters(commits, {})).toEqual(commits);
  });

  test('filters by author', () => {
    const result = applyFilters(commits, { who: 'ali' });
    expect(result).toEqual([commits[0]]);
  });

  test('filters by message keyword', () => {
    const result = applyFilters(commits, { what: 'add' });
    expect(result).toEqual([commits[1]]);
  });

  test('filters by file path', () => {
    const result = applyFilters(commits, { path: 'docs' });
    expect(result).toEqual([commits[2]]);
  });

  test('combines multiple filters', () => {
    const result = applyFilters(commits, { who: 'b', what: 'feature' });
    expect(result).toEqual([commits[1]]);
  });
});
