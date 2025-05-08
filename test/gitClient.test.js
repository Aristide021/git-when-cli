jest.mock('child_process', () => {
  const { EventEmitter } = require('events');
  const { Readable } = require('stream');
  return {
    spawn: (cmd, args) => {
      const child = new EventEmitter();
      const stdout = new Readable({ read() {} });
      const stderr = new Readable({ read() {} });
      child.stdout = stdout;
      child.stderr = stderr;
      process.nextTick(() => {
        if (args.includes('--max-count=1')) {
          // Only first commit
          stdout.push('h1|Alice|2023-01-01|Init commit\n');
          stdout.push('file1.js\n');
          stdout.push('file2.js\n');
          stdout.push(null);
        } else {
          // Two commits
          stdout.push('h1|Alice|2023-01-01|Init commit\n');
          stdout.push('file1.js\n');
          stdout.push('file2.js\n');
          stdout.push('\n');
          stdout.push('h2|Bob|2023-01-02|Add feature\n');
          stdout.push('main.py\n');
          stdout.push(null);
        }
        child.emit('close', 0);
      });
      return child;
    }
  };
});

const { fetchCommits } = require('../lib/gitClient');

describe('fetchCommits', () => {
  it('parses commit headers and files correctly', async () => {
    const commits = await fetchCommits();
    expect(commits).toEqual([
      {
        hash: 'h1',
        author: 'Alice',
        date: '2023-01-01',
        message: 'Init commit',
        files: ['file1.js', 'file2.js']
      },
      {
        hash: 'h2',
        author: 'Bob',
        date: '2023-01-02',
        message: 'Add feature',
        files: ['main.py']
      }
    ]);
  });

  it('respects limit parameter', async () => {
    const commits = await fetchCommits(null, null, 1);
    expect(commits.length).toBe(1);
    expect(commits[0].hash).toBe('h1');
  });
});
