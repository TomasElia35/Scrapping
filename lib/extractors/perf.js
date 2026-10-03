'use strict';

/** 11. Performance: navigation timing, paint, LCP/CLS y resource timing agregado. */
module.exports = function extractPerf() {
  const A = window.__A;
  const out = { navigation: null, paint: {}, lcp: null, cls: null, resources: {}, slowest: [], byHost: [], totals: {} };

  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      out.navigation = {
        type: nav.type,
        redirects: nav.redirectCount,
        ttfbMs: Math.round(nav.responseStart - nav.requestStart),
        dnsMs: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
        tcpMs: Math.round(nav.connectEnd - nav.connectStart),
        tlsMs: nav.secureConnectionStart ? Math.round(nav.connectEnd - nav.secureConnectionStart) : 0,
        responseMs: Math.round(nav.responseEnd - nav.responseStart),
        domInteractiveMs: Math.round(nav.domInteractive),
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadEventMs: Math.round(nav.loadEventEnd),
        transferSize: nav.transferSize || 0,
        encodedBodySize: nav.encodedBodySize || 0,
        decodedBodySize: nav.decodedBodySize || 0,
        protocol: nav.nextHopProtocol || null,
      };
    }
  } catch (e) {}

  try {
    performance.getEntriesByType('paint').forEach((p) => {
      out.paint[p.name] = Math.round(p.startTime);
    });
  } catch (e) {}

  try {
    const lcps = performance.getEntriesByType('largest-contentful-paint');
    if (lcps && lcps.length) {
      const last = lcps[lcps.length - 1];
      out.lcp = { timeMs: Math.round(last.startTime), size: last.size, element: last.element ? A.ident(last.element) : null, url: last.url ? last.url.slice(-70) : null };
    }
  } catch (e) {}

  try {
    if (window.__CLS !== undefined) out.cls = +window.__CLS.toFixed(4);
  } catch (e) {}

  try {
    const res = performance.getEntriesByType('resource');
    const byType = {};
    const byHost = {};
    let total = 0;
    res.forEach((r) => {
      const t = r.initiatorType || 'other';
      if (!byType[t]) byType[t] = { count: 0, bytes: 0, durationMs: 0 };
      byType[t].count++;
      byType[t].bytes += r.transferSize || 0;
      byType[t].durationMs += r.duration || 0;
      total += r.transferSize || 0;
      const h = A.hostOf(r.name);
      if (!byHost[h]) byHost[h] = { count: 0, bytes: 0 };
      byHost[h].count++;
      byHost[h].bytes += r.transferSize || 0;
    });
    Object.keys(byType).forEach((k) => (byType[k].durationMs = Math.round(byType[k].durationMs)));
    out.resources = byType;
    out.byHost = Object.keys(byHost)
      .map((h) => ({ host: h, count: byHost[h].count, kb: Math.round(byHost[h].bytes / 1024) }))
      .sort((a, b) => b.kb - a.kb || b.count - a.count)
      .slice(0, 15);
    out.slowest = res
      .slice()
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 12)
      .map((r) => ({ url: r.name.slice(-85), type: r.initiatorType, ms: Math.round(r.duration), kb: Math.round((r.transferSize || 0) / 1024), host: A.hostOf(r.name) }));
    out.totals = {
      requests: res.length,
      transferKb: Math.round(total / 1024),
      thirdPartyRequests: res.filter((r) => A.hostOf(r.name) !== location.hostname).length,
      thirdPartyHosts: new Set(res.map((r) => A.hostOf(r.name)).filter((h) => h && h !== location.hostname)).size,
    };
  } catch (e) {}

  return out;
};
