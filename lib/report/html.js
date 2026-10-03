'use strict';

/** Convierte el markdown del reporte en un HTML autocontenido y legible. */

const { parseMarkdown, parseInline } = require('./mdparse');

const escapeHtml = (s) =>
  String(s === undefined || s === null ? '' : s)
    .replace(/&(?!(amp|lt|gt|quot|#39);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const IMG_RE = /\.(png|jpe?g|webp|gif|svg)$/i;

function inlineHtml(text) {
  return parseInline(text)
    .map((r) => {
      const t = escapeHtml(r.text);
      if (r.link) {
        const href = escapeHtml(r.link);
        return `<a href="${href}">${t}</a>`;
      }
      if (r.bold) return `<strong>${t}</strong>`;
      if (r.code) return `<code>${t}</code>`;
      if (r.italic) return `<em>${t}</em>`;
      return t;
    })
    .join('');
}

/** Muestra de color: si la celda es un hex, agrega un cuadradito. */
function cellHtml(text) {
  const hex = String(text).match(/^#([0-9a-f]{6})\b/i);
  const inner = inlineHtml(text);
  if (hex) return `<span class="swatch" style="background:#${hex[1]}"></span>${inner}`;
  return inner;
}

function blocksToHtml(blocks, opts) {
  const out = [];
  blocks.forEach((b) => {
    switch (b.type) {
      case 'heading':
        out.push(`<h${b.level} id="${slug(b.text)}">${inlineHtml(b.text)}</h${b.level}>`);
        break;
      case 'paragraph': {
        // links a imagenes: los mostramos embebidos
        const imgs = [];
        parseInline(b.text).forEach((r) => {
          if (r.link && IMG_RE.test(r.link)) imgs.push({ href: r.link, label: r.text });
        });
        out.push(`<p>${inlineHtml(b.text)}</p>`);
        if (imgs.length && opts.embedImages) {
          out.push(
            `<div class="shots">${imgs
              .map((im) => `<figure><a href="${escapeHtml(im.href)}"><img loading="lazy" src="${escapeHtml(im.href)}" alt="${escapeHtml(im.label)}"></a><figcaption>${escapeHtml(im.label)}</figcaption></figure>`)
              .join('')}</div>`
          );
        }
        break;
      }
      case 'list':
        out.push(
          `<${b.ordered ? 'ol' : 'ul'}>${b.items.map((it) => `<li>${inlineHtml(it)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`
        );
        break;
      case 'table':
        out.push(
          `<div class="tw"><table><thead><tr>${b.headers.map((h) => `<th>${inlineHtml(h)}</th>`).join('')}</tr></thead><tbody>` +
            b.rows.map((r) => `<tr>${r.map((c) => `<td>${cellHtml(c)}</td>`).join('')}</tr>`).join('') +
            '</tbody></table></div>'
        );
        break;
      case 'code':
        out.push(`<pre><code>${escapeHtml(b.text)}</code></pre>`);
        break;
      case 'details':
        out.push(`<details><summary>${inlineHtml(b.summary)}</summary>${blocksToHtml(b.blocks, opts)}</details>`);
        break;
      case 'hr':
        out.push('<hr>');
        break;
      default:
        break;
    }
  });
  return out.join('\n');
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\wáéíóúñ\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

const CSS = `
:root{--bg:#ffffff;--fg:#1c1f24;--muted:#5b6572;--line:#e3e7ec;--accent:#0b62d6;--code:#f4f6f8;--head:#f8fafc}
@media (prefers-color-scheme:dark){:root{--bg:#14171c;--fg:#e6e9ee;--muted:#9aa4b2;--line:#2a2f37;--accent:#6aa9ff;--code:#1b1f26;--head:#1a1e25}}
*{box-sizing:border-box}
body{margin:0;padding:2rem 1.25rem 6rem;background:var(--bg);color:var(--fg);font:15px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:1200px;margin-inline:auto}
h1{font-size:1.9rem;margin:0 0 .3em;letter-spacing:-.02em}
h2{font-size:1.45rem;margin:2.4em 0 .6em;padding-bottom:.3em;border-bottom:2px solid var(--line)}
h3{font-size:1.15rem;margin:1.9em 0 .5em;color:var(--accent)}
h4{font-size:1rem;margin:1.4em 0 .4em}
p{margin:.55em 0}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
code{background:var(--code);padding:.1em .35em;border-radius:4px;font-size:.88em;font-family:ui-monospace,Consolas,monospace}
pre{background:var(--code);padding:.9rem 1rem;border-radius:8px;overflow-x:auto;font-size:.82rem;line-height:1.45}
pre code{background:none;padding:0}
.tw{overflow-x:auto;margin:.7em 0;border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:.85rem}
th,td{padding:.42rem .6rem;text-align:left;border-bottom:1px solid var(--line);vertical-align:top;white-space:nowrap}
td:last-child,th:last-child{white-space:normal}
thead th{background:var(--head);position:sticky;top:0;font-weight:600}
tbody tr:hover{background:var(--head)}
details{margin:.6em 0;border:1px solid var(--line);border-radius:8px;padding:.5rem .8rem;background:var(--head)}
summary{cursor:pointer;font-weight:600;font-size:.92rem}
details[open] summary{margin-bottom:.6em}
hr{border:0;border-top:1px solid var(--line);margin:2.5em 0}
ul,ol{margin:.5em 0;padding-left:1.4rem}
li{margin:.2em 0}
.swatch{display:inline-block;width:.8em;height:.8em;border-radius:3px;border:1px solid var(--line);margin-right:.4em;vertical-align:-1px}
.shots{display:flex;flex-wrap:wrap;gap:1rem;margin:1rem 0}
.shots figure{margin:0;flex:1 1 260px;max-width:340px}
.shots img{width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff}
.shots figcaption{font-size:.78rem;color:var(--muted);margin-top:.3rem}
.meta{color:var(--muted);font-size:.85rem}
`;

/**
 * @param {string} md markdown fuente
 * @param {{title: string, embedImages?: boolean}} opts
 */
module.exports = function buildHtml(md, opts) {
  const o = Object.assign({ embedImages: true }, opts);
  const blocks = parseMarkdown(md);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(o.title)}</title>
<style>${CSS}</style>
</head>
<body>
${blocksToHtml(blocks, o)}
</body>
</html>
`;
};
