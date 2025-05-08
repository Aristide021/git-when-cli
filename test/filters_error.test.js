const { applyFilters } = require('../lib/filters');

describe('applyFilters error handling', () => {
  const commits = [
    { files: ['a.txt'] },
    { files: ['b.js'] }
  ];

  test('invalid glob pattern does not throw and returns empty array', () => {
    expect(() => applyFilters(commits, { path: '[' })).not.toThrow();
    const result = applyFilters(commits, { path: '[' });
    expect(result).toEqual([]);
  });
}); 