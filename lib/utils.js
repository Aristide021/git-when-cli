function parseDateRange(text) {
  if (!text) {
    return { since: undefined, until: undefined };
  }
  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;

  const parsePart = (str, end = false) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      // Treat date-only as UTC to avoid timezone issues
      if (!end) {
        return new Date(`${str}T00:00:00Z`);
      } else {
        return new Date(`${str}T23:59:59.999Z`);
      }
    }
    if (/^\d{4}-\d{2}$/.test(str)) {
      const [y, m] = str.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      if (end) {
        const next = new Date(y, m, 1);
        return new Date(next.getTime() - 1);
      }
      return d;
    }
    const d = new Date(str);
    if (!isNaN(d)) {
      return d;
    }
    throw new Error(`Invalid date part: ${str}`);
  };

  if (text === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { since: start, until: now };
  }
  if (text === 'yesterday') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const end = new Date(start.getTime() + msInDay - 1);
    return { since: start, until: end };
  }
  if (text === 'last-week') {
    return { since: new Date(now.getTime() - 7 * msInDay), until: now };
  }
  if (text === 'last-month') {
    return { since: new Date(now.getTime() - 30 * msInDay), until: now };
  }

  const parts = text.split('..');
  if (parts.length === 2) {
    return {
      since: parsePart(parts[0], false),
      until: parsePart(parts[1], true),
    };
  }

  // Single date
  const d = parsePart(text, false);
  return { since: d, until: d };
}

module.exports = { parseDateRange };
