#!/usr/bin/env node
'use strict';

/**
 * Convierte un markdown a DOCX y HTML con los mismos generadores del proyecto.
 *   node tools/build-docs.js [archivo.md ...]
 * Sin argumentos, procesa DOCUMENTACION.md.
 */

const fs = require('fs');
const path = require('path');
const buildDocx = require('../lib/report/docx');
const buildHtml = require('../lib/report/html');

const CWD = process.cwd();
const files = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const targets = files.length ? files : ['DOCUMENTACION.md'];
const isoDate = new Date().toISOString();

targets.forEach((f) => {
  const src = path.resolve(CWD, f);
  if (!fs.existsSync(src)) {
    console.error(`No existe: ${f}`);
    process.exitCode = 1;
    return;
  }
  const md = fs.readFileSync(src, 'utf8');
  const dir = path.dirname(src);
  const base = path.join(dir, path.basename(src, path.extname(src)));
  const title = (md.match(/^#\s+(.+)$/m) || [, path.basename(base)])[1].trim();

  const docx = `${base}.docx`;
  const html = `${base}.html`;
  fs.writeFileSync(docx, buildDocx(md, { title, isoDate, baseDir: dir, embedImages: true }));
  fs.writeFileSync(html, buildHtml(md, { title, embedImages: true }), 'utf8');

  const kb = (p) => Math.round(fs.statSync(p).size / 1024);
  console.log(`${path.relative(CWD, src)} → ${path.basename(docx)} (${kb(docx)} KB) · ${path.basename(html)} (${kb(html)} KB)`);
});
