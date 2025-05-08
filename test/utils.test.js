const { parseDateRange } = require('../lib/utils');

describe('parseDateRange', () => {
  test('empty text returns undefined range', () => {
    const { since, until } = parseDateRange('');
    expect(since).toBeUndefined();
    expect(until).toBeUndefined();
  });

  test('single date returns same since and until', () => {
    const { since, until } = parseDateRange('2023-01-01');
    const expected = new Date('2023-01-01T00:00:00Z');
    expect(since).toEqual(expected);
    expect(until).toEqual(expected);
  });

  test('explicit single-day range', () => {
    const { since, until } = parseDateRange('2023-01-01..2023-01-01');
    const dayMs = 24 * 60 * 60 * 1000;
    expect(since.getTime()).toBe(new Date('2023-01-01T00:00:00Z').getTime());
    expect(until.getTime() - since.getTime()).toBe(dayMs - 1);
  });

  test('month range expands correctly', () => {
    const { since, until } = parseDateRange('2023-02..2023-02');
    // February 2023 has 28 days
    const febStart = new Date(2023, 1, 1).getTime();
    const febEnd = new Date(2023, 2, 1).getTime() - 1;
    expect(since.getTime()).toBe(febStart);
    expect(until.getTime()).toBe(febEnd);
  });
}); 