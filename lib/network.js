'use strict';

/** Intercepta requests/responses del contexto y agrega estadisticas de red. */
function attachNetwork(page, pageUrl) {
  const state = {
    byType: {},
    byStatus: {},
    byHost: {},
    bytes: 0,
    requests: 0,
    failed: [],
    redirects: 0,
    cached: 0,
    started: Date.now(),
  };

  let mainHost = '';
  try {
    mainHost = new URL(pageUrl).hostname;
  } catch (e) {}

  page.on('request', () => {
    state.requests++;
  });

  page.on('requestfailed', (req) => {
    if (state.failed.length < 25) {
      state.failed.push({
        url: req.url().slice(-90),
        type: req.resourceType(),
        error: (req.failure() && req.failure().errorText) || 'error',
      });
    }
  });

  page.on('response', async (res) => {
    let type = 'other';
    let host = '';
    try {
      type = res.request().resourceType();
      host = new URL(res.url()).hostname;
    } catch (e) {}

    if (!state.byType[type]) state.byType[type] = { count: 0, bytes: 0 };
    state.byType[type].count++;

    const status = res.status();
    const bucket = `${Math.floor(status / 100)}xx`;
    state.byStatus[bucket] = (state.byStatus[bucket] || 0) + 1;
    if (status >= 300 && status < 400) state.redirects++;
    if (status === 304) state.cached++;

    const len = parseInt(res.headers()['content-length'] || '0', 10) || 0;
    state.byType[type].bytes += len;
    state.bytes += len;

    if (host) {
      if (!state.byHost[host]) state.byHost[host] = { count: 0, bytes: 0, thirdParty: host !== mainHost };
      state.byHost[host].count++;
      state.byHost[host].bytes += len;
    }
  });

  return {
    state,
    summary() {
      const types = ['document', 'stylesheet', 'script', 'image', 'font', 'fetch', 'xhr', 'media', 'other'];
      const byType = {};
      types.forEach((t) => {
        byType[t] = state.byType[t] ? { count: state.byType[t].count, kb: Math.round(state.byType[t].bytes / 1024) } : { count: 0, kb: 0 };
      });
      Object.keys(state.byType).forEach((t) => {
        if (!byType[t]) byType[t] = { count: state.byType[t].count, kb: Math.round(state.byType[t].bytes / 1024) };
      });
      const hosts = Object.keys(state.byHost)
        .map((h) => ({ host: h, count: state.byHost[h].count, kb: Math.round(state.byHost[h].bytes / 1024), thirdParty: state.byHost[h].thirdParty }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
      return {
        totalRequests: state.requests,
        totalResponses: Object.values(state.byType).reduce((a, b) => a + b.count, 0),
        totalKb: Math.round(state.bytes / 1024),
        byType,
        byStatus: state.byStatus,
        redirects: state.redirects,
        notModified: state.cached,
        hosts,
        thirdPartyHosts: hosts.filter((h) => h.thirdParty).length,
        failed: state.failed,
      };
    },
  };
}

module.exports = { attachNetwork };
