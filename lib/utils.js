function parseDateRange(text) {
  if (!text) {
    return { since: undefined, until: undefined, isShorthand: false };
  }
  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;

  const parsePart = (str, end = false) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      // Treat date-only as UTC to avoid timezone issues
      const date = end ? new Date(`${str}T23:59:59.999Z`) : new Date(`${str}T00:00:00Z`);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${str}`);
      }
      return date;
    }
    if (/^\d{4}-\d{2}$/.test(str)) {
      const [y, m] = str.split('-').map(Number);
      if (m < 1 || m > 12) {
        throw new Error(`Invalid month in date: ${str}`);
      }
      const d = new Date(y, m - 1, 1);
      if (end) {
        const next = new Date(y, m, 1);
        return new Date(next.getTime() - 1);
      }
      return d;
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid date part: ${str}`);
    }
    return d;
  };

  // Handle shorthand ranges - these can be optimized for Git
  if (text === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { since: start, until: now, isShorthand: true };
  }
  if (text === 'yesterday') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const end = new Date(start.getTime() + msInDay - 1);
    return { since: start, until: end, isShorthand: true };
  }
  if (text === 'last-week') {
    return { since: new Date(now.getTime() - 7 * msInDay), until: now, isShorthand: true };
  }
  if (text === 'last-month') {
    return { since: new Date(now.getTime() - 30 * msInDay), until: now, isShorthand: true };
  }

  const parts = text.split('..');
  if (parts.length === 2) {
    return {
      since: parsePart(parts[0], false),
      until: parsePart(parts[1], true),
      isShorthand: false,
    };
  }

  // Single date
  const d = parsePart(text, false);
  return { since: d, until: d, isShorthand: false };
}

/**
 * Validates a date range configuration
 * @param {string} text - The date range text to validate
 * @throws {Error} If the date range is invalid
 */
function validateDateRange(text) {
  if (!text) return;
  
  try {
    parseDateRange(text);
  } catch (error) {
    throw new Error(`Invalid date range '${text}': ${error.message}`);
  }
}

module.exports = { parseDateRange, validateDateRange };
