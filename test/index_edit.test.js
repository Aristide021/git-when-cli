const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

describe('Preset save/edit flows', () => {
  let tmpHome;
  const cli = path.join(__dirname, '..', 'bin', 'git-when');

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'git-when-home-'));
  });

  test('save collision without overwrite errors out', () => {
    // First save
    execSync(`node ${cli} --save foo --who Alice`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    // Second save should fail
    let err;
    try {
      execSync(`node ${cli} --save foo --who Bob`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome }, stdio: 'pipe' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.status).toBe(1);
    expect(err.stderr.toString()).toMatch(/already exists/);
  });

  test('save with --overwrite updates preset', () => {
    execSync(`node ${cli} --save foo --who Alice`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    execSync(`node ${cli} --save foo --who Bob --overwrite`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    const cfg = JSON.parse(fs.readFileSync(path.join(tmpHome, '.config', 'git-when', 'presets.json'), 'utf8'));
    expect(cfg.foo.who).toBe('Bob');
  });

  test('edit non-existent preset errors out', () => {
    let err;
    try {
      execSync(`node ${cli} edit bar --who Carol`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome }, stdio: 'pipe' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.status).toBe(1);
    expect(err.stderr.toString()).toMatch(/not found/);
  });

  test('edit updates existing preset', () => {
    execSync(`node ${cli} --save baz --who Alice --when=2025-01-01..2025-01-31`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    execSync(`node ${cli} edit baz --who Carol --path="src/**/*.js"`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    const cfg = JSON.parse(fs.readFileSync(path.join(tmpHome, '.config', 'git-when', 'presets.json'), 'utf8'));
    expect(cfg.baz.who).toBe('Carol');
    expect(cfg.baz.path).toBe('src/**/*.js');
  });

  test('edit malformed presets.json recovers to not found', () => {
    const cfgDir = path.join(tmpHome, '.config', 'git-when');
    fs.mkdirSync(cfgDir, { recursive: true });
    fs.writeFileSync(path.join(cfgDir, 'presets.json'), 'NOT_JSON');
    let err;
    try {
      execSync(`node ${cli} edit foo --who Dave`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome }, stdio: 'pipe' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.status).toBe(1);
    expect(err.stderr.toString()).toMatch(/not found/);
  });

  test('edit with --overwrite flag updates preset', () => {
    // Seed a preset
    execSync(`node ${cli} --save foo --who Alice`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    // Edit with overwrite
    execSync(`node ${cli} edit foo --who Bob --overwrite`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    const cfg = JSON.parse(fs.readFileSync(path.join(tmpHome, '.config', 'git-when', 'presets.json'), 'utf8'));
    expect(cfg.foo.who).toBe('Bob');
  });

  test('edit with -o shorthand updates preset', () => {
    // Seed another preset
    execSync(`node ${cli} --save bar --who Carol`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    // Edit with shorthand
    execSync(`node ${cli} edit bar -o --who Dave`, { cwd: process.cwd(), env: { ...process.env, HOME: tmpHome } });
    const cfg = JSON.parse(fs.readFileSync(path.join(tmpHome, '.config', 'git-when', 'presets.json'), 'utf8'));
    expect(cfg.bar.who).toBe('Dave');
  });
}); 