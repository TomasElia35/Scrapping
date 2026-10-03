#!/usr/bin/env node
'use strict';

/**
 * Interfaz gráfica local para administrar links.txt y disparar el análisis.
 *   node ui.js  →  http://127.0.0.1:4599
 *
 * Sin dependencias: servidor HTTP nativo. Escucha solo en localhost.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { URL } = require('url');

const CWD = process.cwd();
const PORT = parseInt(process.env.PORT, 10) || 4599;
const HOST = '127.0.0.1';
const LINKS_FILE = path.join(CWD, 'links.txt');
const REPORTS_DIR = path.join(CWD, 'reportes');
const HISTORY_DIR = path.join(CWD, 'historial');
const UI_FILE = path.join(__dirname, 'ui', 'index.html');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/* ------------------------------------------------------------------ */
/* links.txt                                                           */
/* ------------------------------------------------------------------ */

const HEADER = [
  '# Sitios a analizar. Una URL por línea.',
  '# Después de la URL, detrás de un #, van el nombre y el rol:',
  '#   @cliente     → sitio actual del cliente: aporta estructura, contenido y funcionalidad',
  '#   @referencia  → sitio de la competencia que le gustó: aporta la estética a replicar',
  '# Sin rol explícito se asume @referencia.',
  '# Este archivo lo administra la interfaz (node ui.js), pero se puede editar a mano.',
  '',
];

function readLinks() {
  if (!fs.existsSync(LINKS_FILE)) return [];
  return fs
    .readFileSync(LINKS_FILE, 'utf8')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((line) => {
      const m = line.match(/^(\S+)\s*(?:#\s*(.*))?$/);
      if (!m) return null;
      const comment = (m[2] || '').trim();
      const roleMatch = comment.match(/@(cliente|client|propio|referencia|reference|competencia)\b/i);
      const role = roleMatch && /cliente|client|propio/i.test(roleMatch[1]) ? 'cliente' : 'referencia';
      return { url: m[1], label: comment.replace(/@\w+/g, '').trim(), role };
    })
    .filter(Boolean);
}

function normalizeUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return null;
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.href;
  } catch (e) {
    return null;
  }
}

function writeLinks(items) {
  const seen = new Set();
  const clean = [];
  const rejected = [];
  (items || []).forEach((it) => {
    const url = normalizeUrl(it && it.url);
    if (!url) {
      if (it && String(it.url || '').trim()) rejected.push(String(it.url).trim());
      return;
    }
    const key = url.replace(/\/$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    clean.push({
      url,
      label: String((it && it.label) || '').replace(/[\r\n#@]/g, ' ').trim().slice(0, 80),
      role: it && it.role === 'cliente' ? 'cliente' : 'referencia',
    });
  });

  const pad = clean.reduce((m, i) => Math.max(m, i.url.length), 0);
  const body = clean.map((i) => `${i.url.padEnd(pad)}  # ${i.label ? `${i.label} ` : ''}@${i.role}`);
  fs.writeFileSync(LINKS_FILE, HEADER.concat(body, ['']).join('\n'), 'utf8');
  return { saved: clean, rejected };
}

/* ------------------------------------------------------------------ */
/* corrida del analisis                                               */
/* ------------------------------------------------------------------ */

const job = { proc: null, log: [], startedAt: null, finishedAt: null, code: null, args: null, clients: new Set() };

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  job.clients.forEach((res) => {
    try {
      res.write(payload);
    } catch (e) {
      job.clients.delete(res);
    }
  });
}

function pushLog(line) {
  const text = String(line).replace(/\r/g, '');
  job.log.push(text);
  if (job.log.length > 4000) job.log.splice(0, job.log.length - 4000);
  broadcast('log', { line: text });
}

/** Construye los argumentos del CLI a partir de las opciones de la UI (nada de shell). */
function buildArgs(o) {
  const args = ['analyze.js', '--file', 'links.txt'];
  const int = (v, min, max, def) => {
    const n = parseInt(v, 10);
    return isNaN(n) || n < min || n > max ? def : n;
  };
  args.push('--pages', String(int(o.pages, 1, 25, 4)));
  args.push('--concurrency', String(int(o.concurrency, 1, 8, 1)));
  args.push('--retries', String(int(o.retries, 0, 5, 1)));
  if (o.limit) args.push('--limit', String(int(o.limit, 1, 500, 1)));
  if (o.lighthouse === 'mobile') args.push('--lighthouse');
  if (o.lighthouse === 'desktop') args.push('--lh-desktop');
  if (o.fullPages) args.push('--full-pages');
  if (o.cache) args.push('--cache');
  if (o.keepPopups) args.push('--keep-popups');
  if (o.noCrops) args.push('--no-crops');
  if (o.noInteractions) args.push('--no-interactions');
  if (o.noBpShots) args.push('--no-bp-shots');
  if (o.headed) args.push('--headed');
  if (o.brief) {
    // solo un archivo del directorio del proyecto, sin rutas relativas hacia afuera
    const safe = path.basename(String(o.brief));
    if (fs.existsSync(path.join(CWD, safe))) args.push('--brief', safe);
  }
  if (o.breakpoints) {
    const bps = String(o.breakpoints)
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => n > 200 && n < 4000);
    if (bps.length) args.push('--breakpoints', bps.join(','));
  }
  return args;
}

function startJob(options) {
  if (job.proc) return { ok: false, error: 'Ya hay un análisis corriendo.' };
  const items = readLinks();
  if (!items.length) return { ok: false, error: 'links.txt está vacío: agregá al menos un sitio.' };

  const args = buildArgs(options || {});
  job.log = [];
  job.startedAt = new Date().toISOString();
  job.finishedAt = null;
  job.code = null;
  job.args = args;

  pushLog(`$ node ${args.join(' ')}`);
  pushLog('');

  const proc = spawn(process.execPath, args, { cwd: CWD, windowsHide: true });
  job.proc = proc;
  broadcast('status', statusOf());

  let buf = '';
  const onData = (chunk) => {
    buf += chunk.toString('utf8');
    const lines = buf.split(/\n/);
    buf = lines.pop();
    lines.forEach(pushLog);
  };
  proc.stdout.on('data', onData);
  proc.stderr.on('data', onData);

  proc.on('close', (code) => {
    if (buf) pushLog(buf);
    job.proc = null;
    job.code = code;
    job.finishedAt = new Date().toISOString();
    pushLog('');
    pushLog(code === 0 ? '✓ Análisis terminado.' : `✗ El proceso terminó con código ${code}.`);
    broadcast('status', statusOf());
    broadcast('done', { code });
  });

  return { ok: true, args };
}

function statusOf() {
  return {
    running: !!job.proc,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    code: job.code,
    args: job.args,
    lines: job.log.length,
  };
}

/* ------------------------------------------------------------------ */
/* reportes generados                                                  */
/* ------------------------------------------------------------------ */

function listReports() {
  if (!fs.existsSync(REPORTS_DIR)) return { sites: [], summary: null };
  const entries = fs.readdirSync(REPORTS_DIR, { withFileTypes: true });
  const sites = entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = path.join(REPORTS_DIR, e.name);
      const files = fs.readdirSync(dir);
      const pick = (suffix) => {
        const f = files.find((x) => x.endsWith(suffix));
        return f ? { name: f, url: `/reportes/${encodeURIComponent(e.name)}/${encodeURIComponent(f)}`, kb: Math.round(fs.statSync(path.join(dir, f)).size / 1024) } : null;
      };
      const stat = fs.statSync(dir);
      return {
        name: e.name,
        updated: stat.mtime.toISOString(),
        report: { md: pick(`${e.name}.md`), html: pick(`${e.name}.html`), docx: pick(`${e.name}.docx`), json: pick(`${e.name}.json`) },
        prompt: { md: pick('-PROMPT.md'), html: pick('-PROMPT.html'), docx: pick('-PROMPT.docx') },
      };
    })
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));

  const summary = ['resumen.html', 'resumen.md', 'resumen.docx']
    .filter((f) => fs.existsSync(path.join(REPORTS_DIR, f)))
    .map((f) => ({ name: f, url: `/reportes/${f}` }));
  const synthesis = ['PROMPT-SINTESIS.html', 'PROMPT-SINTESIS.docx', 'PROMPT-SINTESIS.md']
    .filter((f) => fs.existsSync(path.join(REPORTS_DIR, f)))
    .map((f) => ({ name: f.replace('PROMPT-SINTESIS.', '').toUpperCase(), url: `/reportes/${f}` }));
  return { sites, summary, synthesis };
}

/** Historial de corridas, más reciente primero. */
function listHistory(limit) {
  const file = path.join(HISTORY_DIR, 'historial.json');
  if (!fs.existsSync(file)) return { runs: [], view: null };
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim());
  } catch (e) {
    return { runs: [], view: null, error: 'historial.json ilegible' };
  }
  const runs = (data.runs || [])
    .slice()
    .reverse()
    .slice(0, limit || 30)
    .map((run) => ({
      id: run.id,
      fecha: run.fecha,
      durationMs: run.durationMs,
      opciones: run.opciones,
      snapshot: run.snapshot ? `/${run.snapshot}` : null,
      sitios: (run.sitios || []).map((s) => ({
        name: s.name,
        label: s.label,
        role: s.role,
        ok: s.ok,
        error: s.error,
        metrics: s.metrics,
        report: s.ok && run.snapshot ? `/${run.snapshot}/${encodeURIComponent(s.name)}.html` : null,
        prompt: s.ok && run.snapshot ? `/${run.snapshot}/${encodeURIComponent(s.name)}-PROMPT.html` : null,
        docx: s.ok && run.snapshot ? `/${run.snapshot}/${encodeURIComponent(s.name)}.docx` : null,
      })),
      synthesis: run.snapshot && fs.existsSync(path.join(CWD, run.snapshot, 'PROMPT-SINTESIS.html')) ? `/${run.snapshot}/PROMPT-SINTESIS.html` : null,
    }));
  const view = ['historial.html', 'historial.md', 'historial.docx']
    .filter((f) => fs.existsSync(path.join(HISTORY_DIR, f)))
    .map((f) => ({ name: f.replace('historial.', '').toUpperCase(), url: `/historial/${f}` }));
  return { runs, total: (data.runs || []).length, view };
}

/* ------------------------------------------------------------------ */
/* servidor                                                            */
/* ------------------------------------------------------------------ */

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 1e6) reject(new Error('cuerpo demasiado grande'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

/** Sirve archivos de reportes/ y shots/ sin permitir salir de esas carpetas. */
function serveStatic(req, res, pathname) {
  const decoded = decodeURIComponent(pathname);
  const rel = decoded.replace(/^\/+/, '');
  const root = rel.startsWith('reportes/')
    ? REPORTS_DIR
    : rel.startsWith('shots/')
    ? path.join(CWD, 'shots')
    : rel.startsWith('historial/')
    ? HISTORY_DIR
    : null;
  if (!root) return false;
  const abs = path.resolve(CWD, rel);
  if (!abs.startsWith(root)) {
    res.writeHead(403).end('403');
    return true;
  }
  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) {
    res.writeHead(404).end('404');
    return true;
  }
  const ext = path.extname(abs).toLowerCase();
  const stat = fs.statSync(abs);
  const isImage = ext === '.png' || ext === '.jpg' || ext === '.svg';
  const etag = `"${stat.size}-${stat.mtimeMs}"`;

  // las capturas pesan varios MB: sin caché, cada pestaña las vuelve a bajar
  // y se agota el límite de conexiones por origen del navegador
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag }).end();
    return true;
  }

  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    ETag: etag,
    'Cache-Control': isImage ? 'private, max-age=3600' : 'no-cache',
  });
  const stream = fs.createReadStream(abs);
  stream.on('error', () => res.end());
  res.on('close', () => stream.destroy());
  stream.pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${HOST}:${PORT}`);
  const p = parsed.pathname;

  try {
    if (p === '/' || p === '/index.html') {
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      fs.createReadStream(UI_FILE).pipe(res);
      return;
    }

    if (p === '/api/links' && req.method === 'GET') {
      return sendJson(res, 200, { items: readLinks(), file: path.relative(CWD, LINKS_FILE) });
    }

    if (p === '/api/links' && (req.method === 'PUT' || req.method === 'POST')) {
      const body = await readBody(req);
      const result = writeLinks(body.items);
      return sendJson(res, 200, { items: result.saved, rejected: result.rejected, file: path.relative(CWD, LINKS_FILE) });
    }

    if (p === '/api/status' && req.method === 'GET') {
      return sendJson(res, 200, Object.assign(statusOf(), { log: job.log.slice(-500) }));
    }

    if (p === '/api/run' && req.method === 'POST') {
      const body = await readBody(req);
      const result = startJob(body.options || {});
      return sendJson(res, result.ok ? 200 : 409, result);
    }

    if (p === '/api/stop' && req.method === 'POST') {
      if (!job.proc) return sendJson(res, 409, { ok: false, error: 'No hay ningún análisis corriendo.' });
      job.proc.kill();
      pushLog('⚠ Detenido por el usuario.');
      return sendJson(res, 200, { ok: true });
    }

    if (p === '/api/reports' && req.method === 'GET') {
      return sendJson(res, 200, listReports());
    }

    if (p === '/api/history' && req.method === 'GET') {
      return sendJson(res, 200, listHistory(parseInt(parsed.searchParams.get('limit'), 10) || 30));
    }

    if (p === '/api/briefs' && req.method === 'GET') {
      const files = fs.readdirSync(CWD).filter((f) => /\.md$/i.test(f) && /brief/i.test(f));
      return sendJson(res, 200, { files });
    }

    if (p === '/api/stream') {
      // la respuesta queda abierta indefinidamente: hay que desarmar los timeouts del socket
      req.socket.setTimeout(0);
      req.socket.setNoDelay(true);
      req.socket.setKeepAlive(true);
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write('retry: 3000\n\n');
      res.write(`event: status\ndata: ${JSON.stringify(statusOf())}\n\n`);
      job.clients.add(res);
      const ping = setInterval(() => {
        try {
          res.write(`event: ping\ndata: ${Date.now()}\n\n`);
        } catch (e) {
          clearInterval(ping);
          job.clients.delete(res);
        }
      }, 15000);
      const cleanup = () => {
        clearInterval(ping);
        job.clients.delete(res);
      };
      req.on('close', cleanup);
      req.on('error', cleanup);
      res.on('error', cleanup);
      return;
    }

    if (serveStatic(req, res, p)) return;

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
  } catch (e) {
    sendJson(res, 500, { error: String(e.message || e) });
  }
});

// ninguna respuesta debe morir por timeout: las corridas duran minutos y el stream queda abierto
server.timeout = 0;
server.requestTimeout = 0;
server.headersTimeout = 0;
server.keepAliveTimeout = 72000;

server.on('clientError', (err, socket) => {
  if (!socket.destroyed) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  El puerto ${PORT} ya está en uso: probablemente haya otra instancia corriendo.`);
    console.error(`  Cerrala, o levantá esta en otro puerto:  set PORT=4600 && node ui.js\n`);
    process.exit(1);
  }
  console.error('Error del servidor:', err.message);
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  Analizador de sitios — interfaz local');
  console.log(`  → http://${HOST}:${PORT}`);
  console.log('');
  console.log(`  links.txt: ${fs.existsSync(LINKS_FILE) ? `${readLinks().length} sitio(s)` : 'se creará al guardar'}`);
  console.log('  Ctrl+C para salir.');
  console.log('');
});

process.on('SIGINT', () => {
  if (job.proc) job.proc.kill();
  server.close(() => process.exit(0));
});
