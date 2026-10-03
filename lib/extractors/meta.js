'use strict';

/** 1. Meta, SEO y datos estructurados. Corre en el browser. */
module.exports = function extractMeta() {
  const A = window.__A;
  const c = (sel) => {
    const el = document.querySelector(sel);
    return el ? (el.getAttribute('content') || '').trim() || null : null;
  };

  const iconEl = document.querySelector('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
  const canonical = document.querySelector('link[rel="canonical"]');
  const manifest = document.querySelector('link[rel="manifest"]');

  const og = {};
  A.$('meta[property^="og:"]').forEach((m) => {
    og[m.getAttribute('property')] = (m.getAttribute('content') || '').slice(0, 300);
  });
  const twitter = {};
  A.$('meta[name^="twitter:"]').forEach((m) => {
    twitter[m.getAttribute('name')] = (m.getAttribute('content') || '').slice(0, 300);
  });

  const jsonLd = [];
  A.$('script[type="application/ld+json"]').forEach((s) => {
    try {
      const parsed = JSON.parse(s.textContent);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      arr.forEach((o) => {
        if (o && o['@type']) jsonLd.push(Array.isArray(o['@type']) ? o['@type'].join('/') : String(o['@type']));
        if (o && o['@graph'] && Array.isArray(o['@graph'])) {
          o['@graph'].forEach((g) => g && g['@type'] && jsonLd.push(String(g['@type'])));
        }
      });
    } catch (e) {
      jsonLd.push('(json-ld inválido)');
    }
  });

  const preloads = A.$('link[rel="preload"], link[rel="preconnect"], link[rel="dns-prefetch"], link[rel="prefetch"]').map(
    (l) => `${l.getAttribute('rel')} → ${(l.getAttribute('as') || '')} ${A.hostOf(l.href) || l.getAttribute('href') || ''}`.trim()
  );

  return {
    title: (document.title || '').trim() || null,
    titleLength: (document.title || '').trim().length,
    description: c('meta[name="description"]') || c('meta[property="og:description"]'),
    descriptionLength: (c('meta[name="description"]') || '').length,
    viewport: c('meta[name="viewport"]'),
    lang: document.documentElement.getAttribute('lang') || null,
    dir: document.documentElement.getAttribute('dir') || null,
    charset: (document.characterSet || '').toLowerCase() || null,
    favicon: iconEl ? iconEl.href : null,
    ogImage: og['og:image'] || null,
    canonical: canonical ? canonical.href : null,
    robots: c('meta[name="robots"]'),
    themeColor: c('meta[name="theme-color"]'),
    generator: c('meta[name="generator"]'),
    manifest: manifest ? manifest.href : null,
    og,
    twitter,
    hreflang: A.$('link[rel="alternate"][hreflang]').map((l) => l.getAttribute('hreflang')).slice(0, 20),
    jsonLdTypes: Array.from(new Set(jsonLd)).slice(0, 20),
    resourceHints: Array.from(new Set(preloads)).slice(0, 20),
    metaTagCount: A.count('meta'),
    htmlBytes: document.documentElement.outerHTML.length,
  };
};
