const { validatePresetOptions } = require('../lib/presets');
const { validateDateRange } = require('../lib/utils');

describe('Validation Tests', () => {
  describe('validateDateRange', () => {
    test('validates correct date ranges', () => {
      expect(() => validateDateRange('2024-01-01..2024-01-31')).not.toThrow();
      expect(() => validateDateRange('today')).not.toThrow();
      expect(() => validateDateRange('last-week')).not.toThrow();
      expect(() => validateDateRange('2024-01-15')).not.toThrow();
      expect(() => validateDateRange('')).not.toThrow();
      expect(() => validateDateRange(undefined)).not.toThrow();
    });

    test('throws for invalid date ranges', () => {
      expect(() => validateDateRange('not-a-date')).toThrow(/Invalid date range/);
      expect(() => validateDateRange('2024-13-01..2024-12-01')).toThrow(/Invalid date range/);
      expect(() => validateDateRange('2024-01-32..2024-01-31')).toThrow(/Invalid date range/);
      expect(() => validateDateRange('not-a-date..2024-01-01')).toThrow(/Invalid date range/);
    });
  });

  describe('validatePresetOptions', () => {
    test('validates correct preset options', () => {
      const validOpts = {
        when: '2024-01-01..2024-01-31',
        who: 'john',
        what: 'feature',
        path: 'src/**/*.js',
        format: 'table',
        limit: 10,
        batchSize: 5,
        fuzzyThreshold: 0.5
      };
      expect(() => validatePresetOptions(validOpts)).not.toThrow();
    });

    test('validates empty options', () => {
      expect(() => validatePresetOptions({})).not.toThrow();
    });

    test('throws for invalid date range', () => {
      const opts = { when: 'not-a-date' };
      expect(() => validatePresetOptions(opts)).toThrow(/Invalid date range/);
    });

    test('throws for invalid limit', () => {
      expect(() => validatePresetOptions({ limit: -1 })).toThrow(/Invalid limit/);
      expect(() => validatePresetOptions({ limit: 0 })).toThrow(/Invalid limit/);
      expect(() => validatePresetOptions({ limit: 'not-a-number' })).toThrow(/Invalid limit/);
      expect(() => validatePresetOptions({ limit: 3.14 })).toThrow(/Invalid limit/);
    });

    test('throws for invalid batch size', () => {
      expect(() => validatePresetOptions({ batchSize: -1 })).toThrow(/Invalid batch size/);
      expect(() => validatePresetOptions({ batchSize: 0 })).toThrow(/Invalid batch size/);
      expect(() => validatePresetOptions({ batchSize: 'not-a-number' })).toThrow(/Invalid batch size/);
    });

    test('throws for invalid format', () => {
      expect(() => validatePresetOptions({ format: 'invalid-format' })).toThrow(/Invalid format/);
    });

    test('allows valid formats', () => {
      const validFormats = ['table', 'json', 'csv', 'md', 'markdown', 'ndjson'];
      validFormats.forEach(format => {
        expect(() => validatePresetOptions({ format })).not.toThrow();
      });
    });

    test('throws for invalid fuzzy threshold', () => {
      expect(() => validatePresetOptions({ fuzzyThreshold: -0.1 })).toThrow(/Invalid fuzzy threshold/);
      expect(() => validatePresetOptions({ fuzzyThreshold: 1.1 })).toThrow(/Invalid fuzzy threshold/);
      expect(() => validatePresetOptions({ fuzzyThreshold: 'not-a-number' })).toThrow(/Invalid fuzzy threshold/);
    });

    test('allows valid fuzzy thresholds', () => {
      expect(() => validatePresetOptions({ fuzzyThreshold: 0 })).not.toThrow();
      expect(() => validatePresetOptions({ fuzzyThreshold: 0.5 })).not.toThrow();
      expect(() => validatePresetOptions({ fuzzyThreshold: 1 })).not.toThrow();
    });
  });
});
