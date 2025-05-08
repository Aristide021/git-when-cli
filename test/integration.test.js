const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('integration: git-when CLI', () => {
  let repoDir;
  const cliPath = path.join(__dirname, '..', 'bin', 'git-when');

  beforeAll(() => {
    // Set up a temporary Git repo
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-when-integ-'));
    execSync('git init', { cwd: repoDir });
    // Use a consistent committer date equal to the author date
    const envVars = { ...process.env };
    // First commit with author and committer dates
    fs.writeFileSync(path.join(repoDir, 'file1.txt'), 'hello');
    execSync('git add .', { cwd: repoDir, env: envVars });
    envVars.GIT_COMMITTER_DATE = '2023-01-01T00:00:00Z';
    execSync(
      'git commit -m "Initial commit" --author="Test User <test@example.com>" --date="2023-01-01T00:00:00Z"',
      { cwd: repoDir, env: envVars }
    );
    // Second commit with author and committer dates
    fs.writeFileSync(path.join(repoDir, 'another.txt'), 'world');
    execSync('git add .', { cwd: repoDir, env: envVars });
    envVars.GIT_COMMITTER_DATE = '2023-02-01T00:00:00Z';
    execSync(
      'git commit -m "Second commit" --author="Another User <another@example.com>" --date="2023-02-01T00:00:00Z"',
      { cwd: repoDir, env: envVars }
    );
  });

  test('returns both commits with no filters', () => {
    const output = execSync(`node ${cliPath} --format=json`, { cwd: repoDir }).toString();
    const commits = JSON.parse(output);
    expect(commits).toHaveLength(2);
    const messages = commits.map(c => c.message);
    expect(messages).toEqual(expect.arrayContaining(['Initial commit', 'Second commit']));
  });

  test('filters by author fuzzy match', () => {
    const output = execSync(`node ${cliPath} --who="Test Us" --format=json`, { cwd: repoDir }).toString();
    const commits = JSON.parse(output);
    expect(commits).toHaveLength(1);
    expect(commits[0].author).toContain('Test User');
  });

  test('filters by date range', () => {
    const output = execSync(`node ${cliPath} --when="2023-02-01..2023-02-28" --format=json`, { cwd: repoDir }).toString();
    const commits = JSON.parse(output);
    expect(commits).toHaveLength(1);
    expect(commits[0].message).toBe('Second commit');
  });

  test('filters by glob path', () => {
    const output = execSync(`node ${cliPath} --path="another.*" --format=json`, { cwd: repoDir }).toString();
    const commits = JSON.parse(output);
    expect(commits).toHaveLength(1);
    expect(commits[0].files).toContain('another.txt');
  });

  test('limits commits via --limit flag', () => {
    const output = execSync(`node ${cliPath} --limit=1 --format=json`, { cwd: repoDir }).toString();
    const commits = JSON.parse(output);
    expect(commits).toHaveLength(1);
  });
}); 