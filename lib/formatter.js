function formatTable(commits) {
  const header = ['Hash', 'Author', 'Date', 'Message'];
  const rows = commits.map(c => [c.hash, c.author, c.date, c.message]);
  const allRows = [header, ...rows];
  const widths = allRows[0].map((_, i) =>
    Math.max(...allRows.map(r => String(r[i]).length))
  );
  const sep = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const formatRow = row =>
    '| ' +
    row
      .map((cell, i) => String(cell).padEnd(widths[i]))
      .join(' | ') +
    ' |';
  const lines = [sep, formatRow(header), sep];
  rows.forEach(r => lines.push(formatRow(r)));
  lines.push(sep);
  return lines.join('\n');
}

function formatJSON(commits) {
  return JSON.stringify(commits, null, 2);
}

function formatCSV(commits) {
  const header = ['hash', 'author', 'date', 'message'];
  const lines = [header.join(',')];
  commits.forEach(c => {
    const row = [c.hash, c.author, c.date, c.message].map(v =>
      `"${String(v).replace(/"/g, '""')}"`
    );
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

function formatMarkdown(commits) {
  const header = ['Hash', 'Author', 'Date', 'Message'];
  const sep = header.map(() => '---');
  const lines = ['| ' + header.join(' | ') + ' |', '| ' + sep.join(' | ') + ' |'];
  commits.forEach(c => {
    lines.push(`| ${c.hash} | ${c.author} | ${c.date} | ${c.message} |`);
  });
  return lines.join('\n');
}

module.exports = { formatTable, formatJSON, formatCSV, formatMarkdown };
