#!/usr/bin/env node
'use strict';

/**
 * CLI de analisis minucioso de sitios web, orientado a generar un prompt de construccion.
 *
 *   node analyze.js "<url1>" "<url2>" ...
 *   node analyze.js --file links.txt --pages 5 --brief brief.md --lighthouse
 *   node analyze.js --from-json           (regenera reportes sin navegar)
 *
 * En PowerShell las URLs con & DEBEN ir entre comillas dobles.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const installHelpers = require('./lib/browserHelpers');
const { dismissOverlays } = require('./lib/popups');
const { attachNetwork } = require('./lib/network');
const { discoverPages } = require('./lib/discovery');
const { captureInteractions } = require('./lib/interactions');
const { runLighthouse } = require('./lib/lighthouse');
const { siteMarkdown, indexMarkdown } = require('./lib/report/markdown');
const buildHtml = require('./lib/report/html');
const buildDocx = require('./lib/report/docx');
const buildPrompt = require('./lib/report/prompt');
const buildSynthesis = require('./lib/report/synthesis');
const { appendRun, readHistory, buildHistoryMarkdown, HISTORY_DIR } = require('./lib/history');

const extractMeta = require('./lib/extractors/meta');
const extractStack = require('./lib/extractors/stack');
const extractLayout = require('./lib/extractors/layout');
const extractStyles = require('./lib/extractors/styles');
const extractComponents = require('./lib/extractors/components');
const extractA11y = require('./lib/extractors/a11y');
const extractAnimations = require('./lib/extractors/animations');
const extractCssom = require('./lib/extractors/cssom');
const extractPerf = require('./lib/extractors/perf');
const extractCatalog = require('./lib/extractors/catalog');
const extractContent = require('./lib/extractors/content');
const probeViewport = require('./lib/extractors/probe');

const CWD = process.cwd();
const SHOTS_DIR = path.join(CWD, 'shots');
const REPORTS_DIR = path.join(CWD, 'reportes');
const JSON_OUT = path.join(REPORTS_DIR, 'datos-completos.json');
const TIMEOUT = 60000;
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };
const DEFAULT_BREAKPOINTS = [360, 390, 768, 1024, 1280, 1440, 1920];
const SECONDARY_BREAKPOINTS = [390, 768, 1440];

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const urls = [];
  const opts = {
    file: null,
    limit: null,
    headed: false,
    slowMo: 0,
    keepPopups: false,
    breakpoints: DEFAULT_BREAKPOINTS.slice(),
    shots: true,
    bpShots: true,
    crops: true,
    interactions: true,
    pages: 4,
    fullPages: false,
    noSitemap: false,
    brief: null,
    lighthouse: false,
    lhPreset: 'mobile',
    concurrency: 1,
    retries: 1,
    cache: false,
    fromJson: null,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const hasInline = a.startsWith('--') && a.includes('=');
    const flag = hasInline ? a.slice(0, a.indexOf('=')) : a;
    const inline = hasInline ? a.slice(a.indexOf('=') + 1) : undefined;
    const val = () => (inline !== undefined ? inline : argv[++i]);
    const int = (min, def) => {
      const n = parseInt(val(), 10);
      return isNaN(n) || n < min ? def : n;
    };

    switch (flag) {
      case '--file':
      case '-f':
        opts.file = val();
        break;
      case '--limit':
      case '-l':
        opts.limit = int(1, null);
        break;
      case '--pages':
      case '-p':
        opts.pages = int(1, 4);
        break;
      case '--full-pages':
        opts.fullPages = true;
        break;
      case '--no-sitemap':
        opts.noSitemap = true;
        break;
      case '--brief':
        opts.brief = val();
        break;
      case '--cliente':
      case '--client': {
        const u = val();
        opts.clienteUrls = (opts.clienteUrls || []).concat(u);
        urls.push(u);
        break;
      }
      case '--lighthouse':
        opts.lighthouse = true;
        break;
      case '--lh-desktop':
        opts.lighthouse = true;
        opts.lhPreset = 'desktop';
        break;
      case '--concurrency':
      case '-c':
        opts.concurrency = int(1, 1);
        break;
      case '--retries':
        opts.retries = int(0, 1);
        break;
      case '--cache':
        opts.cache = true;
        break;
      case '--headed':
      case '--headful':
        opts.headed = true;
        break;
      case '--slow':
        opts.slowMo = int(0, 0);
        break;
      case '--keep-popups':
        opts.keepPopups = true;
        break;
      case '--breakpoints':
        opts.breakpoints = String(val())
          .split(',')
          .map((n) => parseInt(n.trim(), 10))
          .filter((n) => n > 200 && n < 4000);
        break;
      case '--no-shots':
        opts.shots = false;
        opts.bpShots = false;
        opts.crops = false;
        opts.interactions = false;
        break;
      case '--no-bp-shots':
        opts.bpShots = false;
        break;
      case '--no-crops':
        opts.crops = false;
        break;
      case '--no-interactions':
        opts.interactions = false;
        break;
      case '--no-history':
        opts.noHistory = true;
        break;
      case '--history':
        opts.forceHistory = true;
        break;
      case '--from-json':
        opts.fromJson = inline !== undefined ? inline : JSON_OUT;
        break;
      default:
        if (a.startsWith('-')) console.error(`Flag desconocido: ${a}`);
        else urls.push(a);
    }
  }

  // las URLs sueltas de la línea de comandos son referencias salvo que se diga otra cosa
  const entries = urls.map((u) => ({ url: u, label: '', role: opts.clienteUrls && opts.clienteUrls.includes(u) ? 'cliente' : 'referencia' }));

  if (opts.file) {
    fs.readFileSync(path.resolve(opts.file), 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .forEach((line) => {
        // "https://sitio.com   # Nombre del cliente @cliente"
        const m = line.match(/^(\S+)\s*(?:#\s*(.*))?$/);
        if (!m) return;
        const comment = (m[2] || '').trim();
        const roleMatch = comment.match(/@(cliente|client|propio|referencia|reference|competencia)\b/i);
        const role = roleMatch && /cliente|client|propio/i.test(roleMatch[1]) ? 'cliente' : 'referencia';
        entries.push({ url: m[1], label: comment.replace(/@\w+/g, '').trim(), role });
      });
  }

  let list = entries.map((e) => Object.assign({}, e, { url: /^https?:\/\//i.test(e.url) ? e.url : `https://${e.url}` }));
  const seen = new Set();
  list = list.filter((e) => {
    const key = e.url.replace(/\/$/, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (Number.isInteger(opts.limit) && opts.limit > 0) list = list.slice(0, opts.limit);
  opts.entries = list;
  opts.urls = list.map((e) => e.url);
  return opts;
}

function usage() {
  console.error('Uso: node analyze.js "<url1>" "<url2>" ...');
  console.error('     node analyze.js --file links.txt [--limit N]');
  console.error('');
  console.error('  --pages N          páginas por sitio a analizar (default 4: home + las más representativas)');
  console.error('  --full-pages       medir todos los breakpoints en todas las páginas (no solo en el home)');
  console.error('  --no-sitemap       no leer sitemap.xml, descubrir solo por links del home');
  console.error('  --cliente <url>    marca esa URL como el sitio del cliente (el resto son referencias)');
  console.error('  --brief archivo.md briefing del cliente, se inyecta como sección 0 del prompt');
  console.error('  --lighthouse       correr Lighthouse mobile con throttling (--lh-desktop para desktop)');
  console.error('  --concurrency N    sitios en paralelo (default 1)');
  console.error('  --retries N        reintentos por página (default 1)');
  console.error('  --cache            saltear sitios que ya tengan reporte JSON generado');
  console.error('  --breakpoints ...   lista de anchos, ej: 360,768,1440');
  console.error('  --headed --slow N  ver el navegador trabajando');
  console.error('  --keep-popups      no cerrar popups');
  console.error('  --no-shots --no-bp-shots --no-crops --no-interactions');
  console.error('  --no-history       no registrar esta corrida en el historial');
  console.error('  --from-json        regenerar reportes sin navegar');
  console.error('');
  console.error('PowerShell: encerrá cada URL entre comillas dobles si contiene & o ?');
}

function safeName(url) {
  let host;
  try {
    host = new URL(url).hostname;
  } catch (e) {
    host = String(url);
  }
  return host.replace(/^www\./, '').replace(/[^a-z0-9.\-_]/gi, '_');
}

const ensureDir = (d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  return d;
};

/* observador de CLS + LCP, antes de cualquier script de la pagina */
function installWebVitals() {
  window.__CLS = 0;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__CLS += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver(() => {}).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {}
}

/* ------------------------------------------------------------------ */
/* Analisis de una pagina                                              */
/* ------------------------------------------------------------------ */

async function analyzePage(browser, pageInfo, opts, siteName, logRaw) {
  const t0 = Date.now();
  const steps = [];
  const log = (msg) => {
    steps.push(`${String(Date.now() - t0).padStart(6)}ms  ${msg}`);
    logRaw(msg);
  };
  const rel = (p) => path.relative(CWD, p).replace(/\\/g, '/');
  const url = pageInfo.url;
  const isHome = pageInfo.type === 'home';
  const pageDir = path.join(SHOTS_DIR, siteName, pageInfo.slug);
  const dirs = {
    desktop: path.join(pageDir, '01-desktop'),
    mobile: path.join(pageDir, '02-mobile'),
    breakpoints: path.join(pageDir, '03-breakpoints'),
    popups: path.join(pageDir, '04-popups'),
    components: path.join(pageDir, '05-componentes'),
    states: path.join(pageDir, '06-estados'),
  };
  const breakpoints = isHome || opts.fullPages ? opts.breakpoints : SECONDARY_BREAKPOINTS.filter((w) => opts.breakpoints.includes(w) || true);

  const context = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  const shots = { desktop: null, mobile: null, popup: null, popupMobile: null, breakpoints: {}, components: {} };

  try {
    await context.addInitScript(installHelpers);
    await context.addInitScript(installWebVitals);

    const page = await context.newPage();
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(TIMEOUT);
    const net = attachNetwork(page, url);

    const consoleErrors = [];
    page.on('console', (m) => {
      if (m.type() === 'error' && consoleErrors.length < 20) consoleErrors.push(m.text().slice(0, 200));
    });
    page.on('pageerror', (e) => consoleErrors.length < 20 && consoleErrors.push(`[pageerror] ${String(e.message).slice(0, 200)}`));

    /* ---- navegacion ---- */
    log('navegando (networkidle, 60s)');
    let response = null;
    let waitStrategy = 'networkidle';
    try {
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
    } catch (e) {
      waitStrategy = 'domcontentloaded (networkidle no llegó)';
      log('networkidle no llegó, reintento con domcontentloaded');
      response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    }
    await page.waitForTimeout(1200);
    const loadMs = Date.now() - t0;
    log(`cargado HTTP ${response ? response.status() : '?'} → ${page.url()}`);

    /* ---- popups ---- */
    let popups = { detected: [], dismissed: [], remaining: [], stillVisible: 0 };
    if (!opts.keepPopups) {
      if (opts.shots) {
        const p = path.join(ensureDir(dirs.popups), 'popup-inicial-1440.png');
        try {
          await page.screenshot({ path: p, fullPage: false });
          shots.popup = p;
        } catch (e) {}
      }
      log('buscando popups / banners de cookies');
      popups = await dismissOverlays(page, log);
      if (!popups.detected.length && shots.popup) {
        try {
          fs.unlinkSync(shots.popup);
        } catch (e) {}
        shots.popup = null;
      }
      await page.waitForTimeout(400);
    }

    /* ---- scroll completo ---- */
    log('scroll completo (lazy-load + animaciones de scroll)');
    await page
      .evaluate(async () => {
        const step = Math.max(300, window.innerHeight * 0.85);
        const total = document.documentElement.scrollHeight;
        for (let y = 0; y < total; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 140));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 250));
      })
      .catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600);

    /* ---- extractores ---- */
    const run = async (label, fn) => {
      log(`extrayendo: ${label}`);
      try {
        return await page.evaluate(fn);
      } catch (e) {
        log(`fallo en ${label}: ${e.message.slice(0, 120)}`);
        return { error: e.message };
      }
    };

    const meta = await run('meta y SEO', extractMeta);
    const stackInfo = await run('stack tecnológico', extractStack);
    const styles = await run('tipografía, paleta y espaciado', extractStyles);
    const layout = await run('estructura y layout', extractLayout);
    const components = await run('inventario de componentes', extractComponents);
    const a11y = await run('accesibilidad', extractA11y);
    const animations = await run('animaciones', extractAnimations);
    const cssom = await run('CSSOM y media queries', extractCssom);
    const catalog = await run('anatomía del catálogo', extractCatalog);
    const content = await run('copy, tono y buscador', extractContent);
    const perf = await run('performance timing', extractPerf);

    /* ---- recortes de componentes y zonas ---- */
    if (opts.shots && opts.crops) {
      const targets = []
        .concat((components.buttonVariants || []).map((v, i) => ({ id: v.shotId, file: `boton-${String(i + 1).padStart(2, '0')}.png`, label: `Botón variante ${i + 1}` })))
        .concat((components.cardVariants || []).map((v, i) => ({ id: v.shotId, file: `card-${String(i + 1).padStart(2, '0')}.png`, label: `Card variante ${i + 1}` })))
        .concat((components.inputVariants || []).map((v, i) => ({ id: v.shotId, file: `input-${String(i + 1).padStart(2, '0')}.png`, label: `Input variante ${i + 1}` })))
        .concat((components.zoneShots || []).map((z) => ({ id: z.shotId, file: `${z.shotId}.png`, label: z.label })))
        .concat((catalog.shotIds || []).map((z) => ({ id: z.shotId, file: `${z.shotId}.png`, label: z.label })))
        .concat(content.search && content.search.shotId ? [{ id: content.search.shotId, file: 'zone-buscador.png', label: 'Buscador' }] : [])
        .filter((t) => t.id);

      log(`recortando ${targets.length} componentes y zonas`);
      let done = 0;
      const vh = DESKTOP.height;
      for (const t of targets) {
        try {
          const loc = page.locator(`[data-shot="${t.id}"]`).first();
          if (!(await loc.isVisible({ timeout: 800 }).catch(() => false))) continue;
          await loc.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});
          const p = path.join(ensureDir(dirs.components), t.file);
          const box = await loc.boundingBox().catch(() => null);

          if (box && box.height > vh * 1.6) {
            // zonas larguísimas (sliders, secciones enteras): recortamos la primera pantalla y media
            const abs = await loc
              .evaluate((el) => {
                const r = el.getBoundingClientRect();
                return { x: Math.max(0, r.left + window.scrollX), y: Math.max(0, r.top + window.scrollY), width: r.width, height: r.height };
              })
              .catch(() => null);
            if (abs) {
              await page.screenshot({
                path: p,
                fullPage: true,
                clip: { x: abs.x, y: abs.y, width: Math.min(abs.width, DESKTOP.width), height: Math.min(abs.height, vh * 1.5) },
                timeout: 8000,
              });
            } else {
              await loc.screenshot({ path: p, timeout: 6000 });
            }
          } else {
            await loc.screenshot({ path: p, timeout: 6000 });
          }
          shots.components[t.id] = { path: p, label: t.label };
          done++;
        } catch (e) {
          /* elemento tapado, animado o fuera de flujo */
        }
      }
      log(`recortes guardados: ${done}/${targets.length}`);
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    }

    /* ---- estados interactivos: hover, foco, menú, filtros, carrito, buscador ---- */
    let interactions = null;
    if (opts.interactions) {
      log('capturando estados interactivos');
      interactions = await captureInteractions(page, { dir: ensureDir(dirs.states), log, viewport: DESKTOP }).catch((e) => {
        log(`estados interactivos: falló (${String(e.message).slice(0, 80)})`);
        return null;
      });
      if (interactions && interactions.shots) {
        Object.keys(interactions.shots).forEach((k) => {
          shots.components[k] = interactions.shots[k];
        });
      }
    }

    /* ---- screenshot desktop ---- */
    if (opts.shots) {
      log('screenshot desktop 1440 fullPage');
      const p = path.join(ensureDir(dirs.desktop), 'desktop-1440-fullpage.png');
      try {
        await page.screenshot({ path: p, fullPage: true });
        shots.desktop = p;
      } catch (e) {
        log(`screenshot desktop falló: ${e.message.slice(0, 80)}`);
      }
    }

    /* ---- responsive ---- */
    const responsive = [];
    for (const w of breakpoints) {
      const h = w < 500 ? 844 : w < 900 ? 1024 : 900;
      log(`probando breakpoint ${w}x${h}`);
      try {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(700);
        await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
        if (!opts.keepPopups) await dismissOverlays(page, () => {}).catch(() => {});
        responsive.push(await page.evaluate(probeViewport));
        if (opts.shots && opts.bpShots) {
          const p = path.join(ensureDir(dirs.breakpoints), `bp-${String(w).padStart(4, '0')}x${h}.png`);
          await page.screenshot({ path: p, fullPage: false });
          shots.breakpoints[w] = p;
        }
      } catch (e) {
        log(`breakpoint ${w} falló: ${e.message.slice(0, 80)}`);
        responsive.push({ width: w, error: e.message.slice(0, 120) });
      }
    }
    await page.setViewportSize(DESKTOP).catch(() => {});

    const network = net.summary();

    /* ---- contexto mobile real ---- */
    if (opts.shots) {
      log('contexto mobile 390x844 (touch) + screenshot fullPage');
      const mContext = await browser.newContext({
        viewport: MOBILE,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        ignoreHTTPSErrors: true,
        locale: 'es-AR',
        userAgent:
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      });
      try {
        await mContext.addInitScript(installHelpers);
        const mPage = await mContext.newPage();
        mPage.setDefaultNavigationTimeout(TIMEOUT);
        try {
          await mPage.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUT });
        } catch (e) {
          await mPage.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
        }
        await mPage.waitForTimeout(900);
        if (!opts.keepPopups) {
          const hasOverlay = await mPage
            .evaluate(() => document.querySelectorAll('dialog[open], [role="dialog"], [class*="modal" i], [class*="popup" i], [class*="cookie" i]').length)
            .catch(() => 0);
          if (hasOverlay) {
            const p = path.join(ensureDir(dirs.popups), 'popup-inicial-390.png');
            try {
              await mPage.screenshot({ path: p, fullPage: false });
              shots.popupMobile = p;
            } catch (e) {}
          }
          await dismissOverlays(mPage, () => {}).catch(() => {});
        }
        await mPage
          .evaluate(async () => {
            const total = document.documentElement.scrollHeight;
            for (let y = 0; y < total; y += window.innerHeight * 0.85) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
            window.scrollTo(0, 0);
          })
          .catch(() => {});
        const p = path.join(ensureDir(dirs.mobile), 'mobile-390x844-fullpage.png');
        await mPage.screenshot({ path: p, fullPage: true });
        shots.mobile = p;
        const mProbe = await mPage.evaluate(probeViewport).catch(() => null);
        if (mProbe) {
          mProbe.emulatedTouch = true;
          responsive.push(mProbe);
        }
      } catch (e) {
        log(`mobile falló: ${e.message.slice(0, 80)}`);
      } finally {
        await mContext.close().catch(() => {});
      }
    }

    const responsiveSummary = summarizeResponsive(responsive, cssom);

    return {
      ok: true,
      url,
      pageType: pageInfo.type,
      pageLabel: pageInfo.label,
      slug: pageInfo.slug,
      source: pageInfo.source,
      finalUrl: page.url(),
      status: response ? response.status() : null,
      waitStrategy,
      loadMs,
      totalMs: Date.now() - t0,
      meta,
      stack: stackInfo.stack,
      stackExtras: stackInfo.extras,
      stackAssets: {
        scriptHosts: stackInfo.scriptHosts,
        inlineScripts: stackInfo.inlineScripts,
        externalScripts: stackInfo.externalScripts,
        externalStylesheets: stackInfo.externalStylesheets,
        inlineStyleTags: stackInfo.inlineStyleTags,
      },
      layout: Object.assign({}, layout, { displayStats: styles.displayStats }),
      typography: styles.typography,
      palette: styles.palette,
      spacing: styles.spacing,
      contrast: styles.contrast,
      elementsScanned: styles.elementsScanned,
      elementsTotal: styles.elementsTotal,
      scanCapped: !!styles.scanCapped,
      components,
      catalog,
      content,
      interactions,
      a11y,
      animations,
      cssom,
      perf,
      network,
      responsive,
      responsiveSummary,
      popups,
      consoleErrors,
      steps,
      screenshots: {
        desktop: shots.desktop ? rel(shots.desktop) : null,
        mobile: shots.mobile ? rel(shots.mobile) : null,
        popup: shots.popup ? rel(shots.popup) : null,
        popupMobile: shots.popupMobile ? rel(shots.popupMobile) : null,
        breakpoints: Object.keys(shots.breakpoints).reduce((o, k) => {
          o[k] = rel(shots.breakpoints[k]);
          return o;
        }, {}),
        components: Object.keys(shots.components).reduce((o, k) => {
          o[k] = { path: rel(shots.components[k].path), label: shots.components[k].label };
          return o;
        }, {}),
      },
    };
  } finally {
    await context.close().catch(() => {});
  }
}

/* ------------------------------------------------------------------ */
/* Analisis de un sitio (varias paginas)                               */
/* ------------------------------------------------------------------ */

async function analyzeSite(browser, url, opts, logRaw) {
  const name = safeName(url);
  const t0 = Date.now();
  const siteSteps = [];
  const log = (msg) => {
    siteSteps.push(msg);
    logRaw(msg);
  };

  /* ---- descubrimiento ---- */
  let pagesToVisit = [{ url, type: 'home', label: 'Home', slug: '00-home', source: 'entrada' }];
  let discovery = { requested: opts.pages, found: 1 };
  if (opts.pages > 1) {
    const ctx = await browser.newContext({ viewport: DESKTOP, ignoreHTTPSErrors: true, locale: 'es-AR' });
    try {
      const p = await ctx.newPage();
      p.setDefaultNavigationTimeout(TIMEOUT);
      log('descubriendo páginas (sitemap + navegación)');
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
      await p.waitForTimeout(800);
      pagesToVisit = await discoverPages(ctx, p, url, opts, log);
      discovery = { requested: opts.pages, found: pagesToVisit.length, pages: pagesToVisit.map((x) => ({ url: x.url, type: x.type, label: x.label, source: x.source })) };
    } catch (e) {
      log(`descubrimiento falló (${e.message.slice(0, 80)}), sigo solo con el home`);
    } finally {
      await ctx.close().catch(() => {});
    }
  }

  /* ---- analisis por pagina, con reintentos ---- */
  const pages = [];
  for (let i = 0; i < pagesToVisit.length; i++) {
    const info = pagesToVisit[i];
    log(`— página ${i + 1}/${pagesToVisit.length}: ${info.label} ${info.url}`);
    let lastError = null;
    for (let attempt = 0; attempt <= opts.retries; attempt++) {
      try {
        const res = await analyzePage(browser, info, opts, name, logRaw);
        pages.push(res);
        lastError = null;
        break;
      } catch (e) {
        lastError = e;
        if (attempt < opts.retries) log(`falló (${String(e.message).slice(0, 80)}), reintento ${attempt + 1}/${opts.retries}`);
      }
    }
    if (lastError) {
      log(`página descartada: ${String(lastError.message).slice(0, 120)}`);
      pages.push({ ok: false, url: info.url, pageType: info.type, pageLabel: info.label, slug: info.slug, error: String(lastError.message).slice(0, 200) });
    }
  }

  const home = pages.find((p) => p.ok && p.pageType === 'home') || pages.find((p) => p.ok);
  if (!home) {
    return { ok: false, url, name, error: (pages[0] && pages[0].error) || 'ninguna página pudo analizarse', totalMs: Date.now() - t0, pages, steps: siteSteps };
  }

  /* ---- lighthouse sobre el home ---- */
  let lighthouse = null;
  if (opts.lighthouse) {
    log(`corriendo Lighthouse (${opts.lhPreset}, con throttling)`);
    lighthouse = await runLighthouse(home.finalUrl || url, { preset: opts.lhPreset, log });
    if (lighthouse && lighthouse.categories) {
      log(`Lighthouse: perf ${lighthouse.categories.performance} · a11y ${lighthouse.categories.accessibility} · bp ${lighthouse.categories['best-practices']} · seo ${lighthouse.categories.seo}`);
    }
  }
  /**
   * El catálogo casi nunca está en el home: tomamos los datos de la página
   * que más cards de producto tenga, y dejamos constancia de cuál fue.
   */
  const catalogSource = pages
    .filter((x) => x.ok && x.catalog && !x.catalog.error && x.catalog.cardsDetected > 0)
    .sort((a, b) => b.catalog.cardsDetected - a.catalog.cardsDetected)[0];
  const catalog =
    catalogSource && catalogSource !== home
      ? Object.assign({}, catalogSource.catalog, { fromPage: { url: catalogSource.url, type: catalogSource.pageType, label: catalogSource.pageLabel } })
      : Object.assign({}, home.catalog || {}, { fromPage: { url: home.url, type: 'home', label: 'Home' } });
  if (catalogSource && catalogSource !== home) {
    log(`catálogo tomado de "${catalogSource.pageLabel}" (${catalogSource.catalog.cardsDetected} cards); el home tiene ${(home.catalog && home.catalog.cardsDetected) || 0}`);
  }

  /**
   * Los estados interactivos también aparecen donde corresponde: el mega menú se ve
   * en cualquier página, los filtros solo en un listado. Tomamos el conjunto más rico.
   */
  const ixScore = (x) => {
    const ix = x && x.interactions;
    if (!ix) return 0;
    return (
      ((ix.megaMenu && ix.megaMenu.links) || 0) +
      ((ix.filters && ix.filters.checkboxes) || 0) +
      ((ix.searchSuggestions && ix.searchSuggestions.items) || 0) +
      (ix.cart ? 5 : 0) +
      (ix.hover || []).filter((h) => h.changed).length
    );
  };
  const ixSource = pages.filter((x) => x.ok && x.interactions).sort((a, b) => ixScore(b) - ixScore(a))[0];
  const interactions =
    ixSource && ixSource !== home && ixScore(ixSource) > ixScore(home)
      ? Object.assign({}, ixSource.interactions, { fromPage: { url: ixSource.url, type: ixSource.pageType, label: ixSource.pageLabel } })
      : home.interactions;

  /* el sitio hereda el analisis del home y agrega el resto de las paginas */
  return Object.assign({}, home, {
    catalog,
    interactions,
    name,
    url,
    siteTotalMs: Date.now() - t0,
    discovery,
    lighthouse,
    pages,
    siteSteps,
  });
}

/* ------------------------------------------------------------------ */
/* Responsive: diferencias entre breakpoints                           */
/* ------------------------------------------------------------------ */

function summarizeResponsive(probes, cssom) {
  const valid = (probes || []).filter((p) => p && !p.error && !p.emulatedTouch).sort((a, b) => a.width - b.width);
  const changes = [];
  for (let i = 1; i < valid.length; i++) {
    const a = valid[i - 1];
    const b = valid[i];
    const diff = [];
    if (a.burgerVisible !== b.burgerVisible) diff.push(b.burgerVisible ? 'aparece menú hamburguesa' : 'desaparece hamburguesa (menú completo)');
    if (a.cardsPerRow !== b.cardsPerRow) diff.push(`cards por fila ${a.cardsPerRow} → ${b.cardsPerRow}`);
    if (a.navLinksVisible !== b.navLinksVisible) diff.push(`links de nav visibles ${a.navLinksVisible} → ${b.navLinksVisible}`);
    if (a.h1FontSize !== b.h1FontSize) diff.push(`h1 ${a.h1FontSize} → ${b.h1FontSize}`);
    if (a.bodyFontSize !== b.bodyFontSize) diff.push(`body ${a.bodyFontSize} → ${b.bodyFontSize}`);
    if (a.headerHeight !== b.headerHeight) diff.push(`header ${a.headerHeight}px → ${b.headerHeight}px`);
    const colsA = JSON.stringify((a.mainGrids || []).map((g) => g.columns));
    const colsB = JSON.stringify((b.mainGrids || []).map((g) => g.columns));
    if (colsA !== colsB) diff.push(`columnas de grid ${colsA} → ${colsB}`);
    if (Math.abs((a.viewportsTall || 0) - (b.viewportsTall || 0)) >= 1) diff.push(`alto de página ${a.viewportsTall} → ${b.viewportsTall} viewports`);
    if (diff.length) changes.push({ from: a.width, to: b.width, changes: diff });
  }

  const overflow = valid.filter((p) => p.horizontalOverflow).map((p) => ({ width: p.width, scrollWidth: p.overflowWidth, culprits: p.overflowingElements }));
  const burgerFrom = valid.filter((p) => p.burgerVisible).map((p) => p.width);
  const burgerHeuristicFrom = valid.filter((p) => !p.burgerVisible && p.burgerVisibleIncludingHeuristic).map((p) => p.width);
  const burgerEl = (valid.find((p) => p.burgerElement) || {}).burgerElement || null;
  const smallTaps = valid.filter((p) => p.width <= 480).map((p) => ({ width: p.width, small: p.smallTapTargets, total: p.tapTargetsTotal }));

  return {
    breakpointsProbed: valid.map((p) => p.width),
    declaredBreakpoints: (cssom && cssom.inferredBreakpoints) || [],
    transitions: changes,
    horizontalOverflowAt: overflow,
    burgerVisibleAt: burgerFrom,
    burgerHeuristicAt: burgerHeuristicFrom,
    burgerElement: burgerEl,
    burgerThreshold: burgerFrom.length ? Math.max.apply(null, burgerFrom) : null,
    smallTapTargetsMobile: smallTaps,
    isResponsive: overflow.length === 0 && changes.length > 0,
    verdict: (() => {
      if (!valid.length) return 'sin datos';
      if (overflow.length) return `overflow horizontal en ${overflow.map((o) => o.width + 'px').join(', ')} — hay roturas de layout`;
      if (!changes.length) return 'el layout no cambia entre breakpoints: probablemente no sea responsive (o sea fluido sin media queries)';
      return `responsive: ${changes.length} transición(es) de layout detectadas, sin overflow horizontal`;
    })(),
  };
}

/* ------------------------------------------------------------------ */
/* Escritura de reportes                                               */
/* ------------------------------------------------------------------ */

async function writeReports(results, opts) {
  const generatedAt = new Date().toISOString();
  let brief = null;
  if (opts.brief) {
    try {
      brief = { file: path.relative(CWD, path.resolve(opts.brief)).replace(/\\/g, '/'), text: fs.readFileSync(path.resolve(opts.brief), 'utf8').trim() };
      console.log(`Briefing del cliente: ${brief.file} (${brief.text.length} caracteres)`);
    } catch (e) {
      console.error(`No pude leer el briefing (${opts.brief}): ${e.message}`);
    }
  }
  const reportOpts = Object.assign({}, opts, { generatedAt, brief });
  ensureDir(REPORTS_DIR);

  console.log('Generando reportes...');
  const written = [];
  const write = (file, data) => {
    fs.writeFileSync(file, data);
    written.push(path.relative(CWD, file).replace(/\\/g, '/'));
  };

  for (const r of results) {
    const dir = ensureDir(path.join(REPORTS_DIR, r.name));
    const base = path.join(dir, r.name);
    // los reportes viven 2 niveles bajo la raíz: las capturas se linkean con ../../
    const md = siteMarkdown(r, reportOpts, '../../');
    write(`${base}.md`, md);
    write(`${base}.html`, buildHtml(md, { title: `Análisis — ${r.name}`, embedImages: true }));
    write(`${base}.docx`, buildDocx(md, { title: `Análisis — ${r.name}`, isoDate: generatedAt, baseDir: dir, embedImages: true }));
    write(`${base}.json`, JSON.stringify(r, null, 2));

    if (r.ok) {
      const prompt = buildPrompt(r, reportOpts);
      const pbase = path.join(dir, `${r.name}-PROMPT`);
      write(`${pbase}.md`, prompt);
      write(`${pbase}.html`, buildHtml(prompt, { title: `Prompt de construcción — ${r.name}`, embedImages: true }));
      write(`${pbase}.docx`, buildDocx(prompt, { title: `Prompt de construcción — ${r.name}`, isoDate: generatedAt, baseDir: dir, embedImages: true }));
    }
    console.log(`   · reportes/${r.name}/ → md, html, docx, json${r.ok ? ' + PROMPT (md, html, docx)' : ''}`);
  }

  /* ---- prompt de síntesis: estética de las referencias + estructura del cliente ---- */
  const okResults = results.filter((r) => r && r.ok);
  if (okResults.length) {
    const synth = buildSynthesis(results, Object.assign({}, reportOpts, { prefix: '../' }));
    write(path.join(REPORTS_DIR, 'PROMPT-SINTESIS.md'), synth);
    write(path.join(REPORTS_DIR, 'PROMPT-SINTESIS.html'), buildHtml(synth, { title: 'Prompt de síntesis', embedImages: true }));
    write(path.join(REPORTS_DIR, 'PROMPT-SINTESIS.docx'), buildDocx(synth, { title: 'Prompt de síntesis', isoDate: generatedAt, baseDir: REPORTS_DIR, embedImages: true }));
    const refs = okResults.filter((r) => r.role !== 'cliente').length;
    const cli = okResults.length - refs;
    console.log(`   · reportes/PROMPT-SINTESIS.{md,html,docx} → ${refs} referencia(s) + ${cli} sitio(s) del cliente`);
  }

  const indexMd = indexMarkdown(results, reportOpts, (r, ext) => `${r.name}/${r.name}.${ext}`);
  write(path.join(REPORTS_DIR, 'resumen.md'), indexMd);
  write(path.join(REPORTS_DIR, 'resumen.html'), buildHtml(indexMd, { title: 'Resumen del análisis', embedImages: false }));
  write(path.join(REPORTS_DIR, 'resumen.docx'), buildDocx(indexMd, { title: 'Resumen del análisis', isoDate: generatedAt, embedImages: false }));
  write(JSON_OUT, JSON.stringify(results, null, 2));

  /* ---- historial: snapshot de esta corrida + vista con la evolución ---- */
  try {
    let history;
    let run = null;
    if (opts.noHistory) {
      // no registramos una corrida nueva, pero sí refrescamos la vista si ya hay historial
      history = readHistory();
    } else {
      const appended = appendRun(results, reportOpts, {
        reportsDir: REPORTS_DIR,
        startedAt: opts.startedAt || generatedAt,
        durationMs: opts.startedAtMs ? Date.now() - opts.startedAtMs : null,
      });
      history = appended.history;
      run = appended.run;
    }

    if ((history.runs || []).length) {
      ensureDir(HISTORY_DIR);
      const historyMd = buildHistoryMarkdown(history, { generatedAt });
      fs.writeFileSync(path.join(HISTORY_DIR, 'historial.md'), historyMd, 'utf8');
      fs.writeFileSync(path.join(HISTORY_DIR, 'historial.html'), buildHtml(historyMd, { title: 'Historial de análisis', embedImages: false }), 'utf8');
      fs.writeFileSync(path.join(HISTORY_DIR, 'historial.docx'), buildDocx(historyMd, { title: 'Historial de análisis', isoDate: generatedAt, embedImages: false }));
      console.log(
        run
          ? `   · historial/${run.id}/ → snapshot de ${run.sitios.length} sitio(s) · historial/historial.html (${history.runs.length} corridas)`
          : `   · historial/historial.html actualizado (${history.runs.length} corridas, sin registrar una nueva)`
      );
    }
  } catch (e) {
    console.error(`No pude actualizar el historial: ${e.message}`);
  }

  const okCount = results.filter((r) => r.ok).length;
  const pageCount = results.reduce((a, r) => a + ((r.pages || []).filter((p) => p.ok).length || (r.ok ? 1 : 0)), 0);
  console.log(`\nListo — ${okCount}/${results.length} sitios OK · ${pageCount} páginas analizadas`);
  console.log(`  reportes/   ${written.length} archivos (síntesis + resumen + por sitio: análisis y PROMPT)`);
  console.log('  shots/      <sitio>/<pagina>/{01-desktop, 02-mobile, 03-breakpoints, 04-popups, 05-componentes}');
  if (!opts.noHistory) console.log('  historial/  historial.html con todas las corridas y su evolución\n');
  else console.log('');
}

/* ------------------------------------------------------------------ */
/* Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  opts.startedAtMs = Date.now();
  opts.startedAt = new Date().toISOString();

  if (opts.fromJson) {
    const src = path.resolve(opts.fromJson);
    // regenerar no es una medición nueva: no ensucia el historial salvo que se pida con --history
    if (!opts.forceHistory) opts.noHistory = true;
    console.log(`\nRegenerando reportes desde ${path.relative(CWD, src)} (sin navegar)\n`);
    await writeReports(JSON.parse(fs.readFileSync(src, 'utf8')), opts);
    return;
  }

  if (!opts.urls.length) {
    usage();
    process.exit(1);
  }

  ensureDir(SHOTS_DIR);

  console.log(`\nAnalizando ${opts.urls.length} sitio(s) · ${opts.pages} página(s) por sitio${opts.headed ? ' · navegador visible' : ''}`);
  console.log(`Breakpoints: ${opts.breakpoints.join(', ')}${opts.lighthouse ? ` · Lighthouse ${opts.lhPreset}` : ''}${opts.concurrency > 1 ? ` · ${opts.concurrency} sitios en paralelo` : ''}\n`);

  const browser = await chromium.launch({ headless: !opts.headed, slowMo: opts.slowMo || 0 });
  const results = new Array(opts.urls.length);
  const showPrefix = opts.concurrency > 1;
  let next = 0;

  const worker = async () => {
    while (true) {
      const i = next++;
      if (i >= opts.entries.length) return;
      const entry = opts.entries[i];
      const url = entry.url;
      const name = safeName(url);
      const tag = `[${i + 1}/${opts.entries.length}] ${entry.role === 'cliente' ? '[cliente]' : '[referencia]'}`;
      const logRaw = (msg) => console.log(showPrefix ? `${tag} ${name} · ${msg}` : `      · ${msg}`);

      /* caché: si ya hay un JSON del sitio, lo reusamos */
      const cached = path.join(REPORTS_DIR, name, `${name}.json`);
      if (opts.cache && fs.existsSync(cached)) {
        try {
          results[i] = Object.assign(JSON.parse(fs.readFileSync(cached, 'utf8')), { role: entry.role, label: entry.label, fromCache: true });
          console.log(`${tag} ${url}\n   ⤿ desde caché (${path.relative(CWD, cached)})\n`);
          continue;
        } catch (e) {
          /* caché corrupta: seguimos y reanalizamos */
        }
      }

      if (!showPrefix) console.log(`${tag} ${url}`);
      else console.log(`${tag} ${url} — arrancando`);

      try {
        const res = await analyzeSite(browser, url, opts, logRaw);
        res.role = entry.role;
        res.label = entry.label;
        results[i] = res;
        if (res.ok) {
          const okPages = (res.pages || []).filter((p) => p.ok).length;
          console.log(
            `${showPrefix ? `${tag} ${name}` : '  '} ✓ ${(res.siteTotalMs / 1000).toFixed(1)}s — ${okPages} página(s) — ` +
              `${res.elementsScanned} elementos — ${res.components.counts.buttons} botones / ${res.components.counts.cards} cards — ` +
              `${res.popups.detected.length} overlay(s)${res.lighthouse && res.lighthouse.categories ? ` — LH perf ${res.lighthouse.categories.performance}` : ''}\n`
          );
        } else {
          console.log(`${showPrefix ? `${tag} ${name}` : '  '} ✗ ${res.error}\n`);
        }
      } catch (e) {
        results[i] = { ok: false, url, name, role: entry.role, label: entry.label, error: String(e.message || e).slice(0, 200) };
        console.log(`${showPrefix ? `${tag} ${name}` : '  '} ✗ ${results[i].error}\n`);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(opts.concurrency, opts.urls.length) }, worker));
  await browser.close().catch(() => {});
  await writeReports(results.filter(Boolean), opts);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
