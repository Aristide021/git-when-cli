const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateDateRange } = require('./utils');

const configDir = path.join(os.homedir(), '.config', 'git-when');
const presetsFile = path.join(configDir, 'presets.json');

/**
 * Validates preset options before saving
 * @param {object} opts - The preset options to validate
 * @throws {Error} If any option is invalid
 */
function validatePresetOptions(opts) {
  // Validate date range if present
  if (opts.when) {
    validateDateRange(opts.when);
  }
  
  // Validate limit if present
  if (opts.limit !== undefined) {
    if (!Number.isInteger(opts.limit) || opts.limit <= 0) {
      throw new Error(`Invalid limit '${opts.limit}': must be a positive integer`);
    }
  }
  
  // Validate batch size if present
  if (opts.batchSize !== undefined) {
    if (!Number.isInteger(opts.batchSize) || opts.batchSize <= 0) {
      throw new Error(`Invalid batch size '${opts.batchSize}': must be a positive integer`);
    }
  }
  
  // Validate format if present
  if (opts.format) {
    const validFormats = ['table', 'json', 'csv', 'md', 'markdown', 'ndjson'];
    if (!validFormats.includes(opts.format)) {
      throw new Error(`Invalid format '${opts.format}': must be one of ${validFormats.join(', ')}`);
    }
  }
  
  // Validate fuzzy threshold if present
  if (opts.fuzzyThreshold !== undefined) {
    if (typeof opts.fuzzyThreshold !== 'number' || opts.fuzzyThreshold < 0 || opts.fuzzyThreshold > 1) {
      throw new Error(`Invalid fuzzy threshold '${opts.fuzzyThreshold}': must be a number between 0.0 and 1.0`);
    }
  }
}

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
  // Validate options before saving
  validatePresetOptions(opts);
  
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

module.exports = { loadPresets, savePreset, deletePreset, listPresets, validatePresetOptions };
