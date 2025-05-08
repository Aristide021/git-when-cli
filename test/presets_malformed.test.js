const fs = require('fs');
const path = require('path');
const os = require('os');

// Use a temporary directory as home to isolate presets
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-when-test-'));
jest.spyOn(os, 'homedir').mockReturnValue(tmpDir);

const configDir = path.join(tmpDir, '.config', 'git-when');
const presetsFile = path.join(configDir, 'presets.json');
const { loadPresets } = require('../lib/presets');

describe('loadPresets with malformed JSON', () => {
  beforeEach(() => {
    // Ensure config dir exists and write malformed JSON
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(presetsFile, 'INVALID JSON');
  });

  test('loadPresets returns empty object for malformed JSON', () => {
    const presets = loadPresets();
    expect(presets).toEqual({});
  });
}); 