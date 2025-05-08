const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('integration: git-when CLI error handling', () => {
  let tmpDir;
  const cliPath = path.join(__dirname, '..', 'bin', 'git-when');

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-when-err-'));
  });

  test('exits with error code and message in non-git repo', () => {
    expect(() => {
      execSync(`node ${cliPath} --format=json`, { cwd: tmpDir, stdio: 'pipe' });
    }).toThrow(/not a Git repository/i);
  });
}); 