const { formatTable, formatJSON, formatCSV, formatMarkdown } = require('../lib/formatter');

describe('Formatter Snapshot Tests', () => {
  const sampleCommits = [
    {
      hash: 'a1b2c3d',
      author: 'John Doe',
      date: '2024-01-15T10:30:00Z',
      message: 'Add new feature',
      files: ['src/feature.js', 'test/feature.test.js']
    },
    {
      hash: 'e4f5g6h',
      author: 'Jane Smith',
      date: '2024-01-14T14:20:00Z',
      message: 'Fix bug in authentication system',
      files: ['src/auth.js']
    },
    {
      hash: 'i7j8k9l',
      author: 'Bob Johnson',
      date: '2024-01-13T09:15:00Z',
      message: 'Update documentation with examples',
      files: ['README.md', 'docs/api.md']
    }
  ];

  test('formatTable produces consistent table output', () => {
    const output = formatTable(sampleCommits);
    expect(output).toMatchSnapshot();
  });

  test('formatJSON produces consistent JSON output', () => {
    const output = formatJSON(sampleCommits);
    expect(output).toMatchSnapshot();
  });

  test('formatCSV produces consistent CSV output', () => {
    const output = formatCSV(sampleCommits);
    expect(output).toMatchSnapshot();
  });

  test('formatMarkdown produces consistent Markdown output', () => {
    const output = formatMarkdown(sampleCommits);
    expect(output).toMatchSnapshot();
  });

  test('formatTable handles empty commits array', () => {
    const output = formatTable([]);
    expect(output).toMatchSnapshot();
  });

  test('formatCSV handles special characters and quotes', () => {
    const commitsWithSpecialChars = [
      {
        hash: 'x1y2z3',
        author: 'User "Test"',
        date: '2024-01-15T10:30:00Z',
        message: 'Fix "critical" bug, add support for CSV,TSV formats',
        files: ['src/parser.js']
      }
    ];
    const output = formatCSV(commitsWithSpecialChars);
    expect(output).toMatchSnapshot();
  });

  test('formatMarkdown handles pipe characters in content', () => {
    const commitsWithPipes = [
      {
        hash: 'p1q2r3',
        author: 'Pipeline User',
        date: '2024-01-15T10:30:00Z',
        message: 'Add pipeline | support for data processing',
        files: ['src/pipeline.js']
      }
    ];
    const output = formatMarkdown(commitsWithPipes);
    expect(output).toMatchSnapshot();
  });
});
