'use strict';

/**
 * Historial de corridas: guarda un snapshot de los reportes de cada corrida,
 * registra las métricas por sitio y genera una vista con la evolución.
 */

const fs = require('fs');
const path = require('path');

const CWD = process.cwd();
const HISTORY_DIR = path.join(CWD, 'historial');
const HISTORY_FILE = path.join(HISTORY_DIR, 'historial.json');

const ensureDir = (d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
};

function runId(date) {
  const d = date || new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** Tolera BOM y CRLF: el archivo puede haber sido editado a mano en Windows. */
function parseJsonFile(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim();
  return raw ? JSON.parse(raw) : null;
}

function readHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return { runs: [] };
  try {
    const parsed = parseJsonFile(HISTORY_FILE);
    if (parsed && Array.isArray(parsed.runs)) return parsed;
    // un objeto suelto (o un array) también se acepta, para no perder lo que ya había
    if (Array.isArray(parsed)) return { runs: parsed };
    if (parsed && parsed.runs) return { runs: [].concat(parsed.runs) };
    return { runs: [] };
  } catch (e) {
    // no perdemos el archivo: lo dejamos aparte antes de empezar de cero
    try {
      fs.renameSync(HISTORY_FILE, `${HISTORY_FILE}.corrupto-${Date.now()}`);
      console.error(`historial.json ilegible (${e.message}); se guardó como .corrupto y se empieza un índice nuevo`);
    } catch (e2) {}
    return { runs: [] };
  }
}

/** Las métricas que vale la pena seguir en el tiempo. */
function metricsOf(r) {
  if (!r || !r.ok) return null;
  const lh = r.lighthouse && r.lighthouse.categories ? r.lighthouse.categories : null;
  return {
    pages: (r.pages || []).filter((p) => p.ok).length || 1,
    elements: r.elementsScanned,
    domNodes: r.layout.dom.totalNodes,
    sections: r.layout.blocksCount,
    buttons: r.components.counts.buttons,
    cards: r.components.counts.cards,
    images: r.components.counts.images,
    requests: r.network.totalRequests,
    kb: r.network.totalKb,
    thirdParties: r.network.thirdPartyHosts,
    loadMs: r.loadMs,
    lcpMs: r.perf.lcp ? r.perf.lcp.timeMs : null,
    cls: r.perf.cls === undefined ? null : r.perf.cls,
    contrastIssues: r.contrast.totalIssues,
    imagesWithoutAlt: r.a11y.imagesWithoutAlt,
    inputsWithoutLabel: r.a11y.inputsWithoutLabel,
    overflowBreakpoints: (r.responsiveSummary.horizontalOverflowAt || []).length,
    consoleErrors: (r.consoleErrors || []).length,
    fontFamilies: r.typography.distinct.families,
    fontSizes: r.typography.distinct.sizes,
    radii: r.spacing.distinct.radius,
    overlays: r.popups.detected.length,
    lhPerformance: lh ? lh.performance : null,
    lhAccessibility: lh ? lh.accessibility : null,
    lhSeo: lh ? lh.seo : null,
  };
}

/** Copia los reportes de la corrida a historial/<runId>/ para que no se pisen. */
function snapshot(id, results, reportsDir) {
  const dir = ensureDir(path.join(HISTORY_DIR, id));
  const copied = [];
  const copy = (from, to) => {
    try {
      fs.copyFileSync(from, path.join(dir, to));
      copied.push(to);
    } catch (e) {
      /* el archivo puede no existir si se usó --no-shots o falló el sitio */
    }
  };

  ['PROMPT-SINTESIS.md', 'PROMPT-SINTESIS.html', 'PROMPT-SINTESIS.docx', 'resumen.md', 'resumen.html', 'resumen.docx'].forEach((f) => {
    const src = path.join(reportsDir, f);
    if (fs.existsSync(src)) copy(src, f);
  });

  results.forEach((r) => {
    if (!r || !r.name) return;
    ['.md', '.html', '.docx', '.json', '-PROMPT.md', '-PROMPT.html', '-PROMPT.docx'].forEach((suffix) => {
      const src = path.join(reportsDir, r.name, `${r.name}${suffix}`);
      if (fs.existsSync(src)) copy(src, `${r.name}${suffix}`);
    });
  });

  return { dir: path.relative(CWD, dir).replace(/\\/g, '/'), files: copied };
}

/**
 * Registra la corrida y devuelve el historial completo.
 * @param {Array} results resultados del análisis
 * @param {object} opts opciones de la corrida
 * @param {{reportsDir: string, startedAt?: string, durationMs?: number}} meta
 */
function appendRun(results, opts, meta) {
  ensureDir(HISTORY_DIR);
  const history = readHistory();
  const now = new Date();
  const id = runId(now);
  const list = (results || []).filter(Boolean);

  const snap = snapshot(id, list, meta.reportsDir);

  const run = {
    id,
    fecha: now.toISOString(),
    startedAt: meta.startedAt || now.toISOString(),
    durationMs: meta.durationMs || null,
    fromCache: list.filter((r) => r.fromCache).length,
    opciones: {
      pages: opts.pages,
      breakpoints: opts.breakpoints,
      lighthouse: opts.lighthouse ? opts.lhPreset : null,
      concurrency: opts.concurrency,
      cache: !!opts.cache,
      fullPages: !!opts.fullPages,
      brief: opts.brief ? opts.brief.file : null,
      crops: !!opts.crops,
    },
    snapshot: snap.dir,
    sitios: list.map((r) => ({
      name: r.name,
      url: r.url,
      label: r.label || '',
      role: r.role === 'cliente' ? 'cliente' : 'referencia',
      ok: !!r.ok,
      error: r.ok ? null : r.error || null,
      metrics: metricsOf(r),
    })),
  };

  history.runs.push(run);
  // no dejamos crecer el índice para siempre: los snapshots quedan igual en disco
  if (history.runs.length > 200) history.runs = history.runs.slice(-200);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  return { history, run };
}

/* ------------------------------------------------------------------ */
/* Vista del historial                                                 */
/* ------------------------------------------------------------------ */

const METRIC_LABELS = [
  ['lhPerformance', 'Lighthouse perf', 'up'],
  ['lhAccessibility', 'Lighthouse a11y', 'up'],
  ['lcpMs', 'LCP (ms)', 'down'],
  ['cls', 'CLS', 'down'],
  ['requests', 'Requests', 'down'],
  ['kb', 'Peso (KB)', 'down'],
  ['domNodes', 'Nodos DOM', 'down'],
  ['contrastIssues', 'Fallos de contraste', 'down'],
  ['imagesWithoutAlt', 'Imágenes sin alt', 'down'],
  ['inputsWithoutLabel', 'Inputs sin label', 'down'],
  ['overflowBreakpoints', 'Breakpoints con overflow', 'down'],
  ['consoleErrors', 'Errores de consola', 'down'],
  ['sections', 'Secciones', 'neutral'],
  ['buttons', 'Botones', 'neutral'],
  ['cards', 'Cards', 'neutral'],
  ['fontSizes', 'Tamaños de fuente distintos', 'neutral'],
  ['radii', 'Radios distintos', 'neutral'],
];

const fmt = (v) => (v === null || v === undefined ? '—' : typeof v === 'number' ? String(v) : String(v));

/** Compara dos valores y devuelve el texto del delta con su signo. */
function delta(prev, curr, direction) {
  if (prev === null || prev === undefined || curr === null || curr === undefined) return '';
  const d = curr - prev;
  if (!d) return ' (=)';
  const sign = d > 0 ? '+' : '';
  const rounded = Math.abs(d) < 1 ? d.toFixed(3).replace(/0+$/, '') : Math.round(d);
  const better = direction === 'up' ? d > 0 : direction === 'down' ? d < 0 : null;
  const mark = better === null ? '' : better ? ' ✔' : ' ✖';
  return ` (${sign}${rounded}${mark})`;
}

function table(rows) {
  const out = [`| ${rows[0].join(' | ')} |`, `| ${rows[0].map(() => '---').join(' | ')} |`];
  rows.slice(1).forEach((r) => out.push(`| ${r.map((c) => (c === '' || c === null || c === undefined ? '—' : String(c).replace(/\|/g, '/'))).join(' | ')} |`));
  return out.join('\n') + '\n';
}

/** @returns {string} markdown del historial */
function buildHistoryMarkdown(history, opts) {
  const runs = (history.runs || []).slice().reverse(); // más reciente primero
  // la vista vive dentro de historial/, así que los links van relativos a esa carpeta
  const snapPath = (run) => (run.snapshot || '').replace(/^historial\//, '');
  const L = [];
  L.push('# Historial de análisis');
  L.push('');
  L.push(`_Actualizado el ${(opts && opts.generatedAt) || new Date().toISOString()} · ${runs.length} corrida(s) registrada(s)._`);
  L.push('');

  if (!runs.length) {
    L.push('Todavía no hay corridas registradas.');
    L.push('');
    return L.join('\n');
  }

  /* ---- índice de corridas ---- */
  L.push('## Corridas');
  L.push('');
  L.push(
    table([
      ['Corrida', 'Fecha', 'Duración', 'Sitios', 'Páginas', 'Opciones', 'Reportes de esa corrida'],
      ...runs.map((run) => {
        const okSites = run.sitios.filter((s) => s.ok);
        const pages = okSites.reduce((a, s) => a + ((s.metrics && s.metrics.pages) || 0), 0);
        const o = run.opciones || {};
        const opciones = [
          `${o.pages || '?'} pág/sitio`,
          o.lighthouse ? `Lighthouse ${o.lighthouse}` : null,
          o.concurrency > 1 ? `${o.concurrency} en paralelo` : null,
          o.cache ? 'con caché' : null,
          o.brief ? `brief: ${o.brief}` : null,
        ]
          .filter(Boolean)
          .join(' · ');
        const links = [];
        if (run.snapshot) {
          links.push(`[síntesis](${snapPath(run)}/PROMPT-SINTESIS.html)`);
          links.push(`[resumen](${snapPath(run)}/resumen.html)`);
        }
        return [
          run.id,
          new Date(run.fecha).toLocaleString('es-AR'),
          run.durationMs ? `${Math.round(run.durationMs / 1000)}s` : '—',
          `${okSites.length}/${run.sitios.length}`,
          pages,
          opciones,
          links.join(' · '),
        ];
      }),
    ])
  );

  /* ---- detalle por corrida ---- */
  runs.forEach((run, idx) => {
    const previous = runs[idx + 1] || null;
    L.push('---');
    L.push('');
    L.push(`## Corrida ${run.id}`);
    L.push('');
    L.push(`${new Date(run.fecha).toLocaleString('es-AR')}${run.durationMs ? ` · duró ${Math.round(run.durationMs / 1000)}s` : ''}${previous ? ` · comparada contra ${previous.id}` : ' · primera corrida registrada'}`);
    L.push('');
    L.push(
      table([
        ['Sitio', 'Rol', 'Estado', 'Páginas', 'Reportes'],
        ...run.sitios.map((s) => [
          `${s.name}${s.label ? ` (${s.label})` : ''}`,
          s.role,
          s.ok ? '✓' : `✗ ${s.error || 'error'}`,
          s.metrics ? s.metrics.pages : '—',
          s.ok && run.snapshot
            ? `[análisis](${snapPath(run)}/${s.name}.html) · [prompt](${snapPath(run)}/${s.name}-PROMPT.html) · [docx](${snapPath(run)}/${s.name}.docx)`
            : '—',
        ]),
      ])
    );

    run.sitios
      .filter((s) => s.ok && s.metrics)
      .forEach((s) => {
        const prevSite = previous ? previous.sitios.find((x) => x.name === s.name && x.ok) : null;
        L.push(`**${s.name}**${prevSite ? '' : ' — sin corrida anterior para comparar'}`);
        L.push('');
        L.push(
          table([
            ['Métrica', 'Valor', prevSite ? 'Cambio vs. corrida anterior' : 'Cambio'],
            ...METRIC_LABELS.filter(([key]) => s.metrics[key] !== null && s.metrics[key] !== undefined).map(([key, label, dir]) => [
              label,
              fmt(s.metrics[key]),
              prevSite && prevSite.metrics ? (delta(prevSite.metrics[key], s.metrics[key], dir).trim() || '=') : '—',
            ]),
          ])
        );
      });
  });

  /* ---- evolución por sitio ---- */
  const siteNames = Array.from(new Set(runs.flatMap((r) => r.sitios.filter((s) => s.ok).map((s) => s.name))));
  if (runs.length > 1 && siteNames.length) {
    L.push('---');
    L.push('');
    L.push('## Evolución por sitio');
    L.push('');
    siteNames.forEach((name) => {
      const points = runs
        .slice()
        .reverse() // cronológico
        .map((run) => ({ run, site: run.sitios.find((s) => s.name === name && s.ok) }))
        .filter((p) => p.site && p.site.metrics);
      if (points.length < 2) return;
      L.push(`### ${name}`);
      L.push('');
      L.push(
        table([
          ['Corrida', 'LH perf', 'LCP', 'CLS', 'Requests', 'KB', 'Nodos DOM', 'Contraste', 'Sin alt', 'Overflow'],
          ...points.map((p) => [
            p.run.id,
            fmt(p.site.metrics.lhPerformance),
            fmt(p.site.metrics.lcpMs),
            fmt(p.site.metrics.cls),
            fmt(p.site.metrics.requests),
            fmt(p.site.metrics.kb),
            fmt(p.site.metrics.domNodes),
            fmt(p.site.metrics.contrastIssues),
            fmt(p.site.metrics.imagesWithoutAlt),
            fmt(p.site.metrics.overflowBreakpoints),
          ]),
        ])
      );
    });
  }

  L.push('---');
  L.push('');
  L.push('_Los snapshots de cada corrida están en `historial/<corrida>/`. Las capturas de pantalla viven en `shots/` y corresponden siempre a la última corrida de cada sitio._');
  L.push('');
  return L.join('\n');
}

module.exports = { appendRun, readHistory, buildHistoryMarkdown, metricsOf, HISTORY_DIR, HISTORY_FILE };
