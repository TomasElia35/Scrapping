'use strict';

/**
 * Parser de markdown acotado al subconjunto que genera este proyecto:
 * headings, parrafos, listas, tablas, bloques de codigo y <details>.
 * Devuelve bloques que consumen los generadores de HTML y DOCX.
 */

function unescapePipes(s) {
  return s.replace(/\\\|/g, '|');
}

function splitRow(line) {
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cur = '';
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '\\' && body[i + 1] === '|') {
      cur += '|';
      i++;
    } else if (body[i] === '|') {
      cells.push(cur.trim());
      cur = '';
    } else {
      cur += body[i];
    }
  }
  cells.push(cur.trim());
  return cells;
}

const isSeparator = (line) => /^\|[\s:|-]+\|$/.test(line.trim()) && /-/.test(line);

/** @returns {Array<{type: string, ...}>} */
function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    /* bloque de codigo */
    if (/^```/.test(trimmed)) {
      const lang = trimmed.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) buf.push(lines[i++]);
      i++;
      blocks.push({ type: 'code', lang, text: buf.join('\n') });
      continue;
    }

    /* details colapsable */
    if (/^<details>/.test(trimmed)) {
      i++;
      let summary = '';
      const inner = [];
      let depth = 1;
      while (i < lines.length) {
        const l = lines[i];
        if (/^<summary>/.test(l.trim())) {
          summary = l.trim().replace(/^<summary>/, '').replace(/<\/summary>$/, '');
          i++;
          continue;
        }
        if (/^<details>/.test(l.trim())) depth++;
        if (/^<\/details>/.test(l.trim())) {
          depth--;
          if (!depth) {
            i++;
            break;
          }
        }
        inner.push(l);
        i++;
      }
      blocks.push({ type: 'details', summary, blocks: parseMarkdown(inner.join('\n')) });
      continue;
    }

    /* separador horizontal */
    if (/^---+$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    /* heading */
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length, text: h[2] });
      i++;
      continue;
    }

    /* tabla */
    if (trimmed.startsWith('|') && isSeparator(lines[i + 1] || '')) {
      const headers = splitRow(trimmed);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    /* lista */
    if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      const ordered = /^\d+\./.test(trimmed);
      const items = [];
      while (i < lines.length && (/^[-*]\s+/.test(lines[i].trim()) || /^\d+\.\s+/.test(lines[i].trim()))) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    /* parrafo */
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|<details>|---+$|\|)/.test(lines[i].trim()) && !/^[-*]\s+/.test(lines[i].trim())) {
      buf.push(lines[i].trim());
      i++;
    }
    if (buf.length) blocks.push({ type: 'paragraph', text: buf.join(' ') });
    else i++;
  }

  return blocks;
}

/** Parte texto inline en runs: {text, bold, italic, code, link} */
function parseInline(text) {
  const runs = [];
  const re = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(_([^_]+)_)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push({ text: unescapePipes(text.slice(last, m.index)) });
    if (m[1]) runs.push({ text: unescapePipes(m[2]), link: m[3] });
    else if (m[4]) runs.push({ text: unescapePipes(m[5]), bold: true });
    else if (m[6]) runs.push({ text: unescapePipes(m[7]), code: true });
    else if (m[8]) runs.push({ text: unescapePipes(m[9]), italic: true });
    last = re.lastIndex;
  }
  if (last < text.length) runs.push({ text: unescapePipes(text.slice(last)) });
  return runs.length ? runs : [{ text: unescapePipes(text) }];
}

module.exports = { parseMarkdown, parseInline };
