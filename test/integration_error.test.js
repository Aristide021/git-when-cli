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
    let error;
    try {
      execSync(`node ${cliPath} --format=json`, { cwd: tmpDir, stdio: 'pipe' });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
    expect(error.status).toBe(1);
    const stderr = error.stderr.toString();
    expect(stderr).toMatch(/not a Git repository/i);
  });
}); 