const fs = require('fs');
const path = require('path');
const os = require('os');

// Use a temporary directory as home to isolate presets
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-when-test-'));
jest.spyOn(os, 'homedir').mockReturnValue(tmpDir);

const configDir = path.join(tmpDir, '.config', 'git-when');
const presetsFile = path.join(configDir, 'presets.json');

const { loadPresets, savePreset, deletePreset, listPresets } = require('../lib/presets');

describe('presets module', () => {
  beforeEach(() => {
    // Clean config dir before each test
    if (fs.existsSync(configDir)) {
      fs.rmSync(configDir, { recursive: true, force: true });
    }
  });

  test('loadPresets on fresh directory returns empty object and creates file', () => {
    const presets = loadPresets();
    expect(presets).toEqual({});
    expect(fs.existsSync(presetsFile)).toBe(true);
  });

  test('savePreset and listPresets works', () => {
    savePreset('foo', { who: 'Alice' });
    let names = listPresets();
    expect(names).toContain('foo');
    let loaded = loadPresets();
    expect(loaded.foo).toEqual({ who: 'Alice' });

    savePreset('bar', { what: 'test' });
    names = listPresets();
    expect(new Set(names)).toEqual(new Set(['foo', 'bar']));
    loaded = loadPresets();
    expect(loaded.bar).toEqual({ what: 'test' });
  });

  test('deletePreset removes entry', () => {
    savePreset('foo', { who: 'Alice' });
    savePreset('bar', { what: 'test' });
    deletePreset('foo');
    const names = listPresets();
    expect(names).toEqual(['bar']);
    const loaded = loadPresets();
    expect(loaded.foo).toBeUndefined();
  });

  test('deletePreset for non-existing name does nothing', () => {
    savePreset('bar', { what: 'test' });
    deletePreset('nope');
    const names = listPresets();
    expect(names).toEqual(['bar']);
  });
}); 