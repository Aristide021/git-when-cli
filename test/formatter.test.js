const { formatTable, formatJSON, formatCSV, formatMarkdown } = require('../lib/formatter');

describe('formatter', () => {
  const commits = [
    { hash: 'h1', author: 'Alice', date: '2023-01-01', message: 'Test' }
  ];

  test('formatJSON outputs valid JSON', () => {
    const json = formatJSON(commits);
    expect(JSON.parse(json)).toEqual(commits);
  });

  test('formatCSV outputs comma-separated values', () => {
    const csv = formatCSV(commits);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('hash,author,date,message');
    expect(lines[1]).toBe('"h1","Alice","2023-01-01","Test"');
  });

  test('formatMarkdown outputs a markdown table', () => {
    const md = formatMarkdown(commits);
    const lines = md.split('\n');
    expect(lines[0]).toBe('| Hash | Author | Date | Message |');
    expect(lines[1]).toBe('| --- | --- | --- | --- |');
    expect(lines[2]).toBe('| h1 | Alice | 2023-01-01 | Test |');
  });

  test('formatTable outputs an ASCII table', () => {
    const table = formatTable(commits);
    const lines = table.split('\n');
    // table has at least top border, header row, separator, data row, bottom border
    expect(lines.length).toBeGreaterThanOrEqual(5);
    expect(lines[0].startsWith('+')).toBe(true);
    expect(lines[1].startsWith('|')).toBe(true);
    expect(table).toContain('Hash');
    expect(table).toContain('h1');
  });
});
