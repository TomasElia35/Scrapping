'use strict';

/**
 * Corrida de Lighthouse (mobile, con throttling) contra un Chromium de Playwright.
 * Lighthouse 12 es ESM: se carga con import() dinamico desde CommonJS.
 * Es opcional: si no esta instalado, se informa y se sigue.
 */

const net = require('net');
const { chromium } = require('playwright');

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

const PRESETS = {
  mobile: {
    formFactor: 'mobile',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2.625, disabled: false },
    throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4, requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675 },
    emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  },
  desktop: {
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
    emulatedUserAgent: false,
  },
};

const AUDIT_KEYS = [
  'largest-contentful-paint',
  'first-contentful-paint',
  'cumulative-layout-shift',
  'total-blocking-time',
  'speed-index',
  'interactive',
  'server-response-time',
  'total-byte-weight',
  'dom-size',
  'unused-javascript',
  'unused-css-rules',
  'render-blocking-resources',
  'modern-image-formats',
  'uses-responsive-images',
  'uses-text-compression',
  'unminified-javascript',
  'third-party-summary',
  'font-display',
  'legacy-javascript',
  'mainthread-work-breakdown',
  'bootup-time',
];

/**
 * @param {string} url
 * @param {{preset?: 'mobile'|'desktop', log?: Function}} opts
 * @returns {Promise<object|null>} resumen, o null si Lighthouse no esta disponible
 */
async function runLighthouse(url, opts) {
  const o = opts || {};
  const log = o.log || (() => {});
  const presetName = o.preset || 'mobile';

  let lighthouse;
  try {
    lighthouse = (await import('lighthouse')).default;
  } catch (e) {
    log(`Lighthouse no disponible (${e.code === 'ERR_MODULE_NOT_FOUND' ? 'no instalado: npm i lighthouse' : e.message.slice(0, 80)})`);
    return null;
  }

  const port = await freePort();
  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${port}`, '--no-first-run', '--disable-features=Translate'],
  });

  try {
    const preset = PRESETS[presetName] || PRESETS.mobile;
    const runnerResult = await lighthouse(
      url,
      {
        port,
        output: 'json',
        logLevel: 'silent',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        maxWaitForLoad: 60000,
      },
      { extends: 'lighthouse:default', settings: preset }
    );

    if (!runnerResult || !runnerResult.lhr) return null;
    const lhr = runnerResult.lhr;

    const categories = {};
    Object.keys(lhr.categories || {}).forEach((k) => {
      const score = lhr.categories[k].score;
      categories[k] = score === null ? null : Math.round(score * 100);
    });

    const metrics = {};
    const audits = {};
    const opportunities = [];
    AUDIT_KEYS.forEach((key) => {
      const a = lhr.audits && lhr.audits[key];
      if (!a) return;
      audits[key] = {
        title: a.title,
        score: a.score,
        display: a.displayValue || null,
        numericValue: a.numericValue === undefined ? null : Math.round(a.numericValue * 100) / 100,
      };
      if (a.numericValue !== undefined) metrics[key] = Math.round(a.numericValue);
      const savings = a.details && a.details.overallSavingsMs;
      const bytes = a.details && a.details.overallSavingsBytes;
      if ((savings && savings > 100) || (bytes && bytes > 20480)) {
        opportunities.push({
          audit: key,
          title: a.title,
          savingsMs: savings ? Math.round(savings) : null,
          savingsKb: bytes ? Math.round(bytes / 1024) : null,
        });
      }
    });

    const failedA11y = Object.keys(lhr.audits || {})
      .filter((k) => {
        const a = lhr.audits[k];
        return a && a.score === 0 && a.scoreDisplayMode === 'binary' && (lhr.categories.accessibility.auditRefs || []).some((ref) => ref.id === k);
      })
      .map((k) => ({ audit: k, title: lhr.audits[k].title, items: ((lhr.audits[k].details || {}).items || []).length }))
      .slice(0, 20);

    return {
      preset: presetName,
      lighthouseVersion: lhr.lighthouseVersion,
      fetchTime: lhr.fetchTime,
      finalUrl: lhr.finalDisplayedUrl || lhr.finalUrl,
      categories,
      metrics,
      audits,
      opportunities: opportunities.sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0)).slice(0, 12),
      failedAccessibilityAudits: failedA11y,
      runWarnings: (lhr.runWarnings || []).slice(0, 5),
    };
  } catch (e) {
    log(`Lighthouse falló: ${String(e.message || e).slice(0, 120)}`);
    return { error: String(e.message || e).slice(0, 200), preset: presetName };
  } finally {
    await browser.close().catch(() => {});
  }
}

module.exports = { runLighthouse };
