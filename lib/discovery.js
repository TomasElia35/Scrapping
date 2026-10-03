'use strict';

/**
 * Descubrimiento de paginas representativas de un sitio:
 * robots.txt → sitemap(s) + links del home, clasificados por tipo.
 */

const TYPE_RULES = [
  { type: 'checkout', re: /\/(checkout|caja|finalizar)/i, label: 'Checkout' },
  { type: 'cart', re: /\/(cart|carrito|carro|basket)/i, label: 'Carrito' },
  { type: 'login', re: /\/(login|ingresar|mi-?cuenta|account|register|registro)/i, label: 'Cuenta / login' },
  { type: 'pdp', re: /\/(producto|product|p\/|item|sku|\/p$)/i, label: 'Ficha de producto' },
  { type: 'plp', re: /\/(categoria|categor|productos|catalogo|shop|tienda|collections?|departamento|linea|c\/)/i, label: 'Listado / categoría' },
  { type: 'search', re: /\/(busca|search|buscar|s\?)/i, label: 'Búsqueda' },
  { type: 'contact', re: /\/(contacto|contact|sucursales|locales|donde-estamos)/i, label: 'Contacto / sucursales' },
  { type: 'about', re: /\/(nosotros|about|empresa|quienes-somos|institucional)/i, label: 'Institucional' },
  { type: 'blog', re: /\/(blog|noticias|novedades|news|nota)/i, label: 'Blog / noticias' },
  { type: 'help', re: /\/(ayuda|help|faq|preguntas|envios|cambios|garantia|terminos|privacidad)/i, label: 'Ayuda / legales' },
];

function classify(url) {
  let pathname = '/';
  try {
    pathname = new URL(url).pathname + (new URL(url).search || '');
  } catch (e) {}
  if (pathname === '/' || pathname === '') return { type: 'home', label: 'Home' };
  for (const rule of TYPE_RULES) if (rule.re.test(pathname)) return { type: rule.type, label: rule.label };
  const depth = pathname.split('/').filter(Boolean).length;
  return depth >= 2 ? { type: 'inner', label: 'Página interna' } : { type: 'page', label: 'Página' };
}

/** Prioridad de análisis: qué tipos aportan más a la especificación. */
const PRIORITY = ['home', 'plp', 'pdp', 'contact', 'about', 'blog', 'search', 'help', 'cart', 'inner', 'page', 'login', 'checkout'];

const slugify = (url) => {
  let p = '/';
  try {
    p = new URL(url).pathname;
  } catch (e) {}
  const s = p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9\-_/]/gi, '-').replace(/\//g, '-').slice(0, 40);
  return s || 'home';
};

/** Lee sitemaps (con un nivel de sitemap-index) usando el contexto del browser. */
async function fromSitemap(context, origin, log, cap) {
  const urls = new Set();
  const tryFetch = async (u) => {
    try {
      const res = await context.request.get(u, { timeout: 15000, failOnStatusCode: false });
      if (!res.ok()) return null;
      return await res.text();
    } catch (e) {
      return null;
    }
  };

  const candidates = [];
  const robots = await tryFetch(`${origin}/robots.txt`);
  if (robots) {
    (robots.match(/^\s*sitemap:\s*(\S+)/gim) || []).forEach((line) => candidates.push(line.replace(/^\s*sitemap:\s*/i, '').trim()));
  }
  if (!candidates.length) candidates.push(`${origin}/sitemap.xml`);

  for (const sm of candidates.slice(0, 3)) {
    const xml = await tryFetch(sm);
    if (!xml) continue;
    const locs = (xml.match(/<loc>\s*([^<\s]+)\s*<\/loc>/gi) || []).map((l) => l.replace(/<\/?loc>/gi, '').trim());
    const isIndex = /<sitemapindex/i.test(xml);
    if (isIndex) {
      for (const child of locs.slice(0, 3)) {
        const childXml = await tryFetch(child);
        if (!childXml) continue;
        (childXml.match(/<loc>\s*([^<\s]+)\s*<\/loc>/gi) || [])
          .map((l) => l.replace(/<\/?loc>/gi, '').trim())
          .slice(0, cap || 400)
          .forEach((u) => urls.add(u));
      }
    } else {
      locs.slice(0, cap || 400).forEach((u) => urls.add(u));
    }
    if (urls.size) log(`sitemap ${sm}: ${urls.size} URLs`);
    if (urls.size >= (cap || 400)) break;
  }
  return Array.from(urls);
}

/** Links internos visibles del home (nav y footer primero). */
async function fromPage(page) {
  return page
    .evaluate(() => {
      const host = location.hostname;
      const out = [];
      const push = (a, zone) => {
        const href = a.href;
        if (!href || !/^https?:/.test(href)) return;
        try {
          const u = new URL(href);
          if (u.hostname !== host) return;
          if (/\.(pdf|jpg|jpeg|png|webp|svg|zip|docx?|xlsx?)$/i.test(u.pathname)) return;
          out.push({ url: u.origin + u.pathname + (u.search || ''), text: (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 50), zone });
        } catch (e) {}
      };
      document.querySelectorAll('header a[href], nav a[href]').forEach((a) => push(a, 'nav'));
      document.querySelectorAll('footer a[href]').forEach((a) => push(a, 'footer'));
      document.querySelectorAll('main a[href], body a[href]').forEach((a) => push(a, 'body'));
      return out;
    })
    .catch(() => []);
}

/**
 * Devuelve la lista de páginas a analizar, home primero, diversificando tipos.
 * @returns {Array<{url, type, label, slug, source, text}>}
 */
async function discoverPages(context, page, homeUrl, opts, log) {
  const max = Math.max(1, opts.pages || 4);
  const origin = new URL(homeUrl).origin;
  const home = { url: homeUrl, type: 'home', label: 'Home', slug: '00-home', source: 'entrada', text: 'Home' };
  if (max === 1) return [home];

  const navLinks = await fromPage(page);
  const sitemapUrls = opts.noSitemap ? [] : await fromSitemap(context, origin, log, 400);

  const seen = new Set([homeUrl.replace(/\/$/, '')]);
  const pool = [];
  const add = (url, source, text) => {
    const key = url.replace(/\/$/, '');
    if (seen.has(key)) return;
    seen.add(key);
    const c = classify(url);
    if (c.type === 'checkout' || c.type === 'login') return; // no tocamos flujos con datos personales
    pool.push(Object.assign({ url, source, text: text || '' }, c));
  };

  // el nav manda: es la arquitectura de información que eligió el cliente
  navLinks.filter((l) => l.zone === 'nav').forEach((l) => add(l.url, 'nav', l.text));
  sitemapUrls.forEach((u) => add(u, 'sitemap'));
  navLinks.filter((l) => l.zone !== 'nav').forEach((l) => add(l.url, l.zone, l.text));

  /* una por tipo, siguiendo la prioridad, y preferimos rutas cortas */
  const byType = new Map();
  pool.forEach((p) => {
    if (!byType.has(p.type)) byType.set(p.type, []);
    byType.get(p.type).push(p);
  });
  byType.forEach((list) =>
    list.sort((a, b) => {
      const score = (x) => (x.source === 'nav' ? -2 : x.source === 'sitemap' ? 0 : 1) + x.url.length / 500;
      return score(a) - score(b);
    })
  );

  const picked = [home];
  for (const type of PRIORITY) {
    if (picked.length >= max) break;
    const list = byType.get(type);
    if (list && list.length) picked.push(list.shift());
  }
  // si sobra cupo, completamos con lo que quede (más tipos repetidos)
  const rest = [];
  byType.forEach((list) => rest.push.apply(rest, list));
  rest.sort((a, b) => PRIORITY.indexOf(a.type) - PRIORITY.indexOf(b.type) || a.url.length - b.url.length);
  while (picked.length < max && rest.length) picked.push(rest.shift());

  picked.forEach((p, i) => {
    if (!p.slug) p.slug = `${String(i).padStart(2, '0')}-${p.type}-${slugify(p.url)}`.slice(0, 60);
  });

  log(`páginas a analizar (${picked.length}): ${picked.map((p) => `${p.label} ${new URL(p.url).pathname}`).join(' | ')}`);
  return picked;
}

module.exports = { discoverPages, classify, slugify, PRIORITY };
