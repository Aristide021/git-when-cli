const fs = require('fs');
const path = require('path');
const os = require('os');

const configDir = path.join(os.homedir(), '.config', 'git-when');
const presetsFile = path.join(configDir, 'presets.json');

function ensureFile() {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  if (!fs.existsSync(presetsFile)) {
    fs.writeFileSync(presetsFile, JSON.stringify({}, null, 2));
  }
}

function loadPresets() {
  ensureFile();
  try {
    const raw = fs.readFileSync(presetsFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function savePreset(name, opts) {
  const presets = loadPresets();
  presets[name] = opts;
  fs.writeFileSync(presetsFile, JSON.stringify(presets, null, 2));
}

function deletePreset(name) {
  const presets = loadPresets();
  if (presets[name]) {
    delete presets[name];
    fs.writeFileSync(presetsFile, JSON.stringify(presets, null, 2));
  }
}

function listPresets() {
  const presets = loadPresets();
  return Object.keys(presets);
}

module.exports = { loadPresets, savePreset, deletePreset, listPresets };
